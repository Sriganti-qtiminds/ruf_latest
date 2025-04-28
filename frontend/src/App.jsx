import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import InitialLandingPage from "./UserView/components/InitialLandingView";
import NotfoundView from "./components/CommonViews/NotfoundView";
import UnauthorizeView from "./components/CommonViews/UnauthorizeView";

// Main Layouts
import UserLayout from "./UserView/layout/UserLayout";
import AdminLayout from "./AdminView/layout/AdminLayout";

// Import User Components
import UserLandingView from "./UserView/components/UserLandingView";
import MyListingsView from "./UserView/components/MyListingsView";
import PostPropertiesView from "./UserView/components/PostPropertyView";
import FavoritesView from "./UserView/components/FavoritesView";
import ProfileView from "./UserView/components/ProfileView";
import UserTransactionsView from "./UserView/components/UserTransactions";
import ServicesView from "./UserView/components/ServicesView";

// Import RM Components
import RMView from "./RmView/RmView";

// Import FM Components
import FMView from "./FmView/FmView";

// Import Enquiries Component
import EnquiriesView from "./EnquiriesView";

// Import Admin Components
import Dashboard from "./AdminView/components/DashboardView";
import { PropertyListings } from "./AdminView/components/PropertyListingsView";
import Requests from "./AdminView/components/RequestsView";
import StaffAssignment from "./AdminView/components/StaffAssignemntView";

import Communities from "./AdminView/components/AddCommunityView/CommunityPage";
import UserManagement from "./AdminView/components/UserManagementView";
import DBTables from "./AdminView/components/DBTables";

import AuthModal from "./components/CommonViews/AuthModalView";

// Protected Route
import ProtectedRoute from "./routes/ProtectedRoute";

// Common Routes
import ChatBot from "./components/CommonViews/ChatBot";

import FooterPage from "./UserView/components/InitialLandingView/FooterViews/FooterPage";

import "./App.css";

const App = () => {
  const navigate = useNavigate();

  const [loginModel, setLoginModel] = useState(true);
  const onCloseModel = () => {
    setLoginModel(!loginModel);
    navigate("/");
  };
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => console.log("Razorpay script loaded!");
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<InitialLandingPage />} />
        {/* <Route path="user-landing" element={<UserLandingView />} /> */}
        <Route
          path="signup"
          element={<AuthModal isOpen={loginModel} onClose={onCloseModel} />}
        />

        <Route path="/footer/:section" element={<FooterPage />} />

        {/* User Routes */}
        {/* <Route element={<ProtectedRoute roles={["user"]} />}> */}

        <Route path="/property/rent" element={<UserLayout />}>
          <Route index element={<UserLandingView />} />
          <Route path="mylistings" element={<MyListingsView />} />
          <Route path="postProperties" element={<PostPropertiesView />} />
          <Route path="myfavorites" element={<FavoritesView />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="transactions" element={<UserTransactionsView />} />
          <Route path="myservices" element={<ServicesView />} />
        </Route>
        {/* </Route> */}

        <Route element={<ProtectedRoute roles={["RM", "Admin"]} />}>
          <Route index path="enquiries" element={<EnquiriesView />} />
        </Route>

        {/* RM Routes */}
        <Route element={<ProtectedRoute roles={["RM"]} />}>
          <Route index path="RM" element={<RMView />} />
        </Route>

        {/* RM Routes */}
        <Route element={<ProtectedRoute roles={["FM"]} />}>
          <Route index path="FM" element={<FMView />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute roles={["Admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="properties" element={<PropertyListings />} />
            <Route path="requests" element={<Requests />} />

            <Route path="assign-managers" element={<StaffAssignment />} />
            <Route path="communities" element={<Communities />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="db-tables" element={<DBTables />} />
            <Route path="reports" element={<div>Reports View</div>} />
            <Route path="profile" element={<ProfileView />} />
          </Route>
        </Route>

        {/* Unauthorized Route */}
        <Route path="/unauthorize" element={<UnauthorizeView />} />

        {/* Catch-All Route */}
        <Route path="*" element={<NotfoundView />} />
      </Routes>
      <ChatBot />
    </>
  );
};

export default App;
