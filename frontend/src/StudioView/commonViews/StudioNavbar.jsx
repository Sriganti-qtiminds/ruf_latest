import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

import AuthModal from "../../components/CommonViews/AuthModalView";
import StudioProfileDropdown from "./StudioProfileDropdown";

import { studioTailwindStyles } from "../../utils/studioTailwindStyles";

const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;



const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const jwtToken = Cookies.get(jwtSecretKey);
  const isLogin = jwtToken !== undefined;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <nav
        className={`bg-[#1A1F3D] md:${
          isScrolled || location.pathname !== "/studio"
            ? "w-full sticky top-0 left-0"
            : "w-[calc(100vw-100px)] mx-auto"
        } w-full py-1 px-5 md:px-10 flex flex-col justify-between items-center z-30 transition-all duration-200 ease-linear`}
      >
        <div className="container mx-auto py-2 flex justify-between items-center font-semibold">
          <div className="flex items-center">
            <button
              onClick={() => {
                navigate("/studio");
              }}
            >
              <img src="RUFRENT6.png" className="h-6 lg:h-8" />
              <div className="justify-self-start">
                <span
                  className={`${studioTailwindStyles.paragraph_2} pl-1 tracking-widest text-white`}
                >
                  Studio
                </span>
              </div>
            </button>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-8">
            {/* {navigation.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={`${studioTailwindStyles.header_item}`}
              >
                {link.text}
              </a>
            ))} */}
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
          </div>
        </div>
      </nav>
      <AuthModal
        isOpen={isModalOpen}
        onClose={closeModal}
        triggerBy="/studio"
      />
    </>
  );
};

export default Navbar;
