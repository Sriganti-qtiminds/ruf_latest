import React from "react";

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;