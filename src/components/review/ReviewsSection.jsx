import React, { useEffect, useMemo, useState } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import ReviewList from "./ReviewList";
import ReviewForm from "./ReviewForm";
import StarRating from "./StarRating";

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const ReviewsSection = ({
  hotelId,
  roomId = null,
  eligibleOverride = null,
  onRatingChanged, // <-- newly added prop
}) => {
  const [reviews, setReviews] = useState([]);
  const [sort, setSort] = useState("newest");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const [myReview, setMyReview] = useState(null);
  const [eligible, setEligible] = useState(eligibleOverride ?? true);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    if (eligibleOverride !== null) setEligible(eligibleOverride);
  }, [eligibleOverride]);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const user = getCurrentUser();
  const currentUserId = user?._id || null;

  const loadPublic = async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/reviews/hotel/${hotelId}`, {
        params: { sort, verifiedOnly },
      });
      setReviews(Array.isArray(data) ? data : []);
      setPage(1);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const loadMine = async () => {
    const token = localStorage.getItem("token");
    if (!token || !hotelId) {
      setEligible(false);
      setMyReview(null);
      return;
    }
    try {
      const { data: elig } = await api.get(`/reviews/eligibility/${hotelId}`);
      setEligible(!!elig?.eligible);

      const { data: mine } = await api.get(`/reviews/my`, {
        params: { hotelId },
      });
      setMyReview(mine || null);
    } catch {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
       setEligible(false);
       setMyReview(null);
     } else {
       setEligible(false);
       setMyReview(null);
     }
    }
  };

  useEffect(() => {
    loadPublic();
  }, [hotelId, sort, verifiedOnly]);

  useEffect(() => {
    loadMine();
  }, [hotelId, currentUserId]);

  const { avg, total, buckets } = useMemo(() => {
    const total = reviews.length;
    if (!total) return { avg: 0, total: 0, buckets: [0, 0, 0, 0, 0] };
    let sum = 0;
    const buckets = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const rt = Math.max(1, Math.min(5, Number(r.rating || 0)));
      buckets[rt - 1] += 1;
      sum += rt;
    });
    return { avg: Math.round((sum / total) * 10) / 10, total, buckets };
  }, [reviews]);

  const pageCount = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return reviews.slice(start, start + PAGE_SIZE);
  }, [page, reviews]);

  const handleSaved = async (saved) => {
    setMyReview(saved);
    setEditingReview(null);
    await loadPublic();
    onRatingChanged?.(); 
    toast.success(
      saved?.isApproved
        ? "Review published"
        : "Review submitted and awaiting approval"
    );
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    try {
      document
        .getElementById("reviews-form")
        ?.scrollIntoView({ behavior: "smooth" });
    } catch {}
  };

  const handleDelete = async (review) => {
    try {
      await api.delete(`/reviews/${review._id}`);
      toast.success("Review deleted");
      if (myReview?._id === review._id) setMyReview(null);
      await loadPublic();
      await loadMine();
      onRatingChanged?.(); // ✅ refresh rating after a change
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const Bar = ({ label, count, total }) => {
    const pct = total ? Math.round((count / total) * 100) : 0;
    return (
      <div className="flex items-center gap-2">
        <span className="w-12 text-xs text-gray-600">{label}★</span>
        <div className="flex-1 h-2 bg-gray-200 rounded">
          <div
            className="h-2 rounded bg-green-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="w-10 text-xs text-gray-600 text-right">{pct}%</span>
      </div>
    );
  };

  return (
    <section id="reviews" className="mt-10">
      {/* Rating summary and filters */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-3xl font-bold text-[#0D9488]">
              {avg.toFixed(1)}
            </div>
            <StarRating value={Math.round(avg)} readOnly size="lg" />
            <div className="text-xs text-gray-500">
              {total} review{total === 1 ? "" : "s"}
            </div>
          </div>
          <div className="hidden md:block w-px h-16 bg-gray-200" />
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((i) => (
              <Bar key={i} label={i} count={buckets[i - 1]} total={total} />
            ))}
          </div>
        </div>

        {/* Sorting and filter options */}
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-600 focus:ring-[#0D9488] cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
          <label className="text-sm flex items-center gap-1 text-gray-700">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="accent-[#0D9488] cursor-pointer"
            />
            Verified only
          </label>
        </div>
      </div>

      {/* Review Form or Login Alert */}
      <div id="reviews-form" className="mt-4">
        {!currentUserId ? (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-700">
            Please log in to write a review.
          </div>
        ) : eligible ? (
          <ReviewForm
            hotelId={hotelId}
            roomId={roomId}
            existing={editingReview || null}
            onSaved={handleSaved}
            onCancel={() => setEditingReview(null)}
          />
        ) : (
          <div className="p-3 text-sm text-gray-600 border border-gray-300 rounded-lg bg-white">
            You can write a review after completing a paid stay at this hotel.
          </div>
        )}
      </div>

      {/* Pending review status */}
      {myReview && !myReview.isApproved && (
        <div className="mt-3 p-3 bg-[#FFF7ED] border border-[#FDBA74] rounded-lg text-sm">
          <div className="font-medium text-[#FB7185]">
            Thanks for your review!
          </div>
          <div className="text-gray-700">
            It’s <strong>awaiting admin approval</strong>. Once approved, it
            will appear below and be counted in the hotel’s rating.
          </div>
        </div>
      )}

      {/* Public reviews list */}
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 mt-4 shadow-sm space-y-3">
        {loading ? (
          <div className="text-sm text-gray-500">Loading reviews…</div>
        ) : reviews.length ? (
          <ReviewList
            reviews={pageItems}
            currentUserId={currentUserId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <div className="text-sm text-gray-500">
            {verifiedOnly
              ? "No verified reviews yet."
              : "No reviews have been posted yet."}
          </div>
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 cursor-pointer disabled:opacity-50"
              disabled={page <= 1}
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 cursor-pointer disabled:opacity-50"
              disabled={page >= pageCount}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
