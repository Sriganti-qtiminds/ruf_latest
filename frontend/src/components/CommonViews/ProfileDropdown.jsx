

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import useListingStore from "../../store/listingsStore";
import useFilterStore from "../../store/filterStore";
import useActionsListingsStore from "../../store/userActionsListingsStore";
import { useRoleStore } from "../../store/roleStore";

// Route constants
import { RENTALS_BASE } from "../../routes/routesPath";

const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;

const ProfileDropdown = ({ toggleMenu = () => {} }) => {
  const navigate = useNavigate();
  const resetFilters = useFilterStore((state) => state.resetStore);
  const resetActionsStore = useActionsListingsStore((state) => state.resetStore);
  const { resetStore } = useRoleStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = [
    { label: "Profile", path: "profile" },
    { label: "My Transaction", path: "transactions" },
    // { label: "My Services", path: "myservices" }, // Uncomment if needed
    { label: "Logout", action: () => handleLogout() },
  ];

  const handleLogout = async () => {
    try {
      Cookies.remove(jwtSecretKey);
      await resetFilters();
      await resetActionsStore();
      await resetStore();
      localStorage.clear();
      navigate("/", { replace: true });
      window.location.reload(); // Reload to reset all stores/UI
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    toggleMenu(); // Optional toggle hook from parent
  };

  const handleItemClick = (path, action) => {
    setIsOpen(false);
    if (path) {
      navigate(`${RENTALS_BASE}/${path}`);
    } else if (action) {
      action();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={handleToggle} className="cursor-pointer">
        <img
          src="/Navbar/User.png"
          alt="user_icon"
          className="h-7"
          style={{ color: "#FFC156" }}
        />
      </div>

      {isOpen && (
        <div className="absolute top-8 -right-14 md:-right-16 mt-2 w-36 bg-white rounded-md shadow-lg z-50">
          {menuItems.map((item, index) =>
            item.path ? (
              <button
                key={index}
                onClick={() => handleItemClick(item.path)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
              >
                {item.label}
              </button>
            ) : (
              <button
                key={index}
                onClick={() => handleItemClick(null, item.action)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
