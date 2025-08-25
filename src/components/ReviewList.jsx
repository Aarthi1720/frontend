// Backward-compatible wrapper to avoid breaking old imports.
// It renders the modern ReviewsSection internally.

import ReviewsSection from "./reviews/ReviewsSection";

const ReviewList = ({ hotelId, roomId }) => {
  return <ReviewsSection hotelId={hotelId} roomId={roomId} />;
};

export default ReviewList;
