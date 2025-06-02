// Navbar.jsx (updated)
import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useRoleStore } from "../../store/roleStore";
import useUserListingsStore from "../../store/userListingsStore";
import useActionsListingsStore from "../../store/userActionsListingsStore";
//import useTransactionsStore from "../../store/transactionsStore";
import tailwindStyles from "../../utils/tailwindStyles";
import AuthModal from "./AuthModalView";
import SyncNotification from "../../UserView/components/NotificationsViewNew";
import ProfileDropdown from "./ProfileDropdown";
import MenuDropdown from "./MenuDropdown"; // Import the new MenuDropdown

const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;
  const { userData } = useRoleStore();
  const { role } = userData;
  const { apiResponse } = useUserListingsStore();
  const { userProperties } = useActionsListingsStore();
  //const { receipts } = useTransactionsStore();

  const jwtToken = Cookies.get(jwtSecretKey);
  const isLogin = jwtToken !== undefined;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [intendedPath, setIntendedPath] = useState(null);
  const [navItems, setNavItems] = useState([]);

  const mylistingsCount = apiResponse.data.length;
  const favoritesCount = userProperties.length;
  // const receiptsCount = receipts.length;

  useEffect(() => {
    const updatedItems = [];
    if (mylistingsCount > 0) {
      updatedItems.push({ path: "mylistings", label: "My Listings" });
    }
    if (favoritesCount > 0) {
      updatedItems.push({ path: "myfavorites", label: "My Favorites" });
    }
    // if (receiptsCount > 0) {
    //   updatedItems.push({ path: "myservices", label: "My Services" });
    // }
    setNavItems(updatedItems);
    // }, [apiResponse, userProperties, receipts]);
  }, [apiResponse, userProperties]);

  const openModal = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIntendedPath(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (path) => {
    setIsMenuOpen(false);
    if (!isLogin) {
      path=`/property/rent/${path}`;
      setIntendedPath(path);
      openModal();
    } else {
      navigate(`/property/rent/${path}`);
    }
  };

  const onClickMain = () => {
    navigate("/");
  };

  return (
    <>
      <header
        className={`${tailwindStyles.header} md:${
          isScrolled || location.pathname !== "/"
            ? "w-full sticky top-0 left-0"
            : "w-[calc(100vw-100px)] mx-auto"
        } w-full p-3 px-5 md:px-10 flex flex-col justify-between items-center shadow-md z-30 transition-all duration-200 ease-linear relative`}
      >
        <div className="w-full flex justify-between items-center">
          <button onClick={onClickMain}>
            <img
              src="/RUFRENT6.png"
              alt="logo"
              className={`${tailwindStyles.logo}`}
            />
            <div className="justify-self-start">
              <span
                className={`text-xs md:text-sm lg:text-md pl-1 tracking-widest text-white`}
              >
                Rentals
              </span>
            </div>
          </button>

          <div className="flex items-center space-x-6 lg:hidden z-30">
            {isLogin ? (
              <ProfileDropdown
                toggleMenu={() => {
                  setIsMenuOpen(false);
                }}
              />
            ) : (
              <button
                onClick={openModal}
                className={`${tailwindStyles.header_item}`}
              >
                Login
              </button>
            )}
            <button
              className={`text-xl`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
          </div>

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
            {isLogin && role == "rm" && (
              <NavLink
                to="/rm"
                className={`${tailwindStyles.header_item} flex items-center`}
              >
                RM Dashboard
              </NavLink>
            )}
            {isLogin && role == "fm" && (
              <NavLink
                to="/fm"
                className={`${tailwindStyles.header_item} flex items-center`}
              >
                FM Dashboard
              </NavLink>
            )}
            {isLogin && role == "admin" && (
              <NavLink
                to="/admin"
                className={`${tailwindStyles.header_item} flex items-center`}
              >
                Admin Dashboard
              </NavLink>
            )}
            {isLogin && (role == "admin" || role == "rm") && (
              <NavLink
                to="/enquiries"
                className={`${tailwindStyles.header_item} flex items-center 
                  ${
                    activePath === `/enquiries`
                      ? `${tailwindStyles.activeTab}`
                      : ``
                  }
                `}
              >
                Enquiries
              </NavLink>
            )}
            {isLogin && (
              <>
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    className={`${tailwindStyles.header_item} flex items-center ${
                      activePath === `/property/rent/${item.path}`
                        ? `${tailwindStyles.activeTab}`
                        : ``
                    }`}
                    onClick={() => handleLinkClick(item.path)}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </>
            )}
            {isLogin && (
              <div className="space-x-0">
                <SyncNotification />
              </div>
            )}
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
            <MenuDropdown />{" "}
            {/* Replace the old Menu button with MenuDropdown */}
          </nav>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-[#001433] shadow-lg z-30 transition-all duration-200 ease-in-out">
            <div className="flex flex-col items-center py-6">
              {role == "rm" && (
                <NavLink
                  to="/rm"
                  className={`${tailwindStyles.header_item} flex items-center`}
                >
                  RM Dashboard
                </NavLink>
              )}
              {role == "fm" && (
                <NavLink
                  to="/fm"
                  className={`${tailwindStyles.header_item} flex items-center`}
                >
                  FM Dashboard
                </NavLink>
              )}
              {role == "admin" && (
                <NavLink
                  to="/admin"
                  className={`${tailwindStyles.header_item} flex items-center`}
                >
                  Admin Dashboard
                </NavLink>
              )}
              {isLogin && (role == "admin" || role == "rm") && (
                <NavLink
                  to="/enquiries"
                  className={`${tailwindStyles.header_item} mt-2 lg:mt-0 flex items-center 
                  ${
                    activePath === `/enquiries`
                      ? `${tailwindStyles.activeTab}`
                      : ``
                  }
                `}
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
              {isLogin && (
                <>
                  {navItems.map((item) => (
                    <button
                      key={item.path}
                      className={`${tailwindStyles.header_item} flex mb-4 items-center ${
                        activePath === `/property/rent/${item.path}`
                          ? `${tailwindStyles.activeTab}`
                          : ``
                      }`}
                      onClick={() => handleLinkClick(item.path)}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </>
              )}
              {isLogin && (
                <div className="mb-4">
                  <SyncNotification />
                </div>
              )}
              <MenuDropdown onCloseMobileMenu={() => setIsMenuOpen(false)} />
            </div>
          </div>
        )}
      </header>
      <AuthModal
        isOpen={isModalOpen}
        onClose={closeModal}
        triggerBy={intendedPath}
      />
    </>
  );
};

export default Navbar;
