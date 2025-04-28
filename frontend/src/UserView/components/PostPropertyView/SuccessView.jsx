import React from "react";
import { CheckCircle, X } from "lucide-react";

const SuccessView = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-2 text-xl font-semibold text-gray-900">
            Property Posted Successfully!
          </h2>
          <p className="mt-1 text-gray-600">
            Your posted property is under <b>Admin Review</b>. Once the admin
            checks and <b>Approves</b> your listing, it will be live on{" "}
            <b>RUFRENT</b>.
          </p>
          <button
            onClick={onClose}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessView;
