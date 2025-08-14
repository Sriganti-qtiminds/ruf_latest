
// export default ChatbotModal;


import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X } from "lucide-react";
import tailwindStyles from "../../../utils/tailwindStyles";
import responses from "./response.json";
import communities from "./communities.json";
import {Link} from "react-router-dom";
import { RENTALS_BASE, FOOTER_PATH } from "../../../routes/routesPath";
const apiUrl = `${import.meta.env.VITE_API_URL }`;

const VALID_COMMUNITIES = [
    "Aparna Aura", "Aparna Avenues", "Aparna Boulevard", "Aparna Cyber Commune", "Aparna CyberLife",
    "Aparna CyberZon", "Aparna Elixir", "Aparna Gardenia", "Aparna Grande", "Aparna Lake Breeze",
    "Aparna Sarovar", "Aparna Serene Park", "Aparna Shangrila", "Aparna Silver Oaks", "Aparna WestSide",
    "Aparna Zenith", "Fortune Nest", "Fortune Towers", "Hallmark Empyrean", "Hallmark Vicinia",
    "Honer Aquantis", "Honer Vivantis", "Jayabheri Orange County", "Jayabheri Silicon County",
    "Jayabheri Temple Tree", "Jayabheri The Meadows", "Jayabheri The Peak", "Jayabheri The Summit",
    "Jayabheri Whistling Court", "L&T Serene County", "Lodha Bell Gardens", "Lodha Belleza Sky Villas",
    "Lodha Burlingame Bellezza", "Lodha Codename 520", "Lodha Luxury Life Style", "Lodha Majesto",
    "Lodha Meridian", "Lodha Meridian Super 60", "Myhome Abhra", "Myhome Ankura", "Myhome Avatar",
    "Myhome Bhooja", "Myhome Jewel", "Myhome Krishe", "Myhome Mangala", "Myhome Navadeepa",
    "Myhome Tarkshya", "Myhome Tridasa", "Myhome Vihanga", "NCC Nagarjuna Residency", "NCC Urban One",
    "Prestige High Fields", "Prestige IVY League", "Prestige Tranquil Towers", "Rainbow vistas Marina Skies",
    "Rainbow vistas Rock Garden", "Rajpushpa Atria", "Rajpushpa Cannon Dale", "Rajpushpa Eterna",
    "Rajpushpa Green Dale", "Rajpushpa Open Skies", "Rajpushpa Regalia", "Rajpushpa Silicon Ridge",
    "Rajpushpa The Retreat", "Ramky One Kosmos", "Ramky The Huddle", "Ramky Towers", "Ramky Tranquillas",
    "Sumadhura AcroPolis", "Vasavi GP Trends", "Vasavi Shanthinikethan", "Vertex Panache",
    "Vertex Pleasent", "Vertex Premio", "Vertex Prime", "Vertex Sadhgurukrupa"
];


function extractRoomAndArea(sentence) {
  const roomRegex = /(\d+)\s*(?:bedroom|room|br|bd|beds?|rooms?|bhk)\b/i;
  const areaRegex = /(\d+)\s*(?:sqm|sq\.?m|square\s*meters?|m²)\b/i;
  const communityRegex = new RegExp(
    `\\b(${VALID_COMMUNITIES
      .map((c) => c.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"))
      .join("|")})\\b`,
    "i"
  );

  const rooms = (() => {
    const match = sentence.match(roomRegex);
    return match ? parseInt(match[1], 10) : null;
  })();

  const area = (() => {
    const match = sentence.match(areaRegex);
    return match ? parseInt(match[1], 10) : null;
  })();

  let community = (() => {
    const exactMatch = sentence.match(communityRegex);
    if (exactMatch) return exactMatch[1];

    const lowerSentence = sentence.toLowerCase();
    for (const validCommunity of VALID_COMMUNITIES) {
      const lowerCommunity = validCommunity.toLowerCase();

      if (new RegExp(`\\b${lowerCommunity}\\b`, "i").test(lowerSentence)) {
        return validCommunity;
      }

      const communityWords = lowerCommunity.split(/\s+/);
      const matchingWords = communityWords.filter((word) =>
        lowerSentence.includes(word)
      );

      if (matchingWords.length / communityWords.length >= 0.2) {
        return validCommunity;
      }
    }

    return null;
  })();

  return { rooms, area, community };
}


function generatePropertySearchUrl(rooms, community) {
  let baseUrl = `${RENTALS_BASE}`;
  let params = new URLSearchParams();

  if (community) {
    params.append("community", community);
  }

  if (rooms) {
    params.append("hometype", `${rooms} BHK`);
  }

  return `${baseUrl}?${params.toString()}`;
}

