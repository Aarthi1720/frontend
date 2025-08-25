import React, { useState, useEffect, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { AuthContext } from "../context/AuthContext";
import StarRating from "./review/StarRating";
import { Heart, MapPin } from "lucide-react";

const HotelCard = ({ hotel, onRemoveFavorite }) => {
  const { user } = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toggling, setToggling] = useState(false);

  const hasRatingFromServer =
    hotel?.ratingAvg != null && hotel?.ratingCount != null;

  const [ratingAvg, setRatingAvg] = useState(
    hasRatingFromServer ? Number(hotel.ratingAvg) : null
  );
  const [ratingCount, setRatingCount] = useState(
    hasRatingFromServer ? Number(hotel.ratingCount) : null
  );

  // Fallback rating fetch (UI only; no logic changes to API)
  useEffect(() => {
    if (hasRatingFromServer) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/reviews/hotel/${hotel._id}`);
        if (cancelled) return;
        const reviews = Array.isArray(data) ? data : [];
        if (reviews.length) {
          const sum = reviews.reduce(
            (acc, r) => acc + (Number(r.rating) || 0),
            0
          );
          setRatingAvg(sum / reviews.length);
          setRatingCount(reviews.length);
        } else {
          setRatingAvg(null);
          setRatingCount(0);
        }
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hotel._id, hasRatingFromServer]);

  // Is favorite?
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .get("/users/favorites")
      .then((res) => {
        if (cancelled) return;
        const favs = Array.isArray(res.data) ? res.data : [];
        setIsFavorite(favs.some((h) => h?._id === hotel._id));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, hotel._id]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please log in to manage favorites");
    if (toggling) return;
    setToggling(true);
    try {
      if (isFavorite) {
        await api.delete(`/users/favorites/${hotel._id}`);
        toast.success("Removed from favorites");
        if (onRemoveFavorite) onRemoveFavorite(hotel._id);
      } else {
        await api.post(`/users/favorites/${hotel._id}`);
        toast.success("Added to favorites");
      }
      setIsFavorite((v) => !v);
    } catch {
      toast.error("Could not update favorite");
    } finally {
      setToggling(false);
    }
  };

  // Price display (UI only)
  const priceNumber = useMemo(() => {
    const n = Number(hotel?.price);
    return Number.isFinite(n) ? n : null;
  }, [hotel?.price]);

  const imageUrl =
    hotel?.images?.[0]?.url || "https://source.unsplash.com/400x300/?hotel";

  const amenities = Array.isArray(hotel?.amenities)
    ? hotel.amenities.slice(0, 3)
    : [];

  return (
    <Link to={`/hotels/${hotel._id}`} className="block h-full">
      <div className="relative bg-white rounded-xl border border-[#E5E7EB] shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
        {/* Image */}
        <div className="relative h-40 sm:h-48 bg-[#E5E7EB] overflow-hidden">
          <img
            src={imageUrl}
            alt={hotel?.name || "Hotel"}
            className="w-full h-full object-cover rounded-t-xl"
            loading="lazy"
          />

          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            disabled={toggling}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            aria-pressed={isFavorite}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur border border-[#E5E7EB] shadow focus:outline-none focus:ring-2 focus:ring-[#99F6E4]"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "text-[#FB7185] fill-[#FB7185]" : "text-[#94A3B8]"
              }`}
              strokeWidth={2.2}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-between flex-grow">
          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold text-[#111827] line-clamp-1">
            {hotel?.name || "Unnamed Hotel"}
          </h3>

          {/* Location */}
          <div className="mt-1 flex items-center gap-1.5 text-sm text-[#6B7280] line-clamp-1">
            <MapPin className="w-4 h-4 text-[#0D9488]" />
            <span>
              {hotel?.location?.city}
              {hotel?.location?.state ? `, ${hotel.location.state}` : ""}
            </span>
          </div>

          {/* Price + Rating */}
          <div className="mt-3 flex items-center justify-between">
            <div>
              {priceNumber != null ? (
                <span className="text-[#0D9488] font-semibold">
                  ₹{priceNumber.toLocaleString()}
                  <span className="text-[#6B7280] text-sm"> /night</span>
                </span>
              ) : (
                <span className="text-xs text-[#0D9488] bg-[#CCFBF1] border border-[#99F6E4] rounded-full px-2 py-0.5">
                  Check availability
                </span>
              )}
            </div>
            <div className="hidden lg:flex  md:items-center md:gap-1 ">
              <StarRating
                value={Math.round(ratingAvg || 0)}
                readOnly
                size="sm"
              />
              <span className="text-xs text-[#6B7280]">
                {ratingAvg != null ? ratingAvg.toFixed(1) : "—"}
                {typeof ratingCount === "number" && (
                  <span className="text-[#94A3B8]"> ({ratingCount})</span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-start gap-1 lg:hidden ">
            <StarRating value={Math.round(ratingAvg || 0)} readOnly size="sm" />
            <span className="text-xs text-[#6B7280]">
              {ratingAvg != null ? ratingAvg.toFixed(1) : "—"}
              {typeof ratingCount === "number" && (
                <span className="text-[#94A3B8]"> ({ratingCount})</span>
              )}
            </span>
          </div>

          {/* Amenities preview */}
          {!!amenities.length && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {amenities.map((a, i) => (
                <span
                  key={i}
                  className="text-xs text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] rounded-full px-2 py-1"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
