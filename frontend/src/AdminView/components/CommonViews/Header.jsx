import React from "react";
import { useRoleStore } from "../../../store/roleStore";

const Header = () => {
  const { userData } = useRoleStore();
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Welcome, {userData.userName}
        </h2>
      </div>
    </header>
  );
};

export default Header;
