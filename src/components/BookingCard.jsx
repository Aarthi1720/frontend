import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import {
  BadgePercent,
  BedIcon,
  Coins,
  CreditCard,
  Eye,
  FileDown,
  Hotel,
  Phone,
  UsersRound,
  WalletCards,
  XCircle,
} from "lucide-react";
import {
  CalendarDateRangeIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/solid";

const BookingCard = ({
  booking,
  onCancel,
  onDownloadInvoice,
  onPay,
  canCancel = false,
  canInvoice = false,
  canPay = false,
  isOwner = false,
  isAdminView = false,
  highlight = false,
}) => {
  const ec = booking.emergencyContactSnapshot || {};

  // Canonical values (match backend contract)
  const base = Number(booking?.totalAmount || 0); // original before discounts/coins
  const discount = Number(booking?.discountAmount || 0); // offer discount (money saved)
  const coinsUsed = Number(booking?.loyaltyCoinsUsed || 0); // coins applied

  // Final amount shown to the user (server-trusted if present)
  const netPaid =
    typeof booking?.finalAmount === "number"
      ? booking.finalAmount
      : Math.max(base - discount - coinsUsed, 0);

  const roomLabel =
    booking.roomId?.displayName ||
    booking.roomId?.name ||
    booking.roomId?.type ||
    "N/A";

  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-sm border-2 border-gray-400 ${
        highlight ? "ring-2 ring-yellow-400" : ""
      } transition-shadow hover:shadow-md`}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-[#0F766E] flex gap-2">
            <Hotel className="w-5 h-5" />
            <span>{booking.hotelId?.name || "Hotel"}</span>
          </h2>
          <p className="text-sm text-gray-600 flex gap-2">
            <BedIcon className="w-5 h-5" />
            Room: {roomLabel}
            {booking.roomId?.bedType ? ` (${booking.roomId.bedType})` : ""}
          </p>
          {isAdminView && !isOwner && (
            <p className="text-xs text-gray-500 italic mt-1">
              Viewing as Admin (not owner)
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={booking.status} />
          <StatusBadge status={booking.paymentStatus} />
        </div>
      </div>

      {/* Booking Info */}
      <div className="mt-4 text-sm text-gray-600 space-y-2">
        <p className="flex gap-2">
          <CalendarDateRangeIcon className="w-5 h-5" />
          <strong className="text-gray-600">Check‑in:</strong>{" "}
          {new Date(booking.checkIn).toLocaleDateString()}
        </p>
        <p className="flex gap-2">
          <CalendarDateRangeIcon className="w-5 h-5" />
          <strong className="text-gray-600">Check‑out:</strong>{" "}
          {new Date(booking.checkOut).toLocaleDateString()}
        </p>
        <p className="flex gap-2">
          <UsersRound className="w-5 h-5" />
          <strong className="text-gray-600">Guests:</strong> {booking.guests}
        </p>

        {/* Pricing Breakdown */}
        <div className="mt-3 p-3 rounded-md border bg-gray-50 space-y-2">
          <p className="flex gap-2">
            <BadgePercent className="w-5 h-5" />
            <strong>Offer Applied:</strong>{" "}
            {booking.offerCode
              ? `${booking.offerCode} (Saved ₹${discount})`
              : "—"}
          </p>
          <p className="flex gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <strong>Coins Used:</strong> {coinsUsed} Coins
            {coinsUsed ? ` (₹${coinsUsed})` : ""}
          </p>
          {Number(booking?.loyaltyCoinsEarned || 0) > 0 && (
            <p className="flex gap-2">
              <Coins className="w-5 h-5 text-green-500" />
              <strong>Coins Earned:</strong> {booking.loyaltyCoinsEarned} Coins
            </p>
          )}
          <p className="flex gap-2">
            <CurrencyRupeeIcon className="w-5 h-5 text-green-700" />
            <strong>Subtotal (original):</strong> ₹{base}
          </p>
          <p className="font-semibold flex gap-2">
            <WalletCards className="w-5 h-5 " />
            <strong>Final (to pay / paid):</strong> ₹{netPaid}
          </p>
        </div>

        {/* Emergency Contact */}
        {(ec.name || ec.phone || ec.role) && (
          <div className="mt-3 p-3 rounded-md border bg-gray-50">
            <p className="font-medium text-gray-600 flex gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              Emergency Contact
            </p>
            <p className="text-xs text-gray-700 mt-1">
              {ec.role ? `${ec.role}: ` : ""}
              {ec.name || "On-duty Manager"} ·{" "}
              {ec.phone || "Front desk will provide"}
              {ec.availableHours ? ` · Hours: ${ec.availableHours}` : ""}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-3 items-center">
        <Link
          to={`/bookings/${booking._id}`}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-[#0D9488] rounded hover:bg-gray-200 transition"
        >
          <Eye className="w-4 h-4" />
          View Details
        </Link>

        {canPay && (
          <button
            onClick={onPay}
            className="inline-flex items-center gap-1 text-sm px-4 py-2 bg-[#0D9488] text-white rounded-md shadow-sm hover:bg-[#0F766E] transition"
          >
            <CreditCard className="w-4 h-4" />
            Pay Now
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => onCancel(booking)}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-red-600 rounded hover:bg-gray-200 transition"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </button>
        )}

        {canInvoice && (
          <button
            onClick={() => onDownloadInvoice(booking)}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
          >
            <FileDown className="w-4 h-4" />
            Invoice
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
