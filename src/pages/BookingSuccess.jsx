import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../lib/axios";
import Spinner from "../components/common/Spinner";
import {
  Bed,
  Calendar,
  CheckCircle2,
  Coins,
  Hotel,
  Phone,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import StatusBadge from "../components/StatusBadge";

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // use the state booking as a starting point, but we'll ALWAYS fetch latest
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(true);
  const justBooked = location.state?.justBooked;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split("-");
        return `${d}-${m}-${y}`;
      }
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const totalPaid = useMemo(() => {
    if (!booking) return 0;
    if (typeof booking.finalAmount === "number") return booking.finalAmount;
    const base = booking.totalAmount || 0;
    const lessDiscount = base - (booking.discountAmount || 0);
    const final = lessDiscount - (booking.loyaltyCoinsUsed || 0);
    return Math.max(final, 0);
  }, [booking]);

  const fetchLatest = async () => {
    if (!bookingId) return null;
    try {
      const res = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data);
      return res.data;
    } catch (err) {
      console.error("Error fetching booking:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let iv;
    (async () => {
      const first = await fetchLatest();
      if (justBooked) {
        let tries = 0;
        iv = setInterval(async () => {
          tries += 1;
          const latest = await fetchLatest();
          if ((latest && latest.paymentStatus === "paid") || tries >= 10) {
            clearInterval(iv);
          }
        }, 1500);
      }
    })();
    return () => iv && clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  useEffect(() => {
    if (justBooked && booking?.loyaltyCoinsEarned > 0) {
      toast.success(
        `🎉 You earned +${booking.loyaltyCoinsEarned} loyalty coins!`,
        {
          position: "top-center",
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Spinner />;

  if (!booking) {
    return (
      <div className="p-4 text-red-600 font-bold">
        Booking not found or failed to load.
      </div>
    );
  }

  const heading =
    booking.paymentStatus === "paid"
      ? "🎉 Booking Confirmed!"
      : "⏳ Booking Created";

return (
  <div className="bg-gradient-to-tr from-[#ccfbf1] to-[#fce7f3] px-4 py-8">
    <div className="w-full max-w-3xl md:max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-5 md:p-8 space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <CheckCircle2 className="mx-auto text-[#0D9488] w-16 h-16" />
        <h1 className="text-3xl md:text-4xl font-bold text-[#0D9488] mt-3">
          {heading}
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Your stay at{" "}
          <span className="font-semibold">
            {booking.hotel?.name || "Hotel"}
          </span>{" "}
          {booking.paymentStatus === "paid"
            ? "is booked"
            : "is created (awaiting payment)"}
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Booking Summary (full width) */}
        <div className="md:col-span-2 border border-[#E5E7EB] rounded-xl p-4 bg-white space-y-2">
          <h2 className="text-lg font-semibold text-[#0D9488] mb-2">
            Booking Summary
          </h2>
          <p className="text-sm text-gray-700">
            <User className="inline mr-2 w-4 h-4 text-[#0D9488]" />
            Name: {booking.user?.name || "N/A"}
          </p>
          <p className="text-sm text-gray-700">
            <Hotel className="inline mr-2 w-4 h-4 text-[#0D9488]" />
            Hotel:{" "}
            <span className="inline-block max-w-[18rem] truncate align-bottom">
              {booking.hotel?.name || "Unknown Hotel"}
            </span>
          </p>
          <p className="text-sm text-gray-700">
            <Bed className="inline mr-2 w-4 h-4 text-[#0D9488]" />
            Room:{" "}
            <span className="inline-block max-w-[18rem] truncate align-bottom">
              {booking.room?.name || "N/A"}
            </span>
          </p>
          <p className="text-sm text-gray-700">
            <Calendar className="inline mr-2 w-4 h-4 text-[#0D9488]" />
            {formatDate(booking.checkIn)} ➡️ {formatDate(booking.checkOut)}
          </p>
        </div>

        {/* Payment Details */}
        <div className="border border-[#E5E7EB] rounded-xl p-4 bg-white space-y-2">
          <h2 className="text-lg font-semibold text-[#0D9488] mb-2">
            Payment Details
          </h2>
          <p className="text-sm">Original Amount: ₹{booking.totalAmount}</p>
          {booking.discountAmount > 0 && (
            <p className="text-sm text-[#0D9488]">
              Discount: -₹{booking.discountAmount}
            </p>
          )}
          {booking.loyaltyCoinsUsed > 0 && (
            <p className="text-sm text-yellow-600">
              Coins used: -₹{booking.loyaltyCoinsUsed}
            </p>
          )}
          <p className="text-lg font-semibold text-gray-900 mt-2">
            Total Paid: ₹{totalPaid}
          </p>
          <div
            className="flex justify-between items-center text-sm mt-2"
            role="status"
            aria-live="polite"
          >
            <span>Status</span>
            <StatusBadge status={booking.paymentStatus} />
          </div>
        </div>

        {/* Rewards */}
        <div className="border border-[#E5E7EB] rounded-xl p-4 bg-white space-y-1">
          <h2 className="text-lg font-semibold text-[#0D9488] mb-2">Rewards</h2>
          <p className="text-sm">
            <Coins className="inline mr-2 w-4 h-4 text-yellow-500" />
            {booking.loyaltyCoinsEarned > 0 ? (
              <>
                You earned{" "}
                <span className="font-bold text-[#0D9488]">
                  +{booking.loyaltyCoinsEarned}
                </span>{" "}
                loyalty coins
              </>
            ) : (
              "No coins earned this time"
            )}
          </p>
          {booking.offerCode && (
            <p className="text-sm">
              Offer Applied: <strong>{booking.offerCode}</strong> (You saved ₹
              {booking.discountAmount})
            </p>
          )}
        </div>

        {/* Emergency Contact (full width) */}
        <div className="md:col-span-2 border border-[#E5E7EB] rounded-xl p-4 bg-white">
          <h2 className="text-lg font-semibold text-[#0D9488] mb-2">
            Emergency Contact
          </h2>
          <p className="text-sm text-gray-700">
            <Phone className="inline mr-2 w-4 h-4 text-[#0D9488]" />
            {booking.emergencyContactSnapshot?.name || "Hotel Staff"} —{" "}
            {booking.emergencyContactSnapshot?.phone || "N/A"}
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-gray-500 text-sm">
        A confirmation email has been sent to{" "}
        <strong>{booking.user?.email || "your email"}</strong>
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center md:justify-end gap-4 mt-4">
        <Link
          to="/my-bookings"
          className="px-2 md:px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0f766e] transition"
        >
          View My Bookings
        </Link>
        <Link
          to="/"
          className="px-2 md:px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Back to Home
        </Link>
      </div>

      {/* Info Banner */}
      <div className="mt-4 p-3 bg-[#E0F2F1] border border-[#B2DFDB] rounded-lg text-center text-sm text-[#00695C]">
        You’ll be able to write a review after your stay. We’ll send a reminder 🎗️
      </div>
    </div>
  </div>
);

};

export default BookingSuccess;