const FormModal = ({ isOpen, onClose, onSubmit, formData, setFormData, formErrors }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-md w-full relative shadow-xl transform transition-transform duration-300 scale-100">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">Request Callback</h2>
        {formErrors && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
            {formErrors}
          </div>
        )}
        <div className="space-y-4">
          <select
            name="userType"
            value={formData.userType}
            onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value }))}
            required
            className="w-full p-2 border rounded text-gray-500 disabled:opacity-50"
            disabled={formData.loadingUserTypes}
          >
            <option value="" disabled hidden>
              {formData.loadingUserTypes ? "Loading..." : "Select"}
            </option>
            {formData.userTypes?.map((type) => (
              <option key={type.id} value={type.category}>
                {type.category}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Your Name"
            required
            className="w-full p-2 border rounded disabled:opacity-50"
            disabled={formData.isSubmitting}
          />

          <div className="flex items-center">
            <div className="relative w-1/3 mr-2">
              <button
                type="button"
                className="w-full p-2 border rounded flex items-center justify-between bg-white disabled:opacity-50"
                onClick={() => setFormData(prev => ({ ...prev, isDropdownOpen: !prev.isDropdownOpen }))}
                disabled={formData.isSubmitting}
              >
                {formData.selectedCountry ? (
                  <div className="flex items-center space-x-2">
                    <img
                      src={formData.selectedCountry.flag}
                      alt={formData.selectedCountry.name}
                      className="w-5 h-5"
                    />
                    <span>{formData.selectedCountry.code}</span>
                  </div>
                ) : (
                  <span>Code</span>
                )}
              </button>
              {formData.isDropdownOpen && (
                <div className="absolute z-10 mt-1 bg-white border rounded shadow-lg w-full min-w-[240px]">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      placeholder="Search countries"
                      className="w-full p-2 border rounded text-gray-500"
                      value={formData.searchTerm}
                      onChange={(e) => setFormData(prev => ({ ...prev, searchTerm: e.target.value }))}
                      autoFocus
                    />
                  </div>
                  <ul className="max-h-60 overflow-y-auto">
                    {formData.filteredCountries?.map((country, index) => (
                      <li
                        key={index}
                        className="p-2 flex items-center cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            selectedCountry: country,
                            isDropdownOpen: false,
                            searchTerm: ""
                          }));
                        }}
                      >
                        <img
                          src={country.flag}
                          alt={country.name}
                          className="w-5 h-5 mr-2"
                        />
                        <span className="truncate">
                          {country.name} {country.code}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={(e) => {
                if (e.target.value.length <= 10) {
                  setFormData(prev => ({ ...prev, mobile: e.target.value }));
                }
              }}
              placeholder="10-digit number"
              required
              minLength={10}
              maxLength={10}
              className="w-2/3 p-2 border rounded disabled:opacity-50"
              disabled={formData.isSubmitting}
            />
          </div>
          <p className="text-xs text-gray-500">
            Enter your 10-digit mobile number
          </p>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              disabled={formData.isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={formData.isSubmitting || formData.loadingUserTypes}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formData.isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Chatbot = ({ isOpen, onClose, buttonRef }) => {
  if (!isOpen) return null;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        type: "bot",
        text: "👋 Welcome to RufRent - your one-stop solution for hassle-free renting and posting! How can I help you today?",
      },
    ]);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const formatMessage = (text, isLink = false, buttonText = "Visit Page", isInternal = false) => {
    if (isLink) {
      return isInternal ? (
        <Link
          to={text}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-2 transition"
        >
          {buttonText}
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      ) : (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-2 transition"
        >
          {buttonText}
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      );
    }

    return <span>{text}</span>;
  };

  const extractRoomAndArea = (msg) => {
    const match = msg.match(/(\d+)\s*BHK.*in\s+(.+)/i);
    return {
      rooms: match?.[1] || "",
      community: match?.[2] || "",
    };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages((prev) => [...prev, { type: "user", text: inputMessage }]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const { data } = await axios.post(`${apiUrl}/chatbot/classify`, {
        message: inputMessage,
      });

      const intentId = parseInt(data.predictedClass);
      const intent = responses.intents.find((i) => i.intent_id === intentId);

      if (!intent) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "I'm not sure how to help with that. Please try again or contact support.",
          },
        ]);
        return;
      }

      if (intentId === 0) {
        setShowForm(true);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "I'll help you schedule a callback. Please fill out the form below:",
          },
        ]);
        return;
      }

      // Show title
      setMessages((prev) => [...prev, { type: "bot", text: intent.title }]);

      // Show steps
      intent.steps?.forEach((step) =>
        setMessages((prev) => [...prev, { type: "bot", text: step }])
      );

      // Show link
      if (intent.intent_id === 1) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: `${RENTALS_BASE}/postProperties`,
            isLink: true,
            isInternal: true,
            buttonText: intent.button_text,
          },
        ]);
      } else if (intent.intent_id === 2) {
        const { rooms, community } = extractRoomAndArea(inputMessage);
        const dynamicSearchUrl = generatePropertySearchUrl(rooms, community);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: dynamicSearchUrl,
            isLink: true,
            isInternal: true,
            buttonText: intent.button_text,
          },
        ]);
      } else if (intent.intent_id === 3) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: `${FOOTER_PATH}/contact-us`,
            isLink: true,
            isInternal: true,
            buttonText: intent.button_text,
          },
        ]);
      } else if (intent.intent_id === 4) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: `${RENTALS_BASE}/myfavorites`,
            isLink: true,
            isInternal: true,
            buttonText: intent.button_text,
          },
        ]);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 w-[85%] sm:w-96 h-[70vh] sm:h-[600px] bg-white rounded-lg shadow-lg flex flex-col z-50">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className={`${tailwindStyles.heading_2}`}>Chat with us</h2>
       <button
  onClick={onClose}
  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
>
  <X className="h-5 w-5" />
</button>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.type === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {formatMessage(msg.text, msg.isLink, msg.buttonText, msg.isInternal)}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className={`${tailwindStyles.paragraph} flex-1 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <button type="submit" className={`${tailwindStyles.secondaryButton} px-4`}>
            Send
          </button>
        </div>
      </form>

      <FormModal isOpen={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
};

export default Chatbot;



