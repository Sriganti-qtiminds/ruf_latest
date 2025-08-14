import React from "react";
import { studioTailwindStyles } from "../../../utils/studioTailwindStyles";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Timer,
  Youtube,
} from "lucide-react";

const footer = {
  about: {
    title: "Rufrent",
    description:
      "Transforming spaces into beautiful, functional homes since 2018. We bring your vision to life with our expert design solutions.",
    socials: [
      { icon: <Youtube className="text-white" />, href: "#" },
      { icon: <Instagram className="text-white" />, href: "#" },
      { icon: <Facebook className="text-white" />, href: "#" },
    ],
  },
  links: {
    title: "Quick Links",
    items: [
      { text: "Home", href: "#" },
      { text: "Our Services", href: "#rooms" },
      { text: "Design Process", href: "#timeline" },
      { text: "Testimonials", href: "#testimonials" },
      // { text: "Portfolio", href: "#" },
      { text: "Contact Us", href: "#" },
    ],
  },
  contact: {
    title: "Contact Info",
    items: [
      {
        icon: <MapPin className="text-[#E07A5F]" />,
        text: "Hyderabad",
      },
      {
        icon: <Phone className="text-[#E07A5F]" />,
        text: "+91 9985649278",
      },
      {
        icon: <Mail className="text-[#E07A5F]" />,
        text: "support@rufrent.com",
      },
      {
        icon: <Timer className="text-[#E07A5F]" />,
        text: "Mon - Fri: 9:00AM  - 6:00PM, Sat: 10:00AM - 4:00PM",
      },
    ],
  },

  copyright: "© 2025 QTIMinds Pvt. Ltd.",
};

const Footer = () => {
  return (
    <footer className="bg-[#1A1F3D] text-white py-8 px-6 md:px-10 w-full">
      <div className="container mx-auto px-4 lg:px-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 space-y-4">
          {/* About Section */}
          <div>
            <img src="/RUFRENT6.png" className="h-6 lg:h-10 mb-4" />
            <p
              className={`${studioTailwindStyles.paragraph_2} text-gray-300 mb-6`}
            >
              {footer.about.description}
            </p>
            <div className="flex gap-4">
              {footer.about.socials.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          {/* Quick Links Section */}
          <div className="flex flex-col md:items-center">
            <h3 className={`${studioTailwindStyles.heading_3} text-white mb-4`}>
              {footer.links.title}
            </h3>
            <ul className="space-y-2">
              {footer.links.items.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`${studioTailwindStyles.paragraph_2} text-gray-300 hover:text-white transition-colors duration-300`}
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact Info Section */}
          <div>
            <h3 className={`${studioTailwindStyles.heading_3} text-white mb-4`}>
              {footer.contact.title}
            </h3>
            <ul className="space-y-3">
              {footer.contact.items.map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-5 h-5 flex items-center justify-center mt-1 mr-4">
                    {item.icon}
                  </div>
                  <span
                    className={`${studioTailwindStyles.paragraph_2} text-gray-300`}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-8 border-t border-gray-700 text-center">
          <p className={`${studioTailwindStyles.paragraph_2} text-gray-400 `}>
            {footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
