require("dotenv").config();
const express = require("express");
const http = require("http");
const https = require("https");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const tablesRoutes = require("./routes/tablesRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const NotificationService = require("./utils/notificationService");
const sendScheduledNotifications = require("./utils/cronjob");

const app = express();
const PORT = process.env.PORT || 5000;
const DEPLOYMENT = process.env.DEPLOYMENT === "true";

let server;

// Check if deployment is enabled (use HTTPS for deployment, HTTP for local)
if (DEPLOYMENT) {
  const sslOptions = {
    cert: fs.readFileSync(process.env.SSL_PROD_CERT_PATH),
    key: fs.readFileSync(process.env.SSL_PROD_KEY_PATH),
  };
  server = https.createServer(sslOptions, app);
  console.log("Running in DEPLOYMENT mode with HTTPS.");
} else {
  const sslOptions = {
    cert: fs.readFileSync(process.env.SSL_LOCAL_CERT_PATH),
    key: fs.readFileSync(process.env.SSL_LOCAL_KEY_PATH),
  };
  server = http.createServer(sslOptions, app);
  console.log("Running in LOCAL mode with HTTP.");
}

// Socket.IO setup with stricter CORS in production
const io = socketIo(server, {
  cors: {
    origin: DEPLOYMENT ? process.env.ALLOWED_ORIGINS : "*", // e.g., "https://yourdomain.com"
    methods: ["GET", "POST"],
  },
});

// Store online users
const onlineUsers = new Map();

// Instantiate NotificationService with io and onlineUsers
const notificationService = new NotificationService(io, onlineUsers);

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Use consistent namespace: /api/notifications (matches NotificationService)
const notificationNamespace = io.of("/api/notifications");

notificationNamespace.on("connection", (socket) => {
  console.log(
    `User connected to /api/notifications with socket ID: ${socket.id}`
  );

  socket.on("joinNotifications", async (userId) => {
    if (!userId || typeof userId !== "string") {
      console.error("Invalid userId:", userId);
      socket.emit("error", { message: "Invalid userId" });
      return;
    }

    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    console.log(
      `User ${userId} joined notification room with socket ID ${socket.id}`
    );

    try {
      // Fetch and emit initial unread notifications with a different event
      const notifications = await notificationService.getUserNotifications(
        userId
      );
      socket.emit(
        "initialNotifications",
        Array.isArray(notifications) ? notifications : []
      );
      console.log(
        `Sent initial notifications to user ${userId}:`,
        notifications
      );
    } catch (error) {
      console.error(
        `Error fetching initial notifications for ${userId}:`,
        error.message
      );
      socket.emit("error", {
        message: "Failed to fetch initial notifications",
      });
    }
  });

  socket.on("disconnect", () => {
    const disconnectedUser = [...onlineUsers.entries()].find(
      ([_, value]) => value === socket.id
    );
    if (disconnectedUser) {
      onlineUsers.delete(disconnectedUser[0]);
      console.log(`User ${disconnectedUser[0]} disconnected.`);
    }
  });
});

// Start scheduled notifications
sendScheduledNotifications(io, onlineUsers);

// Routes
app.use("/api", tablesRoutes);
app.use("/api/noti", notificationRoutes(io, onlineUsers));

// Start the server
server.listen(PORT, () => {
  console.log(
    `Server running on ${
      DEPLOYMENT ? "HTTPS" : "HTTP"
    } at http://localhost:${PORT}`
  );
});
