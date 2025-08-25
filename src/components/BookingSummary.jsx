import React from "react";
import {
  BadgePercent,
  Coins,
  Currency,
  TicketPercent,
  WalletCards,
} from "lucide-react";


const BookingSummary = ({ booking, isAdmin = false }) => {
  // Canonical numbers
  const base = Number(booking?.totalAmount || 0); // original amount before discounts/coins
  const discount = Number(booking?.discountAmount || 0); // offer discount
  const coinsUsed = Number(booking?.loyaltyCoinsUsed || 0); // coins applied (₹1 per coin)

  // Prefer server-trusted finalAmount; else compute safely
  const netPaid =
    typeof booking?.finalAmount === "number"
      ? booking.finalAmount
      : Math.max(base - discount - coinsUsed, 0);

  // Use tax from invoiceTotals if present (default 0)
  const tax =
    typeof booking?.invoiceTotals?.tax === "number"
      ? booking.invoiceTotals.tax
      : 0;

  const currency = (
    booking?.currency ||
    booking?.invoiceTotals?.currency ||
    "inr"
  )
    .toString()
    .toUpperCase();

  return (
    <div
      style={{
        backgroundColor: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        padding: "1rem",
        fontSize: "0.875rem",
        color: "#374151",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span
          style={{
            fontWeight: "500",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <BadgePercent style={{ width: "20px", height: "20px" }} />
          Offer Code:
        </span>
        <span>{booking?.offerCode || "—"}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span
          style={{
            fontWeight: "500",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <TicketPercent style={{ width: "20px", height: "20px" }} />
          Discount:
        </span>
        <span>₹{discount}</span>
      </div>

      {coinsUsed > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{
              fontWeight: "500",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <Coins style={{ width: "20px", height: "20px" }} />
            Coins Used:
          </span>
          <span>
            {coinsUsed} ({`₹${coinsUsed}`})
          </span>
        </div>
      )}

      {Number(booking?.loyaltyCoinsEarned || 0) > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{
              fontWeight: "500",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <Coins style={{ width: "20px", height: "20px" }} />
            Coins Earned:
          </span>
          <span>{booking.loyaltyCoinsEarned}</span>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span
          style={{
            fontWeight: "500",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <Currency style={{ width: "20px", height: "20px" }} />
          Subtotal:
        </span>
        <span>₹{base}</span>
      </div>

      {tax > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: "500" }}>Tax:</span>
          <span>₹{tax}</span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "600",
          color: "#111827",
        }}
      >
        <span
          style={{
            fontWeight: "500",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <WalletCards style={{ width: "20px", height: "20px" }} />
          Net Paid:
        </span>
        <span>
          ₹{netPaid}
          {currency ? ` (${currency})` : ""}
        </span>
      </div>

      {booking?.paymentStatus === "refunded" && booking?.refundId && (
        <div
          style={{
            marginTop: "0.5rem",
            color: "#dc2626",
            fontSize: "0.875rem",
          }}
        >
          <span style={{ fontWeight: "500" }}>Refund ID:</span>{" "}
          {booking.refundId}
        </div>
      )}

      {isAdmin && booking?.transactionId && (
        <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
          <span style={{ fontWeight: "500" }}>Transaction ID:</span>{" "}
          {booking.transactionId}
        </div>
      )}
    </div>
  );
};

export default BookingSummary;
