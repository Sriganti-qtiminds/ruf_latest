

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useRoleStore } from "../store/roleStore";

const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;

const ProtectedRoute = ({ roles, setIntendedPath, setIsModalOpen }) => {
  const { userData } = useRoleStore();
  const location = useLocation();
  const jwtToken = Cookies.get(jwtSecretKey);
  const isLogin = !!jwtToken;

  console.log("ProtectedRoute - isLogin:", isLogin, "userData:", userData, "location:", location.pathname);

  // If user is not logged in, redirect to landing page and open login modal
  if (!isLogin || !userData?.role) {
    console.log("Redirecting to / due to no login or no role");
    setIntendedPath(location.pathname);
    setIsModalOpen(true);
    return <Navigate to="/" replace />;
  }

  // Normalize user role
  const normalizedRole = userData.role ? userData.role.toLowerCase() : null;
  const userRole =
    normalizedRole === "user" || normalizedRole === "USER"
      ? "User"
      : normalizedRole === "rm"
      ? "RM"
      : normalizedRole === "fm"
      ? "FM"
      : normalizedRole === "admin"
      ? "Admin"
      : null;

  console.log("ProtectedRoute - userRole:", userRole, "allowed roles:", roles);

  if (!roles.includes(userRole)) {
    console.log("Redirecting to /unauthorize - role not allowed");
    return <Navigate to="/unauthorize" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

