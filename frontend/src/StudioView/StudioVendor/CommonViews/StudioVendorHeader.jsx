import React from "react";
import { studioTailwindStyles } from '../../../utils/studioTailwindStyles';

const VendorHeader = ({ toggleSidebar }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between md:ml-64">
      <button onClick={toggleSidebar} className="md:hidden text-primary">
        <i className="ri-menu-line ri-lg"></i>
      </button>
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <i className="ri-user-smile-line text-white"></i>
        </div>
        <span className={studioTailwindStyles.paragraph_1}>Vendor - Shiva</span>
      </div>
    </header>
  );
};

export default VendorHeader;