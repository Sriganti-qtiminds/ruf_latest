import React from "react";
import { useNavigate } from "react-router-dom";
import { STUDIO_BASE } from "../../../routes/routesPath";
import { studioTailwindStyles } from '../../../utils/studioTailwindStyles';

const VendorSidebar = ({ isOpen, toggleSidebar, activeSection, setActiveSection }) => {
  const navItems = [
    { section: "dashboard", icon: "ri-dashboard-line", label: "Dashboard" },
    { section: "tasks", icon: "ri-task-line", label: "Tasks" },
    { section: "payments", icon: "ri-wallet-line", label: "Payments" },
  ];

    const navigate = useNavigate();
   

  return (
    <aside
      className={`sidebar fixed top-0 left-0 w-64 h-full bg-primary text-white flex flex-col z-50 md:transform-none ${
        isOpen ? "" : "sidebar-hidden"
      }`}
    >
      <div className="p-6 flex items-center justify-between">
        <button onClick={() => navigate(`${STUDIO_BASE}`)}>
                     <img src="/RUFRENT6.png" className="h-6 lg:h-8" alt="RUFRENT" />
                     <div className="justify-self-start">
                       <span
                         className={`${studioTailwindStyles.paragraph_2} pl-1 tracking-widest text-white`}
                       >
                         Studio
                       </span>
                     </div>
                   </button>
        <button onClick={toggleSidebar} className="md:hidden">
          <i className="ri-close-line ri-lg"></i>
        </button>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.section}
            onClick={() => {
              setActiveSection(item.section);
              toggleSidebar();
            }}
            className={`flex items-center p-3 rounded-lg hover:bg-secondary transition-colors w-full text-left ${
              activeSection === item.section ? "bg-secondary" : ""
            }`}
          >
            <i className={`${item.icon} ri-lg mr-3`}></i>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default VendorSidebar;