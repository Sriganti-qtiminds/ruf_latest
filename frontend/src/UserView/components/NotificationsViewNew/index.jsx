import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

import NotificationBell from "./NotificatioBell";
import NotificationComponent from "./Notification";
import { useRoleStore } from "../../../store/roleStore";

import tailwindStyles from "../../../utils/tailwindStyles";

const SyncNotification = () => {
  const { userData } = useRoleStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const userId = userData.id; // Define the userId here

  // Toggle notifications visibility
  const handleNotificationBellClick = () => {
    setShowNotifications((prev) => !prev);
  };

  return (
    <>
      {/* Pass userId and the click handler to NotificationBell */}
      <NotificationBell userId={userId} onClick={handleNotificationBellClick} />
      {showNotifications && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleNotificationBellClick} // Close when clicking outside
        >
          <div
            className="fixed md:right-5 top-0  h-full md:h-[500px] w-full md:w-[300px] bg-gray-200 rounded-xl  shadow-xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div
              className={`p-4 border-b border-gray-200 flex justify-between items-center ${tailwindStyles.header}`}
            >
              <h1 className={`text-xl font-semibold`}>Notifications</h1>
            </div>
            <button
              onClick={handleNotificationBellClick}
              className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none text-2xl"
            >
              <X className="h-7 w-7" />
            </button>
            {/* Pass userId to NotificationComponent */}
            <NotificationComponent userId={userId} />
          </div>
        </div>
      )}
    </>
  );
};

export default SyncNotification;
