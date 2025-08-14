

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import AuthModal from "../../components/CommonViews/AuthModalView";
import StudioProfileDropdown from "./StudioProfileDropdown";
import MobileMenu from "./MobileMenu";
import { studioTailwindStyles } from "../../utils/studioTailwindStyles";
import { STUDIO_BASE } from "../../routes/routesPath";
import { useRoleStore } from "../../store/roleStore";

const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const jwtToken = Cookies.get(jwtSecretKey);
  const isLogin = jwtToken !== undefined;

  const { userData } = useRoleStore(); // Get role from store
  const userRole = userData?.role; // "user", "admin", or null

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <nav
        className={`bg-[#1A1F3D] md:${
          isScrolled || location.pathname !== `${STUDIO_BASE}`
            ? "w-full sticky top-0 left-0"
            : "w-[calc(100vw-100px)] mx-auto"
        } w-full py-1 px-5 md:px-10 flex flex-col justify-between items-center z-30 transition-all duration-200 ease-linear`}
      >
        <div className="container mx-auto py-2 flex justify-between items-center font-semibold">
          {/* Logo / Landing Page Button */}
          <div className="flex items-center">
            <button onClick={() => navigate(`${STUDIO_BASE}`)}>
              <img src="/RUFRENT6.png" className="h-6 lg:h-8" alt="RUFRENT" />
              <div className="justify-self-start">
                <span
                  className={`${studioTailwindStyles.paragraph_2} pl-1 tracking-widest text-white`}
                >
                  Studio
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-8">
            <nav className="hidden md:flex items-center space-x-4">
              {/* Landing Page visible to all */}
             

              {/* Role-based Nav Items */}
              {userRole === "user" && (
                <>
                  <button
                    onClick={() => navigate(`${STUDIO_BASE}/StudioDashboard`)}
                    className={`${studioTailwindStyles.header_item} text-white hover:underline px-4 py-2`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate(`${STUDIO_BASE}/projectStatus`)}
                    className={`${studioTailwindStyles.header_item} text-white hover:underline px-4 py-2`}
                  >
                    Tasks
                  </button>
                </>
              )}

              {userRole === "admin" && (
                <button
                  onClick={() => navigate(`${STUDIO_BASE}/AdminBoard`)}
                  className={`${studioTailwindStyles.header_item} text-white hover:underline px-4 py-2`}
                >
                  Admin
                </button>
              )}
            </nav>

            {/* Login / Profile */}
            {isLogin ? (
              <StudioProfileDropdown />
            ) : (
              <button
                onClick={openModal}
                className={`${studioTailwindStyles.header_item}`}
              >
                Login
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white hover:text-gray-300 mr-4"
              onClick={toggleMobileMenu}
            >
              <div className="w-6 h-6 flex items-end justify-end">
                <i className="ri-menu-line text-lg"></i>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={closeModal}
        triggerBy={`${STUDIO_BASE}`}
      />
      <MobileMenu isOpen={isMobileMenuOpen} closeMobileMenu={toggleMobileMenu} />
    </>
  );
};

export default Navbar;
