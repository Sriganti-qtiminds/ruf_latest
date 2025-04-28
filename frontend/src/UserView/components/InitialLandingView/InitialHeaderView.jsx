import { useState, useEffect } from "react"; // Importing useState hook from React
import { Link } from "react-router-dom"; // Importing Link component for navigation

import tailwindStyles from "../../../utils/tailwindStyles"; // Importing custom Tailwind CSS styles
import AuthModal from "../../../components/CommonViews/AuthModalView"; // Importing the authentication modal component

const InitialHeaderView = () => {
  // State to control the visibility of the authentication modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to open & close the Login/signup modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Function to toggle the mobile menu visibility
  const toggleMenu = () => {
    document.getElementById("mobile-menu").classList.toggle("hidden");
  };

  return (
    <div
      className={`mx-auto  md:transition-all duration-200 ease-linear w-full md:${
        isScrolled ? "w-full sticky top-0 left-0" : "w-[calc(100vw-100px)]"
      } z-20`}
    >
      <header
        className={`${tailwindStyles.header} p-3 px-10 md:px-16 flex justify-between items-center shadow-md`}
      >
        <div>
          <img
            src="/RUFRENT6.png"
            alt="logo"
            className={`${tailwindStyles.logo}`}
          />
        </div>

        <div className="hidden md:flex space-x-4 lg:space-x-8">
          <div
            onClick={openModal}
            className="flex justify-center items-center w-40 h-7 bg-white  rounded-md cursor-pointer"
          >
            <div className="font-semibold text-sm pb-0.5 text-gray-800 mr-2">
              Post Property
            </div>
            <div className="bg-green-700 text-white font-bold text-xs  px-2 rounded-sm relative inline-block">
              FREE
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-green-300 transform skew-x-12 animate-pulse"></div>
            </div>
          </div>

          <button
            onClick={openModal}
            className={`${tailwindStyles.header_item} hover:underline underline-offset-4`}
          >
            Login
          </button>
          <button
            className={`${tailwindStyles.header_item} hover:underline underline-offset-4`}
          >
            &#9776; Menu
          </button>
        </div>

        {/* Hamburger Icon for Mobile */}

        <button
          onClick={toggleMenu}
          className={`md:hidden text-2xl focus:outline-none`}
        >
          {/* <IoMenu className="w-6 h-6" /> */}
          &#9776;
        </button>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className="fixed -top-2 left-0 w-full hidden md:hidden bg-[#001433] text-white p-4 space-y-4 mt-16 z-50"
        >
          <div onClick={openModal} className="flex flex-col-reverse space-y-3">
            <div className="mt-3 ml-6 flex justify-center items-center w-32 h-6 bg-white border border-blue-200 rounded-md cursor-pointer">
              <div className="font-semibold text-xs pb-0.5 text-gray-800 mr-2">
                Post Property
              </div>
              <div className="bg-green-700 text-white font-bold text-xs  px-1 rounded-sm relative inline-block">
                FREE
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-green-300 transform skew-x-12 animate-pulse"></div>
              </div>
            </div>

            <button onClick={openModal} className={`w-24`}>
              Login
            </button>
            <button className={` w-24`}>Menu</button>
          </div>
        </div>
      </header>
      {/* Authentication Modal */}
      <AuthModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default InitialHeaderView;
