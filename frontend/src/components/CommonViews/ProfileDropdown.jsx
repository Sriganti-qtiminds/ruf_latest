// ProfileDropdown.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;

import useListingStore from "../../store/listingsStore";
import useFilterStore from "../../store/filterStore";
import useActionsListingsStore from "../../store/userActionsListingsStore";
import { useRoleStore } from "../../store/roleStore";

const ProfileDropdown = ({ toggleMenu }) => {
  const navigate = useNavigate();

  const resetFilters = useFilterStore((state) => state.resetStore);
  const resetActionsStore = useActionsListingsStore(
    (state) => state.resetStore
  );

  const { userData, resetStore } = useRoleStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = [
    { label: "Profile", path: "profile" },
    { label: "My Transaction", path: "transactions" },
    //{ label: "My Services", path: "/" },
    { label: "Logout", action: () => handleLogout() },
  ];

  const handleLogout = async () => {
    try {
      // Clear all cookies
      Cookies.remove(jwtSecretKey);
      await resetFilters();
      await resetActionsStore();
      await resetStore();

      // Clear localStorage
      localStorage.clear();

      // Navigate to login
      navigate("/", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    toggleMenu();
  };

  const handleItemClick = (path, action) => {
    setIsOpen(false);
    if (path) {
      navigate(`/property/rent/${path}`);
    } else if (action) {
      action();
    }
  };

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40"
          onClick={() => setIsOpen(false)}
        />
      )} */}
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
    </>
  );
};

export default ProfileDropdown;
