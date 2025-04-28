import { NavLink } from "react-router-dom";

const FooterSection = () => (
  <footer className="bg-[#001433] text-gray-200 py-6 text-center">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-wrap justify-center space-x-5 text-sm mb-4">
        <NavLink
          to="/footer/about-us"
          className="text-gray-300 hover:text-gray-400"
        >
          About Us
        </NavLink>
        <NavLink
          to="/footer/rr-package"
          className="text-gray-300 hover:text-gray-400"
        >
          RR Package
        </NavLink>
        <NavLink
          to="/footer/tenants"
          className="text-gray-300 hover:text-gray-400"
        >
          Tenants
        </NavLink>
        <NavLink
          to="/footer/owners"
          className="text-gray-300 hover:text-gray-400"
        >
          Owners
        </NavLink>
        <NavLink
          to="/footer/faqs"
          className="text-gray-300 hover:text-gray-400"
        >
          FAQs
        </NavLink>
        <NavLink
          to="/footer/terms-and-conditions"
          className="text-gray-300 hover:text-gray-400"
        >
          Terms & Conditions
        </NavLink>
      </div>
      <div className="flex flex-wrap justify-center space-x-6 text-sm mb-4">
        <NavLink
          to="/footer/team"
          className="text-gray-300 hover:text-gray-400"
        >
          Team
        </NavLink>
        <NavLink
          to="/footer/privacy-policy"
          className="text-gray-300 hover:text-gray-400"
        >
          Privacy Policy
        </NavLink>
        <NavLink
          to="/footer/contact-us"
          className="text-gray-300 hover:text-gray-400"
        >
          Contact Us
        </NavLink>
      </div>

      <div className="flex justify-center space-x-4 mb-4">
        <a
          href="https://www.facebook.com/profile.php?id=61574863504948"
          target="_blank"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
            alt="Facebook"
            className="w-6"
          />
        </a>
        <a href="https://www.instagram.com/rufrent/" target="_blank">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
            alt="Instagram"
            className="w-6"
          />
        </a>
        <a href="https://www.youtube.com/@rufrent" target="_blank">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
            alt="YouTube"
            className="w-6"
          />
        </a>
      </div>
      <p className="text-xs text-gray-400">© 2024-25 QTIMinds Pvt. Ltd.</p>
    </div>
  </footer>
);

export default FooterSection;
