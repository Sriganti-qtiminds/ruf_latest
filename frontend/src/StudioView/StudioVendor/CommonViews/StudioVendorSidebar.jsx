import React from 'react';
import { useNavigate } from 'react-router-dom';

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const navItems = [
    { path: '/dashboard', icon: 'ri-dashboard-line', label: 'Dashboard' },
    { path: '/tasks', icon: 'ri-task-line', label: 'Tasks' },
    { path: '/payments', icon: 'ri-wallet-line', label: 'Payments' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 w-64 h-full bg-primary text-white flex flex-col z-50 md:transform-none transition-transform duration-300 ease-in-out ${
        isOpen ? '' : '-translate-x-full'
      }`}
    >
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
        <button onClick={() => setIsOpen(false)} className="md:hidden">
          <i className="ri-close-line text-lg"></i>
        </button>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setIsOpen(false);
            }}
            className={`flex items-center p-3 rounded-lg hover:bg-secondary transition-colors w-full text-left ${
              window.location.pathname === item.path ? 'bg-secondary' : ''
            }`}
          >
            <i className={`${item.icon} text-lg mr-3`}></i>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;