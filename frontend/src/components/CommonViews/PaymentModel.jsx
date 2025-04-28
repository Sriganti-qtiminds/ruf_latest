import React from "react";

import tailwindStyles from "../../utils/tailwindStyles";

const PaymentModal = ({ isOpen, onClose, isPaymentSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        {isPaymentSuccess ? (
          <>
            <h2 className={`${tailwindStyles.heading_2} text-green-600 `}>
              Payment Successful!
            </h2>
            <p className={`${tailwindStyles.heading_4} text-gray-600 mt-2`}>
              Your payment has been processed successfully.
            </p>
            <button
              onClick={onClose}
              className={`${tailwindStyles.secondaryButton} mt-4 bg-green-500 hover:bg-green-600`}
            >
              Ok
            </button>
          </>
        ) : (
          <>
            <h2 className={`${tailwindStyles.heading_2} text-red-600 `}>
              Payment Failed!
            </h2>
            <p className={`${tailwindStyles.heading_4} text-gray-600 mt-2`}>
              Something went wrong. Please try again.
            </p>
            <button
              onClick={onClose}
              className={`${tailwindStyles.secondaryButton} mt-4 bg-red-500 hover:bg-red-600`}
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
