import React from 'react';

const Modal = ({ title, children, onClose, width = 'max-w-2xl' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={onClose}>
    <div className={`bg-white rounded-lg shadow-lg p-6 relative w-full ${width} max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-3xl font-bold"
        onClick={() => {
          console.log('Modal close button clicked');
          onClose();
        }}
        aria-label="Close"
      >
        ×
      </button>
      {title && <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>}
      <div className="overflow-y-auto pr-2 custom-scrollbar">
        {children}
      </div>
    </div>
  </div>
);

export default Modal;