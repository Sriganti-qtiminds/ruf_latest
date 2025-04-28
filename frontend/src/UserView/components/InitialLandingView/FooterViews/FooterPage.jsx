import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../../components/CommonViews/Navbar";
import tailwindStyles from "../../../../utils/tailwindStyles";
import { FaPhoneAlt, FaEnvelope, FaClock, FaWhatsapp } from "react-icons/fa";

import RRPackage from "./InitialFooterRRPackageView";
import AboutRufrent from "./InitialFooterAboutView";
import TenantsDoc from "./InitialFooterTenantsView";
import OwnersDoc from "./InitialFooterOwnersView";
import TermsAndConditions from "./InitialFooterTermsView";
import Team from "./InitialFooterTeamView";
import ContactUs from "./InitialContactUs";
const footerSections = [
  {
    id: "about-us",
    label: "About Us",
    content: (
      <>
        <AboutRufrent />
      </>
    ),
  },
  {
    id: "rr-package",
    label: "RR Package",
    content: (
      <>
        <RRPackage />
      </>
    ),
  },
  {
    id: "tenants",
    label: "Tenants",
    content: (
      <>
        <TenantsDoc />
      </>
    ),
  },
  {
    id: "owners",
    label: "Owners",
    content: (
      <>
        <OwnersDoc />
      </>
    ),
  },

  {
    id: "terms-and-conditions",
    label: "T&C's",
    content: (
      <>
        <TermsAndConditions />
      </>
    ),
  },
  {
    id: "team",
    label: "Team",
    content: (
      <>
        <Team />
      </>
    ),
  },
  {
    id: "contact-us",
    label: "Contact Us",
    content: (
      <>
        <ContactUs />
      </>
    ),
  },
  // {
  //   id: "privacy-policy",
  //   label: "Privacy Policy",
  //   content: <p className="text-center">Privacy policy details Coming Soon</p>,
  // },
  // {
  //   id: "faqs",
  //   label: "FAQs",
  //   content: <p className="text-center">Frequently Asked Questions Coming Soon</p>,
  // },
];

const FooterPage = () => {
  const { section } = useParams();
  const navigate = useNavigate();

  // Find the active section details
  const activeSection =
    footerSections.find((item) => item.id === section) || footerSections[0];

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 pt-0.5">
        {/* Tabs for Footer Sections */}
        <div className="fixed top-0 left-0 w-full mt-14 bg-white border-b mb-4">
          <div className="flex justify-center overflow-x-auto scrollbar-hide">
            <div className="grid grid-cols-4 sm:grid-cols-2 md:flex space-x-1 px-2 py-1 md:py-2 flex-wrap">
              {footerSections.map((item) => (
                <button
                  key={item.id}
                  className={`px-4 py-1 text-sm font-semibold ${
                    item.id === activeSection.id
                      ? "rounded-lg text-white font-semibold bg-blue-500"
                      : "text-[#001433]"
                  }`}
                  onClick={() => navigate(`/footer/${item.id}`)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Display Content Based on Active Section */}
        <div className="mt-28 md:mt-16">{activeSection.content}</div>
      </div>
    </>
  );
};

export default FooterPage;
