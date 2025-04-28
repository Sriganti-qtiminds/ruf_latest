import { FaPhoneAlt, FaEnvelope, FaWhatsapp, FaClock } from "react-icons/fa";
import tailwindStyles from "../../../../utils/tailwindStyles";

const ContactUs = () => {
  return (
    <>
      <div className="max-w-4xl mt-20 lg:mt-12 mx-auto p-4 pt-2 bg-white rounded-lg border border-[#ffc107]">
        {/* Header Section */}
        <h1 className={`${tailwindStyles.heading_2} font-semibold text-center`}>
          Contact Us
        </h1>
        <p
          className={`${tailwindStyles.paragraph} pt-2 pb-4 text-center leading-relaxed`}
        >
          We’re here to assist you with all your rental needs! Whether you are a
          property owner looking to list your home or a tenant searching for the
          perfect place to stay, our team is ready to help.
        </p>

        {/* Contact Information */}
        <div className="bg-white/70  backdrop-blur-lg border border-gray-200 p-6 rounded-xl w-full">
          <div className="space-y-4">
            {/* Call Us */}
            <div className="flex items-center space-x-3">
              <FaPhoneAlt className="text-blue-600 text-lg" />
              <p className={`${tailwindStyles.heading_4} font-semibold`}>
                Call Us:{" "}
                <a
                  href="tel:+919985649278"
                  className="text-blue-500 hover:text-blue-600 transition"
                >
                  +91-9985649278
                </a>
              </p>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-red-500 text-lg" />
              <p className={`${tailwindStyles.heading_4} font-semibold`}>
                Email Us:{" "}
                <a
                  href="mailto:support@rufrent.com"
                  className="text-blue-500 hover:text-blue-600 transition"
                >
                  support@rufrent.com
                </a>
              </p>
            </div>

            {/* WhatsApp Support */}
            <div className="flex items-center space-x-3">
              <FaWhatsapp className="text-green-500 text-lg" />
              <p className={`${tailwindStyles.heading_4} font-semibold`}>
                WhatsApp Support:{" "}
                <a
                  href="https://wa.me/919985649278"
                  target="_blank"
                  className="text-blue-500 hover:text-blue-600 transition"
                >
                  +91-9985649278
                </a>
              </p>
            </div>

            {/* Support Hours */}
            <div className="flex items-center space-x-3">
              <FaClock className="text-gray-700 text-lg" />
              <p className={`${tailwindStyles.heading_4} font-semibold`}>
                Support Hours:{" "}
                <span className="text-gray-600">
                  Monday - Sunday: 9:00 AM - 7:00 PM
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
