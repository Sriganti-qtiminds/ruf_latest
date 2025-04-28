import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/CommonViews/Sidebar";
import Header from "../components/CommonViews/Header";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
