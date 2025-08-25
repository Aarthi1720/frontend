import React from "react";
import StarRating from "./StarRating";
import { Edit, Edit2 } from "lucide-react";

const relTime = (iso) => {
  try {
    const d = new Date(iso).getTime();
    const diff = Date.now() - d;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return "";
  }
};

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

const ReviewItem = ({ review, canEdit = false, onEdit, onDelete }) => {
  const userName = review?.userId?.name || "Guest";
  const edited =
    review?.updatedAt &&
    review?.createdAt &&
    review.updatedAt !== review.createdAt;

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full bg-[#0D9488]/10 flex items-center justify-center text-xs font-bold text-[#0D9488]"
            aria-hidden="true"
          >
            {initials(userName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{userName}</span>
              {review.verifiedBooking && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                  Verified stay
                </span>
              )}
              {!review.isApproved && (
                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                  Pending moderation
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating
                value={Number(review.rating) || 0}
                readOnly
                size="sm"
              />
              <span className="text-xs text-gray-500">
                {relTime(review.createdAt)}
              </span>
              {edited && (
                <span className="text-xs text-gray-400">• edited</span>
              )}
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-3 text-sm text-right">
            <button
              className="text-[#0D9488] hover:underline font-medium"
              onClick={() => onEdit?.(review)}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              className="text-[#FB7185] hover:underline font-medium"
              onClick={() => onDelete?.(review)}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">
        {review.comment}
      </p>
    </div>
  );
};

export default ReviewItem;
