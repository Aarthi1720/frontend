import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmModal from "../components/common/ConfirmModal";
import PaymentModal from "../components/common/PaymentModal";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReactDOM from "react-dom/client";
import BookingCard from "../components/BookingCard";
import InvoicePreview from "../components/InvoicePreview";
// REVIEW: If you want review-from-booking flow, import & use ReviewModal
import ReviewModal from "../components/review/ReviewModal";
import { ArrowLeft, PencilIcon } from "lucide-react";
import Spinner from "../components/common/Spinner";

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const navigate = useNavigate();

  // Payment state
  const [payingBookingId, setPayingBookingId] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  // REVIEW: old state for opening ReviewModal per booking (not used in UI anymore)
  // Remove completely if not needed:
  const [reviewFor, setReviewFor] = useState(null);

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  // Initial load
  useEffect(() => {
    const loadBookings = async () => {
      try {
        if (!currentUser?._id) return;
        const url = isAdmin ? "/bookings" : `/bookings/user/${currentUser._id}`;
        const res = await api.get(url);
        setBookings(res.data || []);
      } catch (err) {
        console.error("Failed to load bookings:", err);
        toast.error("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, currentUser?._id]);

  // If we came from Search with a pending booking, auto-initiate payment
  useEffect(() => {
    const pendingId = sessionStorage.getItem("pendingPaymentBookingId");
    if (pendingId) {
      setHighlightId(pendingId);
      const book = bookings.find((b) => String(b._id) === String(pendingId));
      if (book && book.paymentStatus === "pending" && book.totalAmount > 0) {
        handlePay(book, { silentBanner: true });
      }
      sessionStorage.removeItem("pendingPaymentBookingId");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
      toast.success("Booking cancelled.");
    } catch (err) {
      console.error("Cancel failed:", err);
      toast.error("Could not cancel booking. Please try again.");
    } finally {
      setCancelTarget(null);
    }
  };

  const handleDownloadInvoice = async (booking) => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "-10000px";
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(<InvoicePreview booking={booking} />);

    await new Promise((resolve) => setTimeout(resolve, 300));
    const canvas = await html2canvas(container);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = Math.min(pageWidth - 20, 190);
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, 0);
    pdf.save(`invoice_${booking._id}.pdf`);

    root.unmount();
    document.body.removeChild(container);
  };

  const now = new Date();
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const matchesStatus =
          statusFilter === "all" || b.status === statusFilter;
        const checkInDate = new Date(b.checkIn);
        const matchesDate =
          dateFilter === "all" ||
          (dateFilter === "upcoming" && checkInDate >= now) ||
          (dateFilter === "past" && checkInDate < now);
        return matchesStatus && matchesDate;
      })
      .sort((a, b) =>
        sortBy === "date"
          ? new Date(a.checkIn) - new Date(b.checkIn)
          : b.totalAmount - a.totalAmount
      );
  }, [bookings, statusFilter, dateFilter, sortBy, now]);

  const handleExportCSV = () => {
    const headers = [
      "Hotel",
      "Room",
      "Check-in",
      "Check-out",
      "Guests",
      "Original Amount",
      "Discount",
      "Coins Used",
      "Final Amount",
      "Status",
      "Payment Status",
      "Offer Code",
      "Coins Earned",
    ];

    const rows = filteredBookings.map((b) => {
      const base = Number(b.totalAmount || 0);
      const discount = Number(b.discountAmount || 0);
      const coinsUsed = Number(b.loyaltyCoinsUsed || 0);
      const finalAmount =
        typeof b.finalAmount === "number"
          ? b.finalAmount
          : Math.max(base - discount - coinsUsed, 0);

      return [
        b.hotelId?.name || "",
        b.roomId?.roomNumber || b.roomId?.name || "",
        new Date(b.checkIn).toLocaleDateString(),
        new Date(b.checkOut).toLocaleDateString(),
        b.guests ?? "",
        base,
        discount,
        coinsUsed,
        finalAmount,
        b.status || "",
        b.paymentStatus || "",
        b.offerCode || "",
        b.loyaltyCoinsEarned || 0,
      ];
    });

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");
    const uri = encodeURI(csv);
    const a = document.createElement("a");
    a.href = uri;
    a.download = isAdmin ? "all_bookings.csv" : "my_bookings.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePay = async (booking, opts = {}) => {
    try {
      if (booking.paymentStatus === "paid" || (booking.finalAmount || 0) <= 0) {
        if (!opts.silentBanner) toast("Nothing to pay.");
        return;
      }
      setPayingBookingId(booking._id);
      const { data } = await api.post("/payments/create-intent", {
        bookingId: booking._id,
      });
      if (!data?.clientSecret) {
        toast.error("Could not start payment.");
        setPayingBookingId(null);
        return;
      }
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error(err);
      toast.error("Payment init failed.");
      setPayingBookingId(null);
    }
  };

  const handlePaymentClose = async (success) => {
    setClientSecret(null);
    setPayingBookingId(null);
    if (success) {
      try {
        const url = isAdmin ? "/bookings" : `/bookings/user/${currentUser._id}`;
        const res = await api.get(url);
        setBookings(res.data || []);
        toast.success("Payment successful. Booking confirmed!");
      } catch {
        window.location.reload();
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 mt-5">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-[#0D9488] hover:text-[#0F766E] transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </button>
      {/* Confirmation Alert */}
      {highlightId && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
          <span className="font-medium">Booking created.</span>
          {clientSecret && <span>Complete payment to confirm.</span>}
        </div>
      )}

      {/* Page Title */}
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#0D9488]">
          {isAdmin ? "All Bookings" : "My Bookings"}
        </h1>
        {isAdmin && (
          <span className="text-sm text-gray-500">
            Total: {filteredBookings.length}
          </span>
        )}
      </div>

      {/* Filters & Export */}
      <div className="flex flex-wrap gap-4 mb-6 text-gray-500">
        {[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { val: "all", label: "All Statuses" },
              { val: "pending", label: "Pending" },
              { val: "booked", label: "Booked" },
              { val: "cancelled", label: "Cancelled" },
              { val: "completed", label: "Completed" },
            ],
          },
          {
            value: dateFilter,
            onChange: setDateFilter,
            options: [
              { val: "all", label: "All Dates" },
              { val: "upcoming", label: "Upcoming" },
              { val: "past", label: "Past" },
            ],
          },
          {
            value: sortBy,
            onChange: setSortBy,
            options: [
              { val: "date", label: "Sort by Date" },
              { val: "amount", label: "Sort by Amount" },
            ],
          },
        ].map(({ value, onChange, options }, idx) => (
          <div key={idx} className="relative">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="appearance-none border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-[#0D9488]/50 transition outline-none cursor-pointer"
            >
              {options.map(({ val, label }) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute top-1/2 right-3 w-4 h-4 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.25 9l3.75 3.75L15.75 9"
              />
            </svg>
          </div>
        ))}
        <button
          onClick={handleExportCSV}
          className="bg-[#0D9488] text-white px-4 py-2 rounded hover:bg-[#0f766e] transition cursor-pointer"
        >
          Export CSV
        </button>
      </div>

      {/* Booking Cards */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((b) => {
            const isOwner = isAdmin ? currentUser?._id === b.userId : true;
            const canCancel =
              isOwner && !["cancelled", "completed"].includes(b.status);
            const canInvoice =
              isOwner && b.paymentStatus === "paid" && b.status !== "cancelled";
            const canPay =
              isOwner &&
              b.status !== "cancelled" &&
              b.paymentStatus === "pending" &&
              (b.finalAmount || 0) > 0;
            const isPastStay = new Date(b.checkOut) < new Date();
            const canReview =
              isPastStay &&
              b.paymentStatus === "paid" &&
              b.status !== "cancelled";

            return (
              <div key={b._id} className="space-y-2">
                {canReview && (
                  <div>
                    <button
                      onClick={() =>
                        setReviewFor({
                          hotelId: b.hotelId?._id || b.hotelId,
                          roomId: b.roomId?._id || b.roomId,
                        })
                      }
                      className="text-sm px-3 py-2 rounded bg-[#0D9488] text-white hover:bg-amber-700 transition cursor-pointer flex gap-2"
                    >
                      <PencilIcon className="w-4 h-5" />
                      Write Review
                    </button>
                  </div>
                )}
                <BookingCard
                  booking={b}
                  canCancel={canCancel}
                  canInvoice={canInvoice}
                  canPay={canPay}
                  onPay={() => handlePay(b)}
                  onCancel={setCancelTarget}
                  onDownloadInvoice={handleDownloadInvoice}
                  isOwner={isOwner}
                  isAdminView={isAdmin}
                  highlight={highlightId === String(b._id)}
                />
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-600">
            {bookings.length === 0 ? (
              <>
                <h2 className="text-xl font-semibold">No bookings found.</h2>
                {!isAdmin && (
                  <Link
                    to="/"
                    className="mt-4 inline-block text-[#0D9488] hover:underline"
                  >
                    Book your first stay
                  </Link>
                )}
              </>
            ) : (
              <p>No results match your selected filters.</p>
            )}
          </div>
        )}

        {/* Review Modal */}
        {reviewFor && (
          <ReviewModal
            open={!!reviewFor}
            onClose={() => setReviewFor(null)}
            hotelId={reviewFor.hotelId}
            roomId={reviewFor.roomId}
            existing={null}
          />
        )}

        {/* Cancel Confirmation */}
        {cancelTarget && (
          <ConfirmModal
            title="Cancel Booking"
            message={`Are you sure you want to cancel your booking at ${
              cancelTarget.hotelId?.name || "this hotel"
            }?`}
            onConfirm={() => handleCancelBooking(cancelTarget._id)}
            onCancel={() => setCancelTarget(null)}
          />
        )}
      </div>

      {/* Stripe Payment Modal */}
      {clientSecret && (
        <PaymentModal
          clientSecret={clientSecret}
          onSuccess={() => {}}
          onClose={handlePaymentClose}
        />
      )}
    </div>
  );
};

export default MyBookings;
