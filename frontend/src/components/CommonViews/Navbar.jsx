


import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import PropTypes from "prop-types";
import { useRoleStore } from "../../store/roleStore";
import useUserListingsStore from "../../store/userListingsStore";
import useActionsListingsStore from "../../store/userActionsListingsStore";
import tailwindStyles from "../../utils/tailwindStyles";
import AuthModal from "./AuthModalView";
import SyncNotification from "../../UserView/components/NotificationsViewNew";
import ProfileDropdown from "./ProfileDropdown";
import MenuDropdown from "./MenuDropdown";

// Import route constants
import {
  RENTALS_BASE,
  ADMIN_BASE,
  RM_BASE,
  FM_BASE,
  ENQUIRIES_PATH,
} from "../../routes/routesPath";

const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;

const Navbar = ({ intendedPath, setIntendedPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;

  const { userData } = useRoleStore();
  const { role } = userData || {};
  const { apiResponse } = useUserListingsStore();
  const { userProperties } = useActionsListingsStore();

  const jwtToken = Cookies.get(jwtSecretKey);
  const isLogin = !!jwtToken;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [navItems, setNavItems] = useState([]);

  const mylistingsCount = apiResponse?.data?.length || 0;
  const favoritesCount = userProperties?.length || 0;

  useEffect(() => {
    console.log(
      "Navbar: Props -",
      "intendedPath:", intendedPath,
      "setIntendedPath:", typeof setIntendedPath,
      "location:", location.pathname
    );
    if (typeof setIntendedPath !== "function") {
      console.error("Navbar: setIntendedPath is missing or invalid");
    }
    const updatedItems = [];
    if (mylistingsCount > 0) {
      updatedItems.push({ path: "mylistings", label: "My Listings" });
    }
    if (favoritesCount > 0) {
      updatedItems.push({ path: "myfavorites", label: "My Favorites" });
    }
    setNavItems(updatedItems);
  }, [mylistingsCount, favoritesCount, intendedPath, setIntendedPath, location.pathname]);

  const openModal = () => {
    console.log("Navbar: openModal - isModalOpen:", isModalOpen);
    setIsModalOpen(true);
    setIsMenuOpen(false);
    console.log("Navbar: setIsModalOpen(true) called");
  };

  const closeModal = () => {
    console.log("Navbar: closeModal - Resetting modal state");
    setIsModalOpen(false);
    setIntendedPath(null);
  };

  const handleLinkClick = (path) => {
    const fullPath = `${RENTALS_BASE}/${path}`;
    console.log("Navbar: handleLinkClick - path:", fullPath, "isLogin:", isLogin);
    if (!isLogin) {
      if (typeof setIntendedPath === "function") {
        setIntendedPath(fullPath);
        console.log("Navbar: setIntendedPath:", fullPath);
      } else {
        console.error("Navbar: setIntendedPath is not a function, received:", setIntendedPath);
      }
      openModal();
      if (location.pathname !== "/") {
        navigate("/");
        console.log("Navbar: Navigated to /");
      }
    } else {
      navigate(fullPath);
      console.log("Navbar: Navigated to", fullPath);
    }
  };

  const onClickMain = () => {
    navigate("/");
    console.log("Navbar: Navigated to / via logo");
  };

  return (
    <>
      <header
        className={`${tailwindStyles.header} md:${
          location.pathname !== "/"
            ? "w-full sticky top-0 left-0"
            : "w-[calc(100vw-100px)] mx-auto"
        } w-full p-3 px-5 md:px-10 flex flex-col justify-between items-center shadow-md z-30 transition-all duration-200 ease-linear relative`}
      >
        <div className="w-full flex justify-between items-center">
          <button onClick={onClickMain}>
            <img src="/RUFRENT6.png" alt="logo" className={`${tailwindStyles.logo}`} />
            <div className="justify-self-start">
              <span className="text-xs md:text-sm lg:text-md pl-1 tracking-widest text-white">
                Rentals
              </span>
            </div>
          </button>

          {/* Mobile */}
          <div className="flex items-center space-x-6 lg:hidden z-30">
            {isLogin ? (
              <ProfileDropdown toggleMenu={() => setIsMenuOpen(false)} />
            ) : (
              <button onClick={openModal} className={`${tailwindStyles.header_item}`}>
                Login
              </button>
            )}
            <button className="text-xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ☰
            </button>
          </div>

          {/* Desktop */}
          <nav className="hidden lg:flex space-x-6 items-center justify-center">
            <div
              onClick={() => handleLinkClick("postProperties")}
              className="flex justify-center items-center w-40 h-7 bg-white rounded-md cursor-pointer"
            >
              <div className="font-semibold text-sm pb-0.5 text-gray-800 mr-2">
                Post Property
              </div>
              <div className="bg-green-700 text-white font-bold text-xs px-2 rounded-sm relative inline-block">
                FREE
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-green-300 transform skew-x-12 animate-pulse"></div>
              </div>
            </div>

            {/* Dashboards */}
            {isLogin && role === "rm" && (
              <NavLink to={RM_BASE} className={`${tailwindStyles.header_item}`}>
                RM Dashboard
              </NavLink>
            )}
            {isLogin && role === "fm" && (
              <NavLink to={FM_BASE} className={`${tailwindStyles.header_item}`}>
                FM Dashboard
              </NavLink>
            )}
            {isLogin && role === "admin" && (
              <NavLink to={ADMIN_BASE} className={`${tailwindStyles.header_item}`}>
                Admin Dashboard
              </NavLink>
            )}

            {/* Enquiries */}
            {isLogin && (role === "admin" || role === "rm") && (
              <NavLink
                to={ENQUIRIES_PATH}
                className={`${tailwindStyles.header_item} ${
                  activePath === ENQUIRIES_PATH ? tailwindStyles.activeTab : ""
                }`}
              >
                Enquiries
              </NavLink>
            )}

            {/* User Nav Items */}
            {isLogin &&
              navItems.map((item) => (
                <button
                  key={item.path}
                  className={`${tailwindStyles.header_item} ${
                    activePath === `${RENTALS_BASE}/${item.path}`
                      ? tailwindStyles.activeTab
                      : ""
                  }`}
                  onClick={() => handleLinkClick(item.path)}
                >
                  {item.label}
                </button>
              ))}

            {/* Notifications and Profile */}
            {isLogin && <SyncNotification />}
            {isLogin ? (
              <ProfileDropdown />
            ) : (
              <button
                onClick={openModal}
                className={`${tailwindStyles.header_item} hover:underline underline-offset-4`}
              >
                Login
              </button>
            )}
            <MenuDropdown />
          </nav>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#001433] shadow-lg z-30 transition-all duration-200 ease-in-out">
            <div className="flex flex-col items-center py-6">
              {role === "rm" && (
                <NavLink to={RM_BASE} className={tailwindStyles.header_item}>
                  RM Dashboard
                </NavLink>
              )}
              {role === "fm" && (
                <NavLink to={FM_BASE} className={tailwindStyles.header_item}>
                  FM Dashboard
                </NavLink>
              )}
              {role === "admin" && (
                <NavLink to={ADMIN_BASE} className={tailwindStyles.header_item}>
                  Admin Dashboard
                </NavLink>
              )}
              {isLogin && (role === "admin" || role === "rm") && (
                <NavLink
                  to={ENQUIRIES_PATH}
                  className={`${tailwindStyles.header_item} mt-2 lg:mt-0 ${
                    activePath === ENQUIRIES_PATH ? tailwindStyles.activeTab : ""
                  }`}
                >
                  Enquiries
                </NavLink>
              )}
              <div
                onClick={() => handleLinkClick("postProperties")}
                className="flex justify-center items-center w-40 h-7 my-4 bg-white rounded-md cursor-pointer"
              >
                <div className="font-semibold text-sm pb-0.5 text-gray-800 mr-2">
                  Post Property
                </div>
                <div className="bg-green-700 text-white font-bold text-xs px-2 rounded-sm relative inline-block">
                  FREE
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-green-300 transform skew-x-12 animate-pulse"></div>
                </div>
              </div>
              {isLogin &&
                navItems.map((item) => (
                  <button
                    key={item.path}
                    className={`${tailwindStyles.header_item} mb-4 ${
                      activePath === `${RENTALS_BASE}/${item.path}`
                        ? tailwindStyles.activeTab
                        : ""
                    }`}
                    onClick={() => handleLinkClick(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
              {isLogin && (
                <div className="mb-4">
                  <SyncNotification />
                </div>
              )}
              {!isLogin && (
                <button
                  onClick={openModal}
                  className={`${tailwindStyles.header_item} mb-4`}
                >
                  Login
                </button>
              )}
              <MenuDropdown onCloseMobileMenu={() => setIsMenuOpen(false)} />
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={isModalOpen} onClose={closeModal} triggerBy={intendedPath} />
    </>
  );
};

Navbar.propTypes = {
  intendedPath: PropTypes.string,
  setIntendedPath: PropTypes.func.isRequired,
};

export default Navbar;
