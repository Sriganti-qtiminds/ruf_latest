const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");

const tablesRoutes = require("./routes/tablesRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const NotificationService = require("./utils/notificationService");
const sendScheduledNotifications = require("./utils/cronjob");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
const notificationService = new NotificationService();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Store online users in a Map: { userId: socketId }
const onlineUsers = new Map();

// Initialize the `/notifications` namespace
const notificationNamespace = io.of("/notifications");

notificationNamespace.on("connection", (socket) => {
  console.log(`User connected to /notifications with socket ID: ${socket.id}`);

  socket.on("joinNotifications", async (userId) => {
    if (userId) {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} joined notification room with socket ID ${socket.id}`);

      // Fetch and emit unread notifications
      const notifications = await notificationService.getUserNotifications(userId);
      console.log("User notifications", notifications);
      socket.emit("receiveNotification", Array.isArray(notifications) ? notifications : [notifications]);
    }
  });

  socket.on("disconnect", () => {
    const disconnectedUser = [...onlineUsers.entries()].find(([key, value]) => value === socket.id);
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
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});