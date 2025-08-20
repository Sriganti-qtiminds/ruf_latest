



import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";


// Route Constants
import {
  ADMIN_BASE,
  RM_BASE,
  FM_BASE,
  RENTALS_BASE,
  STUDIO_BASE,
  ENQUIRIES_PATH,
  FOOTER_PATH,
} from "../src/routes/routesPath";

// Components
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
import Reviews from "./AdminView/components/Reviews";
import AuthModal from "./components/CommonViews/AuthModalView";

// Protected Route
import ProtectedRoute from "./routes/ProtectedRoute";

// Common Routes
import ChatBot from "./components/CommonViews/ChatBot";

import FooterPage from "./UserView/components/InitialLandingView/FooterViews/FooterPage";
import StudioUserLayout from "./StudioView/layout/StudioUserLayout";
import StudioLandingView from "./StudioView/components/InitialLandingView";
import StudioDashboard from "./StudioView/components/InitialLandingView/StudioDashboard";
import ProjectStatus from "./StudioView/components/ProjectStatus";

import "./App.css";
import AdminBoard from "./StudioView/adminboard/AdminBoard";

const App = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [intendedPath, setIntendedPath] = useState(null);

  useEffect(() => {
   
  }, [isModalOpen, intendedPath]);

  const onCloseModal = () => {
   
    setIsModalOpen(false);
    setIntendedPath(null);
    navigate("/");
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => console.log("App: Razorpay script loaded");
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const passProps = {
    isModalOpen,
    setIsModalOpen,
    intendedPath,
    setIntendedPath,
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<InitialLandingPage {...passProps} />} />
        <Route path={`${FOOTER_PATH}/:section`} element={<FooterPage />} />
        <Route path={`${STUDIO_BASE}`} element={<StudioUserLayout {...passProps} />}>
          <Route index element={<StudioLandingView />} />
          <Route path="studioDashboard" element={<StudioDashboard />} />
          <Route path="projectStatus" element={<ProjectStatus />} />
          <Route path="profile" element={<ProfileView />} />
        </Route>

        {/* User Routes */}
    
        <Route path={`${RENTALS_BASE}`} element={<UserLayout {...passProps} />}>

          <Route index element={<UserLandingView />} />

          {/* Protect only the specific child routes */}
          <Route
            element={<ProtectedRoute roles={["User", "Admin", "RM", "FM"]} {...passProps} />}
          >
            <Route path="mylistings" element={<MyListingsView />} />
            <Route path="postProperties" element={<PostPropertiesView />} />
            <Route path="myfavorites" element={<FavoritesView />} />
            <Route path="profile" element={<ProfileView />} />
            <Route path="transactions" element={<UserTransactionsView />} />
            <Route path="myservices" element={<ServicesView />} />
          </Route>
        </Route>


        {/* Common Routes */}
        <Route
          element={<ProtectedRoute roles={["RM", "Admin"]} {...passProps} />}
        >
          <Route path={ENQUIRIES_PATH} element={<EnquiriesView />} />
        </Route>
        <Route element={<ProtectedRoute roles={["Admin"]}/>}>
          <Route path={"/base/studio/AdminBoard"} element={<AdminBoard/>} />
        </Route>

        {/* RM Route */}
        <Route element={<ProtectedRoute roles={["RM"]} {...passProps} />}>
          <Route path={RM_BASE} element={<RMView />} />
        </Route>

        {/* FM Route */}
        <Route element={<ProtectedRoute roles={["FM"]} {...passProps} />}>
          <Route path={FM_BASE} element={<FMView />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute roles={["Admin"]} {...passProps} />}>
          <Route path={ADMIN_BASE} element={<AdminLayout {...passProps} />}>
            <Route index element={<Dashboard />} />
            <Route path="properties" element={<PropertyListings />} />
            <Route path="requests" element={<Requests />} />
            <Route path="testimonials" element={<Reviews />} />
            <Route path="assign-managers" element={<StaffAssignment />} />
            <Route path="communities" element={<Communities />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="db-tables" element={<DBTables />} />
            <Route path="reports" element={<div>Reports View</div>} />
            <Route path="profile" element={<ProfileView />} />
          </Route>
        </Route>

        {/* Fallback Routes */}
        <Route path="/unauthorize" element={<UnauthorizeView />} />
        <Route path="*" element={<NotfoundView />} />
      </Routes>

      <AuthModal isOpen={isModalOpen} onClose={onCloseModal} triggerBy={intendedPath} />
      <ChatBot />
    </>
  );
};

App.propTypes = {
  isModalOpen: PropTypes.bool,
  setIsModalOpen: PropTypes.func,
  intendedPath: PropTypes.string,
  setIntendedPath: PropTypes.func,
};

export default App;

