import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const NotificationBell = ({ userId, onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // Fetch initial unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data } = await axios.get(`${apiUrl}/noti/unread/${userId}`);
        setUnreadCount(data.notifications?.length || 0);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    if (userId) {
      fetchUnreadCount();
    }
  }, [userId]);

  // Set up Socket.IO for real-time notification updates
  useEffect(() => {
    if (!userId) return;

    const newSocket = io(`${apiUrl}/notifications`, {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    // Log connection status
    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server:", newSocket.id);
      newSocket.emit("joinNotifications", userId);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      // Attempt to reconnect manually if needed
      if (newSocket && !newSocket.connected) {
        console.log("Attempting to reconnect...");
        newSocket.connect();
      }
    });

    newSocket.on("reconnect", (attempt) => {
      console.log("Reconnected to Socket.IO server after", attempt, "attempts");
      newSocket.emit("joinNotifications", userId); // Rejoin room after reconnect
    });

    newSocket.on("receiveNotification", (notifications) => {
      console.log("New Notification Received:", notifications);
      if (Array.isArray(notifications)) {
        // Increment the unread count by the number of new notifications
        setUnreadCount((prevCount) => prevCount + notifications.length);
      }
    });

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.off("connect");
        newSocket.off("connect_error");
        newSocket.off("reconnect");
        newSocket.off("receiveNotification");
        newSocket.disconnect();
      }
    };
  }, [userId]);

  return (
    <button onClick={onClick} className="relative flex items-center">
      <img src="/Navbar/Bell.png" className="h-6" />
      {unreadCount > 0 && (
        <span className="absolute top-1  bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 leading-none transform -translate-y-1/2 -translate-x-1/2">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
