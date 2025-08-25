// BookingDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";
import BookingSummary from "../components/BookingSummary";
import EmergencyContactCard from "../components/EmergencyContactCard";
import InvoicePreview from "../components/InvoicePreview";
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/common/Spinner";
import {
  ArrowLeft,
  Calendar,
  LucideHotel,
  PartyPopper,
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

// Helper to safely format YYYY-MM-DD strings
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState({
    cancel: false,
    resend: false,
    pdf: false,
  });
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.data);
      } catch {
        toast.error("Booking not found or access denied.");
        navigate("/my-bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  const isAdmin = currentUser?.role === "admin";

  const isOwner = useMemo(() => {
    if (!currentUser?._id || !booking?.userId) return false;
    const a = String(currentUser._id);
    const b =
      typeof booking.userId === "object"
        ? String(booking.userId?._id || booking.userId?.toString?.() || "")
        : String(booking.userId);
    return a === b;
  }, [currentUser?._id, booking?.userId]);

  const isPaid = booking?.paymentStatus === "paid";
  const isRefunded = booking?.paymentStatus === "refunded";
  const isCancelable = booking?.status === "booked" && (isOwner || isAdmin);
  const canInvoiceActions =
    booking?.paymentStatus === "paid" &&
    !["cancelled", "refunded"].includes(booking?.status) &&
    (isOwner || isAdmin);

  const ec = booking?.emergencyContactSnapshot || {};

  // ---- Cancel handler with refund patch
  const handleCancel = async () => {
    try {
      setBtnLoading((s) => ({ ...s, cancel: true }));
      const { data } = await api.patch(`/bookings/${id}/cancel`);
      toast.success(data.message);
      setBooking((prev) => ({
        ...prev,
        status: data.booking.status,
        paymentStatus: data.booking.paymentStatus,
        refundId: data.booking.refundId || prev.refundId,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed.");
    } finally {
      setBtnLoading((s) => ({ ...s, cancel: false }));
    }
  };

  const handleResendInvoice = async () => {
    try {
      setBtnLoading((s) => ({ ...s, resend: true }));
      await api.post(`/bookings/${id}/resend-invoice`);
      toast.success("Invoice sent to the registered email.");
    } catch {
      toast.error("Resend failed.");
    } finally {
      setBtnLoading((s) => ({ ...s, resend: false }));
    }
  };

  const handleDownloadInvoice = async () => {
    if (!booking) return;
    try {
      setBtnLoading((s) => ({ ...s, pdf: true }));

      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "-10000px";
      container.style.left = "0";
      container.style.width = "800px";
      container.setAttribute("id", "invoice-print-root");
      document.body.appendChild(container);

      const root = ReactDOM.createRoot(container);
      root.render(<InvoicePreview booking={booking} />);
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r))
      );

      const target = container.firstElementChild || container;
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight - margin * 2) {
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      } else {
        let remainingHeight = imgHeight;
        const pageCanvas = document.createElement("canvas");
        const ctx = pageCanvas.getContext("2d");
        const ratio = imgWidth / canvas.width;
        const sliceHeightPx = ((pageHeight - margin * 2) / ratio) | 0;
        let offsetY = 0;

        while (remainingHeight > 0) {
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(sliceHeightPx, canvas.height - offsetY);
          ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            offsetY,
            canvas.width,
            pageCanvas.height,
            0,
            0,
            canvas.width,
            pageCanvas.height
          );
          const pageImg = pageCanvas.toDataURL("image/png");
          pdf.addImage(
            pageImg,
            "PNG",
            margin,
            margin,
            imgWidth,
            (pageCanvas.height * imgWidth) / canvas.width
          );
          remainingHeight -= (pageCanvas.height * imgWidth) / canvas.width;
          offsetY += pageCanvas.height;
          if (remainingHeight > 0) pdf.addPage();
        }
      }

      pdf.save(`invoice_${booking._id}.pdf`);

      root.unmount();
      document.body.removeChild(container);
    } catch {
      toast.error("Invoice download failed.");
    } finally {
      setBtnLoading((s) => ({ ...s, pdf: false }));
    }
  };

  // if (loading) return <div className="p-4">Loading booking details…</div>;
  if (loading) return <Spinner />;
  if (!booking) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-5">
      <button
        onClick={() => navigate("/my-bookings")}
        className="relative z-10 flex items-center gap-1 text-[#0D9488] hover:text-[#0F766E] mb-4 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </button>
      <h1 className="text-2xl font-bold text-[#0D9488] mb-4">
        Booking Details
      </h1>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-6">
        {/* Hotel & Room Info */}
        <div>
          <h2 className="text-lg font-semibold text-[#064d47]">
            {booking?.hotel?.name || "Hotel"}
          </h2>
          <p className="text-sm text-gray-600 flex gap-2">
            <LucideHotel className="w-5 h-5" />
            Room {booking?.room?.name || "—"} — {booking?.room?.type || "—"}
          </p>
          {isAdmin && (
            <p className="text-xs text-gray-500 italic">Viewing as Admin</p>
          )}
        </div>

        {/* Booking Info */}
        <div className="text-sm text-gray-500 space-y-2">
          <p className="flex gap-2">
            <Calendar className="w-5 h-5" />
            <strong className="text-gray-600">Check-in:</strong>{" "}
            {formatDate(booking?.checkIn)}
          </p>
          <p className="flex gap-2">
            <Calendar className="w-5 h-5" />
            <strong className="text-gray-600">Check-out:</strong>{" "}
            {formatDate(booking?.checkOut)}
          </p>
          <p className="flex gap-2">
            <Users className="w-5 h-5" />
            <strong className="text-gray-600">Guests:</strong>{" "}
            {booking?.guests ?? "—"}
          </p>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 items-center">
            <StatusBadge status={booking?.status} />
            <StatusBadge status={booking?.paymentStatus} />
          </div>

          {/* Refund Notice */}
          {isRefunded && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-[#F7882F]" />
              <span className="text-gray-800">
                Refund processed successfully
              </span>
              {booking?.refundId && (
                <div className="mt-1 text-gray-600">
                  <strong>Refund ID:</strong> {booking.refundId}
                </div>
              )}
            </div>
          )}

          {/* Receipt Link */}
          {booking?.paymentReceiptUrl && (
            <p>
              <strong className="text-gray-800">Receipt: </strong>
              <a
                href={booking.paymentReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0D9488] hover:underline"
              >
                View Receipt
              </a>
            </p>
          )}

          {/* Loyalty Coins */}
          {booking?.loyaltyCoinsEarned > 0 && (
            <p className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded">
              <span className="text-xs font-semibold">Loyalty</span>
              <span className="text-sm">
                +{booking.loyaltyCoinsEarned} coins
              </span>
            </p>
          )}
        </div>

        {/* Pricing & Contact */}
        <BookingSummary booking={booking} isAdmin={isAdmin} />
        <EmergencyContactCard contact={ec} />

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-4">
          {isCancelable && booking?.paymentStatus !== "refunded" && (
            <button
              onClick={handleCancel}
              disabled={btnLoading.cancel}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
            >
              {btnLoading.cancel ? "Cancelling…" : "Cancel Booking"}
            </button>
          )}
          {canInvoiceActions && (
            <>
              <button
                onClick={handleResendInvoice}
                disabled={btnLoading.resend}
                className="px-4 py-2 bg-[#F7882F] text-white rounded hover:bg-[#e07b29] disabled:opacity-60"
              >
                {btnLoading.resend ? "Sending…" : "Resend Invoice"}
              </button>
              <button
                onClick={handleDownloadInvoice}
                disabled={btnLoading.pdf}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-60"
              >
                {btnLoading.pdf ? "Preparing PDF…" : "Download Invoice"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
