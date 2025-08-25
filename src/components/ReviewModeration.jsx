import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios";

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all"); // all | approved | pending
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // pagination (client-side)
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reviews");
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
      setPage(1);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const doToggle = async (id, currentStatus) => {
    try {
      setBusy(true);
      const { data } = await api.patch(`/reviews/${id}/toggle`);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, isApproved: !currentStatus } : r
        )
      );
      toast.success(
        data?.message || (!currentStatus ? "Review approved" : "Review hidden")
      );
    } catch {
      toast.error("Failed to update review");
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try {
      setBusy(true);
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setBusy(false);
    }
  };

  const approveAllPending = async () => {
    try {
      setBusy(true);
      const { data } = await api.patch(`/reviews/approve-all`);
      // Soft update all pending → approved
      setReviews((prev) => prev.map((r) => ({ ...r, isApproved: true })));
      toast.success(data?.message || "All pending reviews approved");
    } catch {
      toast.error("Failed to approve all pending reviews");
    } finally {
      setBusy(false);
    }
  };

  // derived counts
  const { total, approvedCount, pendingCount } = useMemo(() => {
    const total = reviews.length;
    const approvedCount = reviews.filter((r) => r.isApproved).length;
    const pendingCount = total - approvedCount;
    return { total, approvedCount, pendingCount };
  }, [reviews]);

  // filter + search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews
      .filter((r) =>
        filter === "all"
          ? true
          : filter === "approved"
          ? r.isApproved
          : !r.isApproved
      )
      .filter((r) => {
        if (!q) return true;
        const user = r.userId?.name || "";
        const hotel = r.hotelId?.name || "";
        const text = r.comment || "";
        return (
          user.toLowerCase().includes(q) ||
          hotel.toLowerCase().includes(q) ||
          text.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reviews, filter, search]);

  // pagination slice
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    // reset to first page when filter/search changes
    setPage(1);
  }, [filter, search]);

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-lg font-semibold">Review Moderation</h3>
        <div className="text-sm text-gray-600">
          Total: <b>{total}</b> · Approved:{" "}
          <b className="text-green-700">{approvedCount}</b> · Pending:{" "}
          <b className="text-amber-700">{pendingCount}</b>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Reviews</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded flex-1 min-w-[220px]"
          placeholder="Search by user / hotel / text"
        />

        <button
          onClick={approveAllPending}
          disabled={pendingCount === 0 || busy}
          className={`px-3 py-2 rounded text-white ${
            pendingCount === 0 || busy
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          title="Approve all pending reviews"
        >
          Approve All Pending
        </button>

        <button
          onClick={load}
          disabled={loading || busy}
          className="px-3 py-2 rounded border"
          title="Refresh"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="text-sm text-gray-600">Loading reviews…</div>
        ) : pageItems.length === 0 ? (
          <div className="text-sm text-gray-600">
            No reviews match your filters.
          </div>
        ) : (
          pageItems.map((r) => (
            <div key={r._id} className="border-b py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm">
                    <strong>{r.userId?.name || "User"}</strong> rated ★{" "}
                    {r.rating}{" "}
                    <span className="text-gray-500">
                      • {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Hotel: {r.hotelId?.name || r.hotelId || "—"}
                    {r.verifiedBooking ? (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">
                        Verified stay
                      </span>
                    ) : null}
                    {!r.isApproved ? (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-700">
                        Pending
                      </span>
                    ) : (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">
                        Approved
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                    {r.comment}
                  </p>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => doToggle(r._id, r.isApproved)}
                    disabled={busy}
                    className={`px-3 py-1 rounded text-white ${
                      r.isApproved
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {r.isApproved ? "Hide" : "Approve"}
                  </button>
                  <button
                    onClick={() => doDelete(r._id)}
                    disabled={busy}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;
