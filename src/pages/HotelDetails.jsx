import React, { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { eachDayOfInterval } from "date-fns";

import AvailabilityBar from "../components/AvailabilityBar";
import ReviewModal from "../components/review/ReviewModal";
import ReviewsSection from "../components/review/ReviewsSection";
import StarRating from "../components/review/StarRating";
import { ArrowLeft } from "lucide-react";
import Spinner from "../components/common/Spinner";

const HotelDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialRequests, setSR] = useState({});
  const [calendarData, setCalendarData] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [myExistingReview, setMyExistingReview] = useState(null);
  const [eligible, setEligible] = useState(null);

  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "";

  const fmt = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  const isPast = (d) =>
    new Date(d).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

  const disableBooking =
    !checkIn || !checkOut || !guests || isPast(checkIn) || isPast(checkOut);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setLoading(true);
        const { data: hotelData } = await api.get(`/hotels/${id}`);
        setHotel(hotelData);

        if (checkIn && checkOut) {
          const { data: avail } = await api.get(
            `/hotels/${id}/available-rooms`,
            {
              params: {
                checkIn: fmt(checkIn),
                checkOut: fmt(checkOut),
                guests,
              },
            }
          );
          setRooms(avail.rooms);

          const { data: calendar } = await api.get(`/availability`, {
            params: {
              hotelId: id,
              startDate: fmt(checkIn),
              endDate: fmt(checkOut),
            },
          });
          setCalendarData(calendar);
        } else {
          setRooms(hotelData.rooms || []);
          setCalendarData(null);
        }
      } catch {
        toast.error("Hotel not found");
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id, checkIn, checkOut, guests]);

  useEffect(() => {
    const open = location.state?.openReview;
    if (!open) return;
    navigate(location.pathname + location.search, { replace: true, state: {} });
    (async () => {
      try {
        const { data } = await api.get(`/reviews/my`, {
          params: { hotelId: id },
        });
        setMyExistingReview(data || null);
      } catch {
        setMyExistingReview(null);
      } finally {
        setReviewOpen(true);
      }
    })();
  }, [location.state, id, navigate, location.pathname, location.search]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setEligible(false);
      return;
    }
    api
      .get(`/reviews/eligibility/${id}`)
      .then(({ data }) => setEligible(!!data.eligible))
      .catch(() => setEligible(false));
  }, [id]);

  const refreshHotelRating = async () => {
    try {
      const { data } = await api.get(`/hotels/${id}`);
      setHotel((prev) => ({
        ...prev,
        ratingAvg: data.ratingAvg,
        ratingCount: data.ratingCount,
      }));
    } catch (err) {
      console.error("Failed to refresh rating", err);
    }
  };

  const formatLocalYmd = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const selectedRangeDates =
    checkIn && checkOut
      ? eachDayOfInterval({
          start: new Date(checkIn),
          end: new Date(new Date(checkOut).getTime() - 24 * 60 * 60 * 1000),
        }).map(formatLocalYmd)
      : [];

  const availableRooms = rooms.map((room) => {
    const relevant =
      room.availability?.filter((d) => selectedRangeDates.includes(d.date)) ||
      [];
    if (relevant.length === 0) {
      return { ...room, totalRooms: room.totalRooms || 0, roomsLeft: 0 };
    }
    const minRoomsLeft = relevant.reduce((min, d) => {
      const left = d.totalRooms - d.bookedRooms;
      return Math.min(min, left);
    }, relevant[0].totalRooms);
    return {
      ...room,
      totalRooms: relevant[0]?.totalRooms || room.totalRooms || 0,
      roomsLeft: Math.max(0, minRoomsLeft),
    };
  });

  if (loading) return <Spinner />;

  if (!hotel)
    return <p className="text-center mt-8 text-red-500">Hotel not found</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#0D9488] hover:text-[#0F766E] transition mt-5"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      <h1 className="text-3xl font-bold text-[#0D9488]">{hotel.name}</h1>

      {typeof hotel.ratingAvg === "number" && (
        <div className="mt-1 flex items-center gap-2">
          <StarRating
            value={Math.round(hotel.ratingAvg || 0)}
            readOnly
            size="md"
          />
          <span className="text-sm text-gray-600">
            {Number(hotel.ratingAvg || 0).toFixed(1)}
            {typeof hotel.ratingCount === "number" && (
              <span className="text-gray-400">
                {" "}
                ({hotel.ratingCount} reviews)
              </span>
            )}
          </span>
        </div>
      )}

      {hotel.images?.[0]?.url && (
        <img
          src={hotel.images[0].url}
          alt={hotel.name}
          className="w-full h-64 object-cover rounded-lg shadow-md"
        />
      )}

      <AvailabilityBar
        hotelId={id}
        initialCalendar={calendarData}
        roomsAvailability={availableRooms.map((r) => ({
          roomId: r._id,
          availability: r.availability || [],
          roomsLeft: r.roomsLeft,
        }))}
      />

      {hotel.description && (
        <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
      )}

      {hotel.amenities?.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-[#0D9488]">Amenities</h2>
          <ul className="list-disc list-inside mb-6 text-sm text-gray-600 space-y-1">
            {hotel.amenities.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}

      <h2 className="text-xl font-semibold text-[#0D9488] mb-4">
        Available Rooms
      </h2>

      {availableRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {availableRooms.map((room) => (
            <div
              key={room._id}
              className="border border-gray-300 p-4 bg-white rounded-xl shadow-sm flex flex-col"
            >
              {room.images?.[0]?.url && (
                <img
                  src={room.images[0].url}
                  alt={room.name}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
              )}

              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-800">{room.name}</h3>
                <p
                  className={`text-sm ${
                    room.roomsLeft > 0 ? "text-green-700" : "text-red-500"
                  }`}
                >
                  {room.roomsLeft > 0
                    ? `${room.roomsLeft} of ${room.totalRooms} room(s) left`
                    : "Fully booked"}
                </p>
              </div>

              {room.bedType && (
                <p className="text-sm text-gray-600">{room.bedType}</p>
              )}

              {room.price != null && (
                <p className="mt-2 text-[#0D9488] font-semibold text-base">
                  ₹{room.price.toLocaleString()}{" "}
                  <span className="text-sm text-gray-600">/ night</span>
                </p>
              )}

              <p className="text-xs text-gray-500">
                Capacity:{" "}
                {(room.capacity?.adults || 0) + (room.capacity?.children || 0)}{" "}
                guests
              </p>

              {room.description && (
                <p className="text-sm text-gray-700 mt-2">{room.description}</p>
              )}

              <textarea
                placeholder="Any special requests?"
                value={specialRequests[room._id] || ""}
                onChange={(e) =>
                  setSR((prev) => ({ ...prev, [room._id]: e.target.value }))
                }
                className="border border-gray-300 rounded-md p-2 mt-3 text-sm focus:outline-none resize-none focus:ring-1 focus:ring-[#0D9488]"
              />

              <button
                onClick={() =>
                  navigate(
                    `/booking/${hotel._id}/${
                      room._id
                    }?checkIn=${encodeURIComponent(
                      checkIn
                    )}&checkOut=${encodeURIComponent(
                      checkOut
                    )}&guests=${guests}&specialRequest=${encodeURIComponent(
                      specialRequests[room._id] || ""
                    )}`
                  )
                }
                disabled={room.roomsLeft === 0 || disableBooking}
                className={`mt-5 px-4 py-2 rounded-md text-white text-sm font-medium transition ${
                  room.roomsLeft === 0 || disableBooking
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-br from-[#0D9488] to-[#68b4ad] hover:bg-gradient-to-tl active:scale-105 transition duration-400"
                }`}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      ) : checkIn && checkOut ? (
        <p className="text-red-500">No rooms available for these dates</p>
      ) : (
        <p className="text-gray-500">Select dates to view rooms</p>
      )}

      <ReviewsSection
        hotelId={id}
        roomId={null}
        eligibleOverride={eligible}
        onRatingChanged={refreshHotelRating}
      />

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        hotelId={id}
        roomId={null}
        existing={myExistingReview}
        onRatingChanged={refreshHotelRating}
      />
    </div>
  );
};

export default HotelDetails;
