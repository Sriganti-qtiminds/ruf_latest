import React from "react";
import { XCircle, X } from "lucide-react";

const ErrorView = ({ onClose, errorMessage }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-2 text-xl font-semibold text-gray-900">
            Error Posting Property
          </h2>
          <p className="mt-1 text-gray-600">{errorMessage}</p>
          <button
            onClick={onClose}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorView;
