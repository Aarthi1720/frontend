import React from 'react';

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
  <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
    <h2 className="text-lg font-semibold text-red-600 mb-2">{title}</h2>
    <p className="text-sm text-gray-700 mb-5">{message}</p>
    <div className="flex justify-end gap-2">
      <button
        onClick={onCancel}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded-md transition"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition"
      >
        Confirm
      </button>
    </div>
  </div>
</div>

);

export default ConfirmModal;
