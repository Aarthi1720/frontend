import React, { useEffect, useMemo, useState } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import StarRating from "./StarRating";

const MIN_LEN = 10;
const MAX_LEN = 1000;

const ReviewForm = ({ hotelId, roomId, existing, onSaved, onCancel }) => {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [comment, setComment] = useState(existing?.comment || "");
  const [submitting, setSubmitting] = useState(false);

  const original = useMemo(() => ({
    rating: existing?.rating || 0,
    comment: existing?.comment || "",
  }), [existing]);

  useEffect(() => {
    if (existing) {
      setRating(existing.rating || 0);
      setComment(existing.comment || "");
    } else {
      setRating(0); setComment("");
    }
  }, [existing]);

  const remaining = useMemo(() => MAX_LEN - (comment.length || 0), [comment]);
  const tooShort = (comment?.trim().length || 0) < MIN_LEN;
  const noRating = rating < 1;
  const noChange = existing && Number(rating) === original.rating && comment.trim() === original.comment.trim();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  if (!user?._id) {
    return (
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
        Please log in to write a review.
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please log in");

    if (noRating) return toast.error("Please select a star rating");
    if (tooShort) return toast.error(`Comment must be at least ${MIN_LEN} characters`);
    if (existing && noChange) return toast("No changes to update.", { icon: "ℹ️" });

    setSubmitting(true);
    try {
      if (existing?._id) {
        const { data } = await api.patch(`/reviews/${existing._id}`, {
          rating,
          comment: comment.slice(0, MAX_LEN),
        });
        toast.success("Review updated");
        onSaved?.(data.review || data);
      } else {
        const { data } = await api.post("/reviews", {
          hotelId,
          roomId,
          rating,
          comment: comment.slice(0, MAX_LEN),
        });
        toast.success("Review submitted");
        onSaved?.(data.review || data);
      }
    } catch (err) {
      const code = err?.response?.status;
      const msg = err?.response?.data?.error ||
        (code === 403
          ? "You can review only after completing a paid stay."
          : "Failed to submit review");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
      <h4 className="font-semibold text-lg text-[#0D9488] mb-3">
        {existing ? "Edit your review" : "Write a review"}
      </h4>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm text-gray-700">Your rating:</span>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, MAX_LEN))}
        rows={4}
        maxLength={MAX_LEN}
        placeholder="Share your experience (be helpful and specific)"
        className="w-full border border-gray-300 text-gray-500 caret-[#0D9488] rounded-md p-3 text-sm focus:ring-[#0D9488] focus:outline-none"
        aria-invalid={noRating || tooShort}
      />

      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs ${noRating || tooShort ? "text-red-600" : "text-gray-500"}`}>
          {noRating
            ? "Select a star rating"
            : tooShort
              ? `Minimum ${MIN_LEN} characters`
              : existing && noChange
                ? "No changes"
                : "Looks good"}
        </span>
        <span className="text-xs text-gray-500">{remaining} chars left</span>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={submitting || tooShort || noRating || (existing && noChange)}
          className="px-5 py-2 rounded-md text-white text-sm font-medium disabled:opacity-60 bg-gradient-to-br from-[#0D9488] to-[#68b4ad] hover:bg-gradient-to-tl active:scale-105 transition duration-400"
        >
          {submitting
            ? "Saving…"
            : existing
              ? "Update Review"
              : "Submit Review"}
        </button>
        {existing && (
          <button
            type="button"
            onClick={() => onCancel?.()}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
          >
            Cancel
          </button>
        )}
      </div>

      {existing?.isApproved && (
        <p className="text-xs text-gray-500 mt-2">
          Editing an approved review will send it back to moderation.
        </p>
      )}
    </form>
  );
};

export default ReviewForm;
