import React, { useState, useEffect, useMemo, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../lib/axios";
import Spinner from "../components/common/Spinner";
import StripeCheckoutWrapper from "../components/StripeCheckoutWrapper";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import {
  Calendar,
  CalendarCogIcon,
  CalendarFoldIcon,
  Coins,
  LucideCalendarRange,
  PartyPopperIcon,
  Sparkle,
  Users,
} from "lucide-react";

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const BookingForm = () => {
  const navigate = useNavigate();
  const { hotelId, roomId } = useParams();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);

  // Read initial query params
  const queryParams = new URLSearchParams(location.search);
  const initialSpecialRequest = queryParams.get("specialRequest") || "";

  // STATES
  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  // Seed specialRequests from URL
  const [specialRequests, setSpecialRequests] = useState(initialSpecialRequest);

  const [offerCode, setOfferCode] = useState("");
  const [availableOffers, setAvailableOffers] = useState([]);
  const [discount, setDiscount] = useState(0);

  const [coinBalance, setCoinBalance] = useState(0);
  const [coinsToUse, setCoinsToUse] = useState(0);

  const [bookingId, setBookingId] = useState("");
  const [lastBooking, setLastBooking] = useState(null);
  const [lastOffers, setLastOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Sync date/guest/specialRequests when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ci = params.get("checkIn");
    const co = params.get("checkOut");
    const g = params.get("guests");
    const sr = params.get("specialRequest");

    if (ci) setCheckIn(ci);
    if (co) setCheckOut(co);
    if (g) setGuests(Number(g));
    if (sr !== null) setSpecialRequests(sr);
  }, [location.search]);

  // Load hotel + room data
  useEffect(() => {
    const load = async () => {
      try {
        const [hotelRes, roomsRes] = await Promise.all([
          api.get(`/hotels/${hotelId}`),
          api.get(`/rooms/${hotelId}`),
        ]);
        setHotel(hotelRes.data);
        const selected = Array.isArray(roomsRes.data)
          ? roomsRes.data.find((r) => r._id === roomId)
          : null;
        setRoom(selected);
      } catch (err) {
        console.error("Failed to load hotel/room:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hotelId, roomId]);

  // Fetch coin balance
  useEffect(() => {
    const user = getCurrentUser();
    if (!user?._id) return;

    api
      .get("/users/me")
      .then((res) => setCoinBalance(Number(res.data?.loyaltyCoins || 0)))
      .catch(() => setCoinBalance(0));
  }, []);

  // Compute nights and baseTotal
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn + "T00:00:00");
    const end = new Date(checkOut + "T00:00:00");

    if (isNaN(start) || isNaN(end)) return 0;

    const diff = (end - start) / 86_400_000;
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const baseTotal = useMemo(() => {
    return room?.price && nights ? Number(room.price) * nights : 0;
  }, [room, nights]);

  // Clamp and derive coin value
  const clampedCoinsToUse = Math.max(
    0,
    Math.min(Number(coinsToUse) || 0, coinBalance)
  );
  const coinValue = clampedCoinsToUse * 1; // ₹1/coin

  const remainingBalance = Math.max(0, coinBalance - clampedCoinsToUse);
  const total = Math.max(0, baseTotal - discount - coinValue);

  // Load available offers
  useEffect(() => {
    const loadOffers = async () => {
      try {
        const res = await api.get(`/offers/hotel/${hotelId}`);
        setAvailableOffers(res.data || []);
      } catch (err) {
        console.error("Failed to load offers:", err);
      }
    };
    loadOffers();
  }, [hotelId]);

  // ⬇️ Add this just after the other useEffects (e.g., after "Load available offers")
  useEffect(() => {
    if (!bookingId) return;

    const checkPaidAndRedirect = async () => {
      try {
        const { data } = await api.get(`/bookings/${bookingId}`);
        if (data?.paymentStatus === "paid" || data?.status === "booked") {
          navigate(`/booking-success/${data._id}`, {
            state: { booking: data, justBooked: true },
            replace: true, // prevent going back to payment
          });
        }
      } catch {
        // ignore fetch errors; user stays on page
      }
    };

    checkPaidAndRedirect();
  }, [bookingId, navigate]);

  const applyOffer = async () => {
    if (!room) return toast.error("Room not selected");
    if (!checkIn || !checkOut) return toast.error("Please choose valid dates");

    const start = new Date(checkIn + "T00:00:00");
    const end = new Date(checkOut + "T00:00:00");

    if (isNaN(start) || isNaN(end) || end <= start) {
      return toast.error("Please choose a valid date range");
    }

    if (!offerCode.trim()) return toast.error("Enter a promo code");

    try {
      const res = await api.post("/offers/apply", {
        code: offerCode.trim(),
        cartTotal: baseTotal,
        hotelId,
      });
      setDiscount(res.data?.discount || 0);
    } catch (err) {
      setDiscount(0);
      toast.error(err?.response?.data?.message || "Invalid or expired offer");
    }
  };

  // Booking creation
  const createBooking = async () => {
    if (!room || !hotel) return;
    if (nights === 0) return toast.error("Please choose valid dates");
    if (guests < 1) return toast.error("Guests must be at least 1");
    if (clampedCoinsToUse > coinBalance)
      return toast.error("You cannot use more coins than you have");

    setCreating(true);
    try {
      const payload = {
        hotelId,
        roomId,
        checkIn, // "YYYY-MM-DD"
        checkOut, // "YYYY-MM-DD"
        guests,
        specialRequests,
        offerCode: offerCode?.trim() || undefined,
        loyaltyCoinsToUse: clampedCoinsToUse,
      };

      const res = await api.post("/bookings", payload);
      const b = res.data?.booking;
      setBookingId(b?._id || "");
      setLastBooking(b);
      setLastOffers(res.data.currentOffers || []);

      // Step‑5: If final is zero → skip Stripe
      if (b && (b.finalAmount || 0) === 0) {
        try {
          const me = await api.get("/users/me");
          setUser(me.data);
          localStorage.setItem("user", JSON.stringify(me.data));
          navigate(`/booking-success/${b._id}`, {
            state: {
              booking: b,
              currentOffers: res.data.currentOffers || [],
              updatedUser: me.data,
              justBooked: true,
            },
            replace: true,
          });
        } catch {
          navigate(`/booking-success/${b._id}`, {
            state: {
              booking: b,
              currentOffers: res.data.currentOffers || [],
              justBooked: true,
            },
            replace: true,
          });
        }
        return;
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Could not create booking");
    } finally {
      setCreating(false);
    }
  };

  const handlePaymentSuccess = (updatedBooking) => {
    const finalBooking = updatedBooking || lastBooking;
    if (!finalBooking?._id) {
      console.error("No booking ID available after payment success");
      return;
    }

    api
      .get("/users/me")
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate(`/booking-success/${finalBooking._id}`, {
          state: {
            booking: finalBooking,
            currentOffers: lastOffers,
            updatedUser: res.data, // in the then branch
            justBooked: true,
          },
          replace: true,
        });
      })
      .catch(() => {
        navigate(`/booking-success/${finalBooking._id}`, {
          state: {
            booking: finalBooking,
            currentOffers: lastOffers,
            justBooked: true,
          },
          replace: true,
        });
      });
  };

  if (loading) return <Spinner />;
  if (!room || !hotel) return <div className="p-4">Room not found</div>;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-start pt-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-5 space-y-2">
        {/* Header */}
        <h2 className="text-xl font-bold text-[#0a5e57] text-center">
          {hotel.name}
        </h2>

        {/* Date Inputs */}
        <div className="space-y-2">
          <label className="text-gray-500 flex">
            <LucideCalendarRange className="w-5 h-5" />
            CheckIn
          </label>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#0D9488]/50 transition outline-none text-gray-500 caret-[#0a5e57]"
          />
          <label className="text-gray-500 flex">
            <LucideCalendarRange className="w-5 h-5" />
            CheckOut
          </label>
          <input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#0D9488]/50 transition outline-none text-gray-500 caret-[#0a5e57]"
          />
        </div>

        {/* Guests Input */}
        <label className="text-gray-500 flex">
          <Users className="w-5 h-5" />
          Guests
        </label>
        <input
          type="number"
          min={1}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          placeholder="Guests"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#0D9488]/50 transition outline-none text-gray-500 caret-[#0a5e57]"
        />

        {/* Special Requests */}
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Special requests (e.g. early check-in)"
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#0D9488]/50 transition resize-none outline-none text-gray-500 caret-[#0a5e57]"
        />

        {/* Offer Code & Apply Button */}
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={offerCode}
            onChange={(e) => {
              const val = e.target.value;
              setOfferCode(val);
              if (!val.trim()) setDiscount(0);
            }}
            placeholder="Promo Code"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#0D9488]/50 transition outline-none text-gray-500 caret-[#0a5e57]"
          />
          {availableOffers.length > 0 && (
            <div className="bg-[#b5eae7] text-gray-700 rounded-lg p-2 text-sm space-y-1">
              <p className="font-semibold flex gap-2 ml-2">
                Available Offers
                <PartyPopperIcon className="w-5 h-5" />
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {availableOffers.map((o) => {
                  const discountText = o.discountPercent
                    ? `${o.discountPercent}% off`
                    : o.discountFlat
                    ? `₹${o.discountFlat} off`
                    : "";
                  return (
                    <li key={o._id}>
                      <span className="font-mono">{o.code}</span> —{" "}
                      {o.description || "Special offer"} ({discountText})
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <button
            disabled={!offerCode.trim()}
            onClick={applyOffer}
            className={`w-full py-2 rounded ${
              offerCode.trim()
                ? "bg-[#0D9488] text-white hover:bg-[#0f766e]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            } transition`}
          >
            Apply
          </button>
        </div>

        {/* Loyalty Coins */}
        <div className="space-y-2 mt-4">
          <label className="text-gray-500 flex">
            <Coins className="w-5 h-5" />
            Coins To use
          </label>
          <input
            type="number"
            min={0}
            max={coinBalance}
            value={coinsToUse}
            onChange={(e) => {
              const raw = Number(e.target.value);
              const clamped = Math.max(
                0,
                Math.min(isNaN(raw) ? 0 : raw, coinBalance)
              );
              setCoinsToUse(clamped);
            }}
            placeholder="Coins to use"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#0D9488]/50 transition outline-none text-gray-500 caret-[#0a5e57]"
          />
          <p className="text-xs text-gray-600">
            Available: {remainingBalance} of {coinBalance} | Value: ₹{coinValue}
          </p>
        </div>

        {/* Summary */}
        <div className="space-y-1 text-gray-600 text-right text-[16px] mt-5">
          <p>
            Base Price: ₹{room.price} × {nights}{" "}
            {nights > 1 ? "nights" : "night"}
          </p>
          <p>Discount: -₹{discount}</p>
          <p>Coins: -₹{coinValue}</p>
          <p className="font-semibold text-xl text-[#0D9488]">
            Total: ₹{total}
          </p>
        </div>

        {/* Call-to-Action */}
        {!bookingId ? (
          <button
            onClick={createBooking}
            disabled={
              creating ||
              nights === 0 ||
              !checkIn ||
              !checkOut ||
              coinsToUse > coinBalance
            }
            className={`w-full py-3 rounded text-white font-medium transition ${
              creating ||
              nights === 0 ||
              !checkIn ||
              !checkOut ||
              coinsToUse > coinBalance
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#0D9488] hover:bg-[#0f766e]"
            }`}
          >
            {creating ? "Processing…" : "Proceed to Payment"}
          </button>
        ) : lastBooking?.paymentStatus === "paid" ? (
          <p className="text-center font-semibold text-green-600">
            Booking Confirmed (no payment needed)
          </p>
        ) : (
          <StripeCheckoutWrapper
            bookingId={bookingId}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default BookingForm;
