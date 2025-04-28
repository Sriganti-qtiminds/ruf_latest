import React from "react";

import tailwindStyles from "../../../utils/tailwindStyles";

import { brokerageItems } from "./models/brokerageModel";





const BrokerageView = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 px-4">
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-500 ease-out scale-95 animate-pop-in">
        {/* Shiny Border Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 via-gray-800 to-yellow-500 p-1 -z-10 opacity-75 animate-gradient-flow"></div>

        {/* Content */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5">
          <h2 className={`${tailwindStyles.heading_card} text-center`}>
          Rental Service Charge
          </h2>
         
          <ul className="list-none space-y-3 text-gray-800">
            {brokerageItems.map((item, index) => (
              <li
                key={index}
                className={`${tailwindStyles.paragraph_b} flex items-center gap-2 animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {item.description}
              </li>
            ))}
          </ul>
          <button
            onClick={onClose}
            className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrokerageView;


