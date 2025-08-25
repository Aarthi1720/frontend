import React, { useEffect, useState } from "react";
import ReviewForm from "./ReviewForm";

const ReviewModal = ({
  open,
  onClose,
  hotelId,
  roomId,
  existing,
  onRatingChanged,
}) => {
  const [visible, setVisible] = useState(open);
  useEffect(() => setVisible(open), [open]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (visible) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6" 
      onClick={(e) => e.stopPropagation()}  // ✅ don’t close when clicking inside
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {existing ? "Edit Review" : "Write a Review"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none cursor-pointer"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <ReviewForm
          hotelId={hotelId}
          roomId={roomId}
          existing={existing || null}
          onSaved={() => {
            onRatingChanged?.(); 
            onClose?.();
          }}
          onCancel={() => onClose?.()}
        />
      </div>
    </div>
  );
};

export default ReviewModal;
