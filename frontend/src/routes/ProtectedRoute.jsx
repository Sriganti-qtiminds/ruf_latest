import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useRoleStore } from "../store/roleStore";

const ProtectedRoute = ({ roles }) => {
  const { userData } = useRoleStore();

  // Redirect to home if no role
  if (!userData?.role) {
    return <Navigate to="/" replace />;
  }

  // Match user role with allowed roles
  const userRole =
    userData.role.toLowerCase() === "user"
      ? "User"
      : userData.role.toLowerCase() === "rm"
        ? "RM"
        : userData.role.toLowerCase() === "fm"
          ? "FM"
          : userData.role.toLowerCase() === "admin"
            ? "Admin"
            : null;

  if (!roles.includes(userRole)) {
    return <Navigate to="/unauthorize" replace />;
  }

  // Render nested routes or a specific component
  return <Outlet />;
};

export default ProtectedRoute;
