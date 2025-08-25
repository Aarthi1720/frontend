import React, { useEffect, useMemo, useState } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import ConfirmModal from "../common/ConfirmModal";
import StatusBadge from "../StatusBadge";
import Loader from "../ui/Loader";

const currency = (n = 0) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const BookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Admin action safety
  const [adminActionsEnabled, setAdminActionsEnabled] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);
  const [completeTarget, setCompleteTarget] = useState(null);

  // Unified data fetch / refresh
  const refreshData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings");
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Bookings load error:", err);
      toast.error("Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Derived list with filters + search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      const statusOk = statusFilter === "all" || b.status === statusFilter;
      const payOk =
        paymentFilter === "all" || (b.paymentStatus || "N/A") === paymentFilter;

      const hotel = b.hotelId?.name?.toLowerCase() || "";
      const user =
        b.userId?.name?.toLowerCase() ||
        b.user?.name?.toLowerCase() ||
        b.userEmail?.toLowerCase() ||
        "";
      const room =
        b.roomId?.roomNumber?.toString().toLowerCase() ||
        b.roomId?.name?.toLowerCase() ||
        b.room?.roomNumber?.toString().toLowerCase() ||
        "";

      const searchOk =
        !q || hotel.includes(q) || user.includes(q) || room.includes(q);

      return statusOk && payOk && searchOk;
    });
  }, [bookings, statusFilter, paymentFilter, search]);

  // Analytics
  const totalRevenue = useMemo(
    () =>
      bookings.reduce(
        (sum, b) => sum + (b.totalAmount || b.price?.total || 0),
        0
      ),
    [bookings]
  );
  const totalCoinsEarned = useMemo(
    () =>
      bookings.reduce(
        (sum, b) => sum + (b.loyaltyCoinsEarned ?? b.loyaltyCoins ?? 0),
        0
      ),
    [bookings]
  );

  // Handlers
  const handleCancel = async (id) => {
    if (!adminActionsEnabled) {
      toast("Enable admin actions to proceed.");
      return;
    }
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled");
      await refreshData();
    } catch (err) {
      console.error(err);
      toast.error("Cancel failed");
    } finally {
      setCancelTarget(null);
    }
  };

  const handleResend = async (id) => {
    if (!adminActionsEnabled) {
      toast("Enable admin actions to proceed.");
      return;
    }

    try {
      await api.post(`/bookings/${id}/resend-confirmation`);

      // ✅ Find the correct booking object
      const booking = bookings.find((b) => b._id === id);

      const email =
        booking?.userId?.email ||
        booking?.user?.email ||
        booking?.userEmail ||
        "user";

      toast.success(`Confirmation email sent to ${email}`);
    } catch (err) {
      console.error(err);
      toast.error("Resend failed");
    }
  };

  const handleRefund = async (id) => {
    if (!adminActionsEnabled) {
      toast("Enable admin actions to proceed.");
      return;
    }

    try {
      await api.post(`/bookings/${id}/refund`);
      toast.success("Booking refunded");
      await refreshData();
    } catch (err) {
      if (err?.response?.data?.error?.includes("already been refunded")) {
        toast("Already refunded earlier.");
      } else {
        toast.error("Refund failed");
      }
      await refreshData(); // Refresh UI anyway
    } finally {
      setRefundTarget(null);
    }
  };

  const handleComplete = async (id) => {
    if (!adminActionsEnabled) {
      toast("Enable admin actions to proceed.");
      return;
    }
    // Optimistic update
    setBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, status: "completed" } : b))
    );
    try {
      await api.post(`/bookings/${id}/complete`);
      toast.success("Booking marked complete");
      await refreshData();
    } catch {
      toast.error("Completion failed");
      await refreshData();
    } finally {
      setCompleteTarget(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Booking ID",
      "User",
      "Email",
      "Hotel",
      "Room",
      "Check-in",
      "Check-out",
      "Guests",
      "Amount",
      "Status",
      "Payment",
      "Offer Code",
      "Discount",
      "Coins Used",
      "Coins Earned",
    ];
    const rows = filtered.map((b) => [
      b._id,
      b.userId?.name || b.user?.name || "Guest",
      b.userId?.email || b.user?.email || b.userEmail || "",
      b.hotelId?.name || "",
      b.roomId?.roomNumber || b.roomId?.name || b.room?.roomNumber || "",
      new Date(b.checkIn).toLocaleDateString(),
      new Date(b.checkOut).toLocaleDateString(),
      b.guests ?? "",
      b.totalAmount ?? b.price?.total ?? 0,
      b.status || "",
      b.paymentStatus || "",
      b.offerCode || "",
      b.discountAmount || 0,
      b.loyaltyCoinsUsed || 0,
      b.loyaltyCoinsEarned ?? b.loyaltyCoins ?? 0,
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");
    const uri = encodeURI(csv);
    const a = document.createElement("a");
    a.href = uri;
    a.download = "bookings_admin.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="p-4">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-gray-50">
      {/* Analytics Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        {[
          { label: "Total Bookings", value: bookings.length },
          { label: "Revenue", value: currency(totalRevenue) },
          {
            label: "Cancelled",
            value: bookings.filter((b) => b.status === "cancelled").length,
          },
          { label: "Coins Earned", value: totalCoinsEarned },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white p-3 rounded-lg shadow border-2 border-gray-300"
          >
            <p className="text-gray-600 font-semibold">{label}</p>
            <p className="text-xl font-bold text-gray-500">{value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by hotel, user, or room"
          className="flex-1 min-w-[180px] border border-gray-300 rounded px-3 py-2 outline-none caret-[#0D9488] text-gray-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 cursor-pointer outline-none text-gray-500"
        >
          <option value="all">All Statuses</option>
          <option value="booked">Booked</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 cursor-pointer outline-none text-gray-500"
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <button
          onClick={handleExportCSV}
          className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-md transition"
        >
          Export CSV
        </button>

        <label className="ml-auto flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={adminActionsEnabled}
            onChange={(e) => setAdminActionsEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#0D9488]"
          />
          <span>Enable admin actions</span>
        </label>
      </div>

      {/* Booking List */}
      {filtered.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const canCancel = b.status === "booked";
            const canResend =
              b.paymentStatus === "paid" &&
              b.status !== "cancelled" &&
              b.status !== "completed";
            const isActionable = b.status === "booked";

            const ownerName = b.userId?.name || b.user?.name || "Guest";
            const ownerEmail =
              b.userId?.email || b.user?.email || b.userEmail || "";

            return (
              <div
                key={b._id}
                className="bg-white p-4 rounded-lg border-2 border-gray-300 shadow-sm space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <p className="font-medium text-gray-700">
                      {ownerName} {ownerEmail ? `(${ownerEmail})` : ""} booked{" "}
                      {b.roomId?.name ||
                        `Room ${
                          b.roomId?.roomNumber || b.room?.roomNumber || "—"
                        }`}{" "}
                      at {b.hotelId?.name || "Hotel"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(b.checkIn).toLocaleDateString()} →{" "}
                      {new Date(b.checkOut).toLocaleDateString()} · Guests:{" "}
                      {b.guests ?? "—"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <StatusBadge status={b.status} />
                      <StatusBadge status={b.paymentStatus} />
                      <span>
                        {currency(b.totalAmount || b.price?.total || 0)}
                        {b.offerCode ? ` · Offer: ${b.offerCode}` : ""}
                        {b.loyaltyCoinsEarned
                          ? ` · Coins: +${b.loyaltyCoinsEarned}`
                          : b.loyaltyCoins
                          ? ` · Coins: +${b.loyaltyCoins}`
                          : ""}
                      </span>
                    </div>
                  </div>
                  {/* <StatusBadge status={b.status} /> */}
                </div>

                <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      adminActionsEnabled
                        ? setCancelTarget(b)
                        : toast("Enable admin actions to proceed.")
                    }
                    disabled={!canCancel || !adminActionsEnabled}
                    className={`px-3 py-1 rounded ${
                      canCancel && adminActionsEnabled
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() =>
                      adminActionsEnabled
                        ? handleResend(b._id)
                        : toast("Enable admin actions to proceed.")
                    }
                    disabled={!canResend || !adminActionsEnabled}
                    className={`px-3 py-1 rounded-md text-sm ${
                      canResend && adminActionsEnabled
                        ? "bg-blue-400 text-white hover:bg-sky-600"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Resend Confirmation
                  </button>

                  <button
                    onClick={() =>
                      adminActionsEnabled
                        ? setRefundTarget(b)
                        : toast("Enable admin actions to proceed.")
                    }
                    disabled={
                      !adminActionsEnabled ||
                      b.paymentStatus !== "paid" ||
                      b.status === "cancelled" ||
                      b.status === "completed"
                    }
                    className={`px-3 py-1 rounded-md text-sm ${
                      adminActionsEnabled &&
                      b.paymentStatus === "paid" &&
                      b.status !== "cancelled" &&
                      b.status !== "completed"
                        ? "bg-orange-300 text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Refund
                  </button>

                  <button
                    onClick={() =>
                      adminActionsEnabled
                        ? setCompleteTarget(b)
                        : toast("Enable admin actions to proceed.")
                    }
                    disabled={!isActionable || !adminActionsEnabled}
                    className={`px-3 py-1 rounded ${
                      isActionable && adminActionsEnabled
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Complete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modals */}
      {cancelTarget && (
        <ConfirmModal
          title="Cancel booking"
          message={`Cancel booking ${cancelTarget._id} for ${
            cancelTarget.userId?.name || "guest"
          } at ${cancelTarget.hotelId?.name || "this hotel"}?`}
          onConfirm={() => handleCancel(cancelTarget._id)}
          onCancel={() => setCancelTarget(null)}
        />
      )}

      {refundTarget && (
        <ConfirmModal
          title="Confirm Refund"
          message={`This will cancel the booking and refund ₹${
            refundTarget?.finalAmount ?? refundTarget?.totalAmount ?? "?"
          } to ${refundTarget?.userId?.name || "guest"}. Continue?`}
          onConfirm={() => handleRefund(refundTarget._id)}
          onCancel={() => setRefundTarget(null)}
        />
      )}

      {completeTarget && (
        <ConfirmModal
          title="Mark booking complete"
          message={`Mark booking ${completeTarget._id} as completed?`}
          onConfirm={() => handleComplete(completeTarget._id)}
          onCancel={() => setCompleteTarget(null)}
        />
      )}

      <p className="text-xs text-gray-500">
        Note: Admin actions are disabled by default to prevent accidental
        changes. Your backend permits admins to cancel; this UI requires
        explicit enable + confirmation for safety.
      </p>
    </div>
  );
};

export default BookingsTab;
