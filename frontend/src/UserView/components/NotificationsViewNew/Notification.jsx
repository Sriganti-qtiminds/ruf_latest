import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

import { ChevronRight } from "lucide-react";

import tailwindStyles from "../../../utils/tailwindStyles"; // Import the Tailwind styles

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const NotificationComponent = ({ userId }) => {
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "unread"
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate(); // Add useNavigate hook

  // Fetch all notifications and separate into read and unread
  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/noti/all/${userId}`);
      console.log("All Notifications Data:", data);

      // Separate notifications into read and unread
      const unread = data.notifications.filter((n) => n.Status === 0);
      const read = data.notifications.filter((n) => n.Status === 1);

      setUnreadNotifications(unread);
      setAllNotifications(read);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  // Mark a single notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.patch(`${apiUrl}/noti/m_read`, {
        dy_noti_id: notificationId,
      });

      // Move the notification from unread to read
      const markedNotification = unreadNotifications.find(
        (n) => n.Id === notificationId
      );
      if (markedNotification) {
        setUnreadNotifications((prev) =>
          prev.filter((n) => n.Id !== notificationId)
        );
        setAllNotifications((prev) => [
          ...prev,
          { ...markedNotification, Status: 1 },
        ]);
      }

      console.log("Notification marked as read:", notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await axios.patch(`${apiUrl}/noti/markAllRead`, {
        userId,
      });

      // Move all unread notifications to read
      setAllNotifications((prev) => [
        ...prev,
        ...unreadNotifications.map((n) => ({ ...n, Status: 1 })),
      ]);
      setUnreadNotifications([]);

      console.log("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // WebSocket for real-time updates
  useEffect(() => {
    if (!userId) return;

    const newSocket = io(`${apiUrl}/notifications`, {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket:", newSocket.id);
      newSocket.emit("joinNotifications", userId);
    });

    newSocket.on("receiveNotification", (notifications) => {
      console.log("New Notification Received:", notifications);
      if (Array.isArray(notifications)) {
        // Add new notifications to the unread list
        setUnreadNotifications((prev) => [...notifications, ...prev]);
      }
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // Handle card click to navigate based on Notification_Id
  const handleCardClick = (notificationId) => {
    if (notificationId === 1 || notificationId === 2) {
      navigate("/user/mylistings");
    } else if (
      notificationId === 3 ||
      notificationId === 4 ||
      notificationId === 5
    ) {
      navigate("/user/myfavorites");
    }
  };

  // Combine notifications for rendering based on active tab
  const displayedNotifications =
    activeTab === "all"
      ? [...unreadNotifications, ...allNotifications]
      : unreadNotifications;

  return (
    <div className={`${tailwindStyles.mainBackground}`}>
      <div className="w-full">
        <div className="p-4">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-semibold rounded-md ${
                activeTab === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-600 hover:bg-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`px-4 py-2 text-sm font-semibold rounded-md ${
                activeTab === "unread"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-600 hover:bg-white"
              }`}
            >
              Unread ({unreadNotifications.length})
            </button>
          </div>

          {activeTab === "unread" && unreadNotifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="w-full mb-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
            >
              Mark All as Read
            </button>
          )}

          <h2
            className={`text-lg font-medium mb-4 ${tailwindStyles.heading_3}`}
          >
            {activeTab === "all" ? "All Notifications" : "Unread Notifications"}
          </h2>

          <div className="space-y-4 max-h-[400px] pb-14 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:white [&::-webkit-scrollbar-thumb]:bg-blue-300">
            {(activeTab === "all"
              ? [...unreadNotifications, ...allNotifications]
              : unreadNotifications
            ).map((notification, index) => {
              console.log("Notification Data:", notification);
              return (
                <div
                  key={notification.Id || index}
                  className={`p-4 rounded-lg ${tailwindStyles.whiteCard} shadow-md cursor-pointer`}
                  onClick={() => {
                    handleCardClick(notification.Notification_Id),
                      handleMarkAsRead(notification.Id);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-medium ${tailwindStyles.heading_4}`}
                        >
                          {notification.Type}
                        </h3>
                        {activeTab === "unread" && (
                          <button className="bg-blue-500 text-white p-1 rounded-md hover:bg-blue-600 transition">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className={`mt-1 ${tailwindStyles.paragraph}`}>
                        {notification.Text}
                      </p>
                      <p className={`mt-2 ${tailwindStyles.paragraph_b}`}>
                        {notification.CreateTime
                          ? new Date(notification.CreateTime).toLocaleString()
                          : "Unknown Date"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationComponent;
