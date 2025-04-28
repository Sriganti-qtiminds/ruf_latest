// ChatbotModal.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X } from "lucide-react";
import tailwindStyles from "../../../utils/tailwindStyles";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const messageMap = {
  start: {
    message:
      "👋 Welcome to RufRent - your one-stop solution for hassle-free renting and posting! Need help? Don't hesitate!",
    options: [
      { key: "1", text: "Property Posting Details 🏡" },
      { key: "2", text: "Property Search Details 🔍" },
      { key: "3", text: "Connecting With Us 📞" },
      { key: "4", text: "Favourite Property Listings" },
      { key: "0", text: "Request a CallBack" },
    ],
  },
  1: {
    message: "📌 Details for Posting a Property",
    steps: [
      "1️⃣ Click on this link: https://www.rufrent.com/user/postProperties",
      "2️⃣ Complete Signup/Login Process",
      "3️⃣ Click on [Post Property Free] Button",
      "4️⃣ Fill All Required Details and Click On Submit Button",
      "5️⃣ Property Posting is Successful, Will be Visible After Approvals",
    ],
    options: [{ key: "9", text: "Back to Main Menu" }],
  },
  2: {
    message: "🔍 Details for Searching Property:",
    steps: [
      "1️⃣ Visit Link: https://www.rufrent.com/user",
      "2️⃣ Apply required filters to get curated properties",
      "3️⃣ Click on Connect to Relationship Manager Button for Further Assistance.",
    ],
    options: [{ key: "9", text: "Back to Main Menu" }],
  },
  3: {
    message: "Contact Us: https://www.rufrent.com/footer/contact-us 📞",
    options: [{ key: "9", text: "Back to Main Menu" }],
  },
  4: {
    message: "📌 Favorites Details",
    steps: [
      "1️⃣ Click on the Link: https://www.rufrent.com/user/myfavorites",
      "2️⃣ Find Favourite Properties",
    ],
    options: [{ key: "9", text: "Back to Main Menu" }],
  },
  9: {
    message: "Main Menu",
    options: [
      { key: "1", text: "Property Posting Details 🏡" },
      { key: "2", text: "Property Search Details 🔍" },
      { key: "3", text: "Connecting With Us 📞" },
      { key: "4", text: "Favourite Property Listings" },
      { key: "0", text: "Request a CallBack" },
    ],
  },
  0: {
    message:
      "Please fill out the form below for a CallBack from Relationship Manager",
  },
};

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    mobile_no: "",
    time_slot: "",
    purpose: "",
  });
  const [errors, setErrors] = useState({});
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const chatRef = useRef(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      sendMessage("start");
    }
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping, showForm]); // Added dependencies to trigger scroll on all content changes

  const formatMessage = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800 transition-colors"
        >
          {part}
        </a>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  const sendMessage = (key) => {
    if (!messageMap[key]) {
      setMessages((prev) => [
        ...prev,
        { type: "user", text: key },
        {
          type: "bot",
          text: "Oops! I am still learning. Please select a valid option.",
        },
        ...messageMap["start"].options.map((opt) => ({
          type: "bot",
          text: `${opt.key}. ${opt.text}`,
          clickable: true,
          key: opt.key,
        })),
      ]);
      return;
    }

    setMessages((prev) => [...prev, { type: "user", text: key }]);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = messageMap[key];
      const botMessages = [
        { type: "bot", text: botResponse.message },
        ...(botResponse.steps || []).map((step) => ({
          type: "bot",
          text: step,
        })),
        ...(botResponse.options || []).map((opt) => ({
          type: "bot",
          text: `${opt.key}. ${opt.text}`,
          clickable: true,
          key: opt.key,
        })),
      ];
      setMessages((prev) => [...prev, ...botMessages]);
      setIsTyping(false);
      if (key === "0") {
        setShowForm(true);
      }
    }, 1000);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length > 50)
      newErrors.name = "Name cannot exceed 50 characters";
    if (!formData.city.trim()) newErrors.city = "City is required";
    else if (formData.city.trim().length > 30)
      newErrors.city = "City cannot exceed 30 characters";
    if (!formData.mobile_no.trim())
      newErrors.mobile_no = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile_no))
      newErrors.mobile_no = "Mobile number must be exactly 10 digits";
    if (!formData.time_slot.trim())
      newErrors.time_slot = "Preferred time slot is required";
    else if (formData.time_slot.trim().length > 30)
      newErrors.time_slot = "Time slot cannot exceed 30 characters";
    if (!formData.purpose.trim())
      newErrors.purpose = "Purpose of contact is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsFormSubmitting(true);
    try {
      const response = await axios.post(`${apiUrl}/addChatbotEntry`, formData);
      if (response.status === 201) {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "Thank you! We will contact you shortly." },
          {
            type: "bot",
            text: "Back to Main Menu",
            clickable: true,
            key: "9",
          },
        ]);
        setShowForm(false);
        alert("Thank you!, we will contact you soon");
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "Failed to submit your details. Please try again later.",
          },
          {
            type: "bot",
            text: "Back to Main Menu",
            clickable: true,
            key: "9",
          },
        ]);
        alert("Failed to submit your details. Please try again later");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text:
            error?.response?.data?.message ||
            "An error occurred. Please try again later.",
        },
        {
          type: "bot",
          text: "Back to Main Menu",
          clickable: true,
          key: "9",
        },
      ]);
      alert(
        error?.response?.data?.message ||
          "An error occurred. Please try again later."
      );
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleBotMessageClick = (message) => {
    if (message.clickable && message.key) {
      sendMessage(message.key);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg shadow-md">
        <h2 className={`${tailwindStyles.heading_3} text-white`}>
          💬 RUFI - Your Virtual Assistant
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div
        ref={chatRef}
        className="flex-1 p-4 space-y-4  overflow-y-auto bg-white max-h-[calc(70vh-72px)]" // Adjusted max height to account for header
        style={{ scrollbarWidth: "thin", scrollbarColor: "#93c5fd #fff" }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-xl shadow-sm ${tailwindStyles.paragraph} ${
                msg.type === "user"
                  ? "bg-blue-500 text-white"
                  : msg.clickable
                    ? "bg-blue-50 text-blue-800 hover:bg-blue-100 cursor-pointer transition-colors"
                    : "bg-gray-100 text-gray-800"
              }`}
              onClick={() => handleBotMessageClick(msg)}
            >
              {formatMessage(msg.text)}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="p-3 bg-gray-100 rounded-xl shadow-sm text-gray-600">
              <span className="flex items-center gap-1">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce delay-100">•</span>
                <span className="animate-bounce delay-200">•</span>
              </span>
            </div>
          </div>
        )}
        {showForm && (
          <div className="flex justify-start">
            <div className="w-full p-4 bg-gray-50 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className={tailwindStyles.heading_3}>Request a Callback</h3>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div className="grid grid-cols-4 items-center">
                  <label className={`${tailwindStyles.paragraph_b} col-span-1`}>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className={`${tailwindStyles.paragraph} border px-4 py-2 rounded-md col-span-3`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center">
                  <label className={`${tailwindStyles.paragraph_b} col-span-1`}>
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleFormChange}
                    required
                    className={`${tailwindStyles.paragraph} border px-4 py-2 rounded-md w-full col-span-3`}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center">
                  <label className={`${tailwindStyles.paragraph_b} col-span-1`}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile_no"
                    placeholder="1234567890"
                    value={formData.mobile_no}
                    onChange={handleFormChange}
                    required
                    className={`${tailwindStyles.paragraph} border px-4 py-2 rounded-md w-full col-span-3`}
                  />
                  {errors.mobile_no && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.mobile_no}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center">
                  <label className={`${tailwindStyles.paragraph_b} col-span-1`}>
                    Preferred Time Slot *
                  </label>
                  <input
                    type="text"
                    name="time_slot"
                    placeholder="Preferred Time Slot"
                    value={formData.time_slot}
                    onChange={handleFormChange}
                    required
                    className={`${tailwindStyles.paragraph} border px-4 py-2 rounded-md w-full col-span-3`}
                  />
                  {errors.time_slot && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.time_slot}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center">
                  <label className={`${tailwindStyles.paragraph_b} col-span-1`}>
                    Purpose of Contact *
                  </label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleFormChange}
                    required
                    className={`${tailwindStyles.paragraph} border px-4 py-2 rounded-md w-full col-span-3`}
                  >
                    <option value="" disabled>
                      Select Purpose
                    </option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Property Posting">Property Posting</option>
                    <option value="Property Finding">Property Finding</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.purpose && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.purpose}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className={`${tailwindStyles.secondaryButton} self-end`}
                >
                  {isFormSubmitting ? "Submitting..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatbotModal = ({ isOpen, onClose, buttonRef }) => {
  if (!isOpen) return null;

  const buttonRect = buttonRef.current?.getBoundingClientRect();
  const style = buttonRect
    ? {
        position: "fixed",
        bottom: `${window.innerHeight - buttonRect.top + 20}px`,
        right: `${window.innerWidth - buttonRect.right + 10}px`,
        zIndex: 50,
      }
    : {};

  return (
    <div style={style}>
      <div className="w-[100%] md:w-64 lg:w-96 h-[70vh] bg-white rounded-lg shadow-xl flex flex-col border border-gray-100 overflow-hidden">
        <Chatbot onClose={onClose} />
      </div>
    </div>
  );
};

export default ChatbotModal;
