import { NavLink } from "react-router-dom";
import { FOOTER_PATH } from "../../../routes/routesPath"; 

const FooterSection = () => (
  <footer className="bg-[#001433] text-gray-200 py-6 text-center">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-wrap justify-center space-x-5 text-sm mb-4">
        <NavLink
          to={`${FOOTER_PATH}/about-us`}
          className="text-gray-300 hover:text-gray-400"
        >
          About Us
        </NavLink>
        <NavLink
          to={`${FOOTER_PATH}/rr-package`}
          className="text-gray-300 hover:text-gray-400"
        >
          RR Package
        </NavLink>
        <NavLink
          to={`${FOOTER_PATH}/tenants`}
          className="text-gray-300 hover:text-gray-400"
        >
          Tenants
        </NavLink>
        <NavLink
          to={`${FOOTER_PATH}/owners`}
          className="text-gray-300 hover:text-gray-400"
        >
          Owners
        </NavLink>
        <NavLink
          to={`${FOOTER_PATH}/faqs`}
          className="text-gray-300 hover:text-gray-400"
        >
          FAQs
        </NavLink>
        <NavLink
          to={`${FOOTER_PATH}/terms-and-conditions`}
          className="text-gray-300 hover:text-gray-400"
        >
          Terms & Conditions
        </NavLink>
      </div>
      <div className="flex flex-wrap justify-center space-x-6 text-sm mb-4">
        <NavLink
          to={`${FOOTER_PATH}/team`}
          className="text-gray-300 hover:text-gray-400"
        >
          Team
        </NavLink>
        <NavLink
          to={`${FOOTER_PATH}/privacy-policy`}
          className="text-gray-300 hover:text-gray-400"
        >
          Privacy Policy
        </NavLink>
        <NavLink
          to={`${FOOTER_PATH}/contact-us`}
          className="text-gray-300 hover:text-gray-400"
        >
          Contact Us
        </NavLink>
      </div>

      <div className="flex justify-center space-x-4 mb-4">
        <a
          href="https://www.facebook.com/profile.php?id=61574863504948"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
            alt="Facebook"
            className="w-6"
          />
        </a>
        <a
          href="https://www.instagram.com/rufrent/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
            alt="Instagram"
            className="w-6"
          />
        </a>
        <a
          href="https://youtube.com/@rufrent?si=_q9JHLZIH47LMSus"
          target="_blank"
          rel="noopener noreferrer"
        >
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
