import React from 'react';

const Modal = ({ title, message, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}   // click background to close
    >
      <div
        className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}   // prevent closing if click inside
      >
        <h2 className="text-lg font-semibold text-red-600 mb-2">{title}</h2>
        <p className="text-sm text-gray-700 mb-5">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default Modal;
