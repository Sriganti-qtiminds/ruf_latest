// MenuDropdown.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import tailwindStyles from "../../utils/tailwindStyles"; // Assuming this contains your Tailwind style configurations

const footerSections = [
  {
    id: "about-us",
    label: "About Us",
  },
  {
    id: "rr-package",
    label: "RR Package",
  },
  {
    id: "tenants",
    label: "Tenants",
  },
  {
    id: "owners",
    label: "Owners",
  },
  {
    id: "terms-and-conditions",
    label: "T&C's",
  },
  {
    id: "team",
    label: "Team",
  },
  {
    id: "contact-us",
    label: "Contact Us",
  },
];

const MenuDropdown = ({ onCloseMobileMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (path) => {
    setIsOpen(false);
    if (onCloseMobileMenu) onCloseMobileMenu(); // Close mobile menu if provided
  };

  // Handle clicks outside the dropdown
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
    <div className="hidden lg:flex relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`${tailwindStyles.header_item} flex items-center`}
      >
        ☰ Menu
      </button>

      {isOpen && (
        <div className=" absolute top-8 -right-10 mt-2 w-32 bg-white rounded-md shadow-lg z-50">
          {footerSections.map((section) => (
            <NavLink
              key={section.id}
              to={`/footer/${section.id}`}
              className={({ isActive }) =>
                `${tailwindStyles.header_item} 
                 block 
                 w-full 
                 text-left 
                 px-4 
                 py-2 
                 text-sm 
                 text-gray-700 
                 hover:bg-gray-100 
                 ${isActive ? "text-[#001433] font-bold underline" : ""}`
              }
              onClick={() => handleItemClick(`/footer/${section.id}`)}
            >
              {section.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;
