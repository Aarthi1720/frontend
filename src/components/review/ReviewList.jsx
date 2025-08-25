import React from "react";
import ReviewItem from "./ReviewItem";

const ReviewList = ({ reviews = [], currentUserId, onEdit, onDelete }) => {
  if (!reviews.length) {
    return <div className="text-sm text-gray-500">No reviews yet.</div>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => {
        const canEdit = currentUserId && r?.userId?._id === currentUserId;
        return (
          <ReviewItem
            key={r._id}
            review={r}
            canEdit={!!canEdit}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};

export default ReviewList;
