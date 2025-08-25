import React from "react";
import BookingSummary from "./BookingSummary";
import EmergencyContactCard from "./EmergencyContactCard";
import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import { Bed, Hotel, User2 } from "lucide-react";

const InvoicePreview = ({ booking }) => {
  const ec = booking.emergencyContactSnapshot || {};
  const totals = booking.invoiceTotals || {
    subtotal: booking.totalAmount || 0,
    discount: booking.discountAmount || 0,
    tax: 0,
    total: booking.totalAmount || 0,
    currency: booking.currency || "inr",
  };
  const roomLabel =
    booking.roomId?.displayName ||
    booking.roomId?.name ||
    booking.roomId?.type ||
    "N/A";

  return (
    <div
      id="invoice-preview"
      style={{
        margin: "0 auto",
        width: "600px",
        padding: "20px",
        background: "#ffffff",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        color: "#111827",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <h2 style={{ marginBottom: "16px", fontSize: "20px", color: "#0D9488" }}>
        Booking Invoice
      </h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#4b5563",
          marginBottom: "8px",
        }}
      >
        <Hotel style={{ width: "20px", height: "20px", color: "#6b7280" }} />
        <strong style={{ color: "#374151" }}>Hotel:</strong>{" "}
        {booking.hotelId?.name || booking.hotel?.name || "Hotel"}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#4b5563",
          marginBottom: "8px",
        }}
      >
        <Bed style={{ width: "20px", height: "20px", color: "#6b7280" }} />
        <strong style={{ color: "#374151" }}>Room:</strong> {roomLabel}
        {booking.roomId?.bedType ? ` (${booking.roomId.bedType})` : ""}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#4b5563",
          marginBottom: "8px",
        }}
      >
        <CalendarDateRangeIcon
          style={{ width: "20px", height: "20px", color: "#6b7280" }}
        />
        <strong style={{ color: "#374151" }}>Check‑in:</strong>{" "}
        {new Date(booking.checkIn).toLocaleDateString()}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#4b5563",
          marginBottom: "8px",
        }}
      >
        <CalendarDateRangeIcon
          style={{ width: "20px", height: "20px", color: "#6b7280" }}
        />
        <strong style={{ color: "#374151" }}>Check‑out:</strong>{" "}
        {new Date(booking.checkOut).toLocaleDateString()}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#4b5563",
          marginBottom: "16px",
        }}
      >
        <User2 style={{ width: "20px", height: "20px", color: "#6b7280" }} />
        <strong style={{ color: "#374151" }}>Guests:</strong> {booking.guests}
      </div>

      {/* Booking Totals */}
      <BookingSummary booking={{ ...booking, invoiceTotals: totals }} />

      {/* Emergency Contact */}
      <EmergencyContactCard contact={ec} />
    </div>
  );
};

export default InvoicePreview;
