import React from 'react';

function Header({ setIsSidebarOpen }) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between">
      <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-primary">
        <i className="ri-menu-line text-lg"></i>
      </button>
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <i className="ri-user-smile-line text-white"></i>
        </div>
        <span>Vendor - Pavan</span>
      </div>
    </header>
  );
}

export default Header;