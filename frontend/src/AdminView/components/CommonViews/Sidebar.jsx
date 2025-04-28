import React from "react";
import { NavLink } from "react-router-dom";
import tailwindStyles from "../../../utils/tailwindStyles";
import {
  LayoutDashboard,
  Home,
  MessageSquare,
  UserCog,
  UserRoundCheck,
  Building2,
  Table2,
  ClipboardPlus,
} from "lucide-react";

const Sidebar = () => {
  const navItems = [
    {
      path: "/admin",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      exact: true, // To ensure it's exact for the dashboard link
    },
    {
      path: "properties",
      icon: <Home size={20} />,
      label: "Property Listings",
    },
    {
      path: "requests",
      icon: <MessageSquare size={20} />,
      label: "Requests",
    },
    {
      path: "assign-managers",
      icon: <UserCog size={20} />,
      label: "Staff Assignment",
    },
    {
      path: "communities",
      icon: <Building2 size={20} />,
      label: "Communities",
    },
    {
      path: "user-management",
      icon: <UserRoundCheck size={20} />,
      label: "User Management",
    },
    {
      path: "db-tables",
      icon: <Table2 size={20} />,
      label: "DB Tables",
    },
    {
      path: "reports",
      icon: <ClipboardPlus size={20} />,
      label: "Reports",
    },
  ];

  return (
    <div className="bg-[#001433] text-gray-300 w-64 min-h-screen p-4">
      <NavLink to="/">
        <div className="mb-6">
          <img src="/RUFRENT6.png" className={`${tailwindStyles.logo}`} />
        </div>
      </NavLink>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact} // Ensures exact match for Dashboard
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
