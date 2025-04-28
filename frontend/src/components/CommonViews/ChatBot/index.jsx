import React, { useState, useRef } from "react";
import ChatbotModal from "./Chatbot";

const ChatBot = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const buttonRef = useRef(null);

  const handleToggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div ref={buttonRef} className="fixed z-20 bottom-6 right-9">
        <button
          onClick={handleToggleChatbot}
          className="animate-bounce w-20 h-10 flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 via-blue-500 to-teal-400 text-white rounded-r-full rounded-tl-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50 relative backdrop-blur-sm bg-opacity-90 border"
        >
          {/* {!isChatbotOpen && (
            <span className="font-semibold text-xs w-[120px] text-white tracking-wide absolute -top-8 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-md px-2 py-1  rounded-full shadow-md border border-gray-700/50 animate-bounce">
              Chat with RUFI
            </span>
          )} */}
          <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-white to-gray-200 text-transparent bg-clip-text">
            RUFI
          </span>
          {/* Message bubble effect */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ffc107] rounded-full animate-ping opacity-75"></span>
        </button>
      </div>

      {/* Chatbot Modal */}
      <ChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        buttonRef={buttonRef}
      />
    </>
  );
};

export default ChatBot;
