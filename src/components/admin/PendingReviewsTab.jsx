import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Loader from "../ui/Loader";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PendingReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [hotelFilter, setHotelFilter] = useState("");

  const fetchPending = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/reviews/pending");
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load pending reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approveOne = async (id) => {
    try {
      setBusyId(id);
      await api.patch(`/reviews/${id}/approve`);
      toast.success("Review approved");
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error("Approve failed");
      fetchPending();
    } finally {
      setBusyId(null);
    }
  };

  const deleteOne = async (id) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    try {
      setBusyId(id);
      await api.delete(`/reviews/${id}`);
      toast.success("Review deleted");
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error("Delete failed");
      fetchPending();
    } finally {
      setBusyId(null);
    }
  };

  const approveAll = async () => {
    if (!reviews.length) return;
    if (!window.confirm(`Approve all ${reviews.length} pending reviews?`))
      return;
    try {
      setBusyId("all");
      const { data } = await api.patch("/reviews/approve-all");
      toast.success(data?.message || `Approved ${reviews.length} reviews`);
      setReviews([]);
    } catch {
      toast.error("Bulk approve failed");
      fetchPending();
    } finally {
      setBusyId(null);
    }
  };

  const fmtDate = (d) => {
    try {
      return new Date(d).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "";
    }
  };

  // Filtered list by hotel
  const filtered = useMemo(() => {
    return hotelFilter
      ? reviews.filter((r) => (r.hotelId?._id || r.hotelId) === hotelFilter)
      : reviews;
  }, [reviews, hotelFilter]);

  // Chart data
  const ratingCounts = useMemo(
    () =>
      [1, 2, 3, 4, 5].map(
        (star) => filtered.filter((r) => Number(r.rating) === star).length
      ),
    [filtered]
  );

  const avgRating = useMemo(() => {
    if (!filtered.length) return 0;
    const sum = filtered.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return Number((sum / filtered.length).toFixed(1));
  }, [filtered]);

  const chartData = {
    labels: ["1⭐", "2⭐", "3⭐", "4⭐", "5⭐"],
    datasets: [
      {
        label: "Pending Reviews",
        data: ratingCounts,
        backgroundColor: [
          "#ef4444",
          "#f97316",
          "#facc15",
          "#4ade80",
          "#3b82f6",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  // Unique hotel options (skip falsy ids)
  const hotelOptions = useMemo(() => {
    const set = new Set();
    const opts = [];
    for (const r of reviews) {
      const id = r.hotelId?._id || r.hotelId;
      if (!id || set.has(id)) continue;
      set.add(id);
      opts.push({ id, name: r.hotelId?.name || "Unnamed Hotel" });
    }
    // Sort by name for UX
    return opts.sort((a, b) => a.name.localeCompare(b.name));
  }, [reviews]);

  if (loading) {
    return (
      <div className="p-4">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Hotel Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <label className="text-sm text-gray-600">Filter by Hotel:</label>
        <select
          value={hotelFilter}
          onChange={(e) => setHotelFilter(e.target.value)}
          className="border-2 border-gray-300 rounded p-1 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
        >
          <option value="">All Hotels</option>
          {hotelOptions.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {/* No Pending Reviews */}
      {!filtered.length ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700">
          No pending reviews{hotelFilter ? " for this hotel" : ""} 🎉
        </div>
      ) : (
        <>
          {/* Analytics / Charts */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="bg-white p-4 rounded shadow flex-1">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-[#0D9488]">
                  Rating Distribution
                </h3>
                <button
                  onClick={approveAll}
                  disabled={busyId !== null || reviews.length === 0}
                  className="px-3 py-1 rounded bg-[#0D9488] text-white hover:bg-[#0f766e] disabled:opacity-50 text-sm transition"
                  title="Approve all pending reviews"
                >
                  Approve All
                </button>
              </div>
              <Doughnut data={chartData} />
            </div>
            <div className="bg-white p-4 rounded shadow flex-1 flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-2 text-[#0D9488]">
                Average Rating
              </h3>
              <div
                className={`text-4xl font-bold ${
                  avgRating >= 4
                    ? "text-green-600"
                    : avgRating >= 3
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {avgRating}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Across {filtered.length} pending review
                {filtered.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* Pending Reviews Table */}
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Pending Reviews{" "}
              <span className="text-gray-500">({filtered.length})</span>
            </h2>
            <div className="overflow-x-auto border rounded">
              <table className="w-full min-w-max text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    {[
                      "Hotel",
                      "User",
                      "Rating",
                      "Comment",
                      "Date",
                      "Actions",
                    ].map((head) => (
                      <th key={head} className="p-2 border">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="p-2 border">{r.hotelId?.name ?? "—"}</td>
                      <td className="p-2 border">{r.userId?.name ?? "—"}</td>
                      <td className="p-2 border flex items-center gap-1">
                        {r.rating} ⭐
                        {Number(r.rating) <= 2 && (
                          <span className="text-red-500 font-semibold">
                            ⚠️ Negative
                          </span>
                        )}
                      </td>
                      <td
                        className="p-2 border max-w-xs truncate"
                        title={r.comment}
                      >
                        {r.comment}
                      </td>
                      <td className="p-2 border whitespace-nowrap">
                        {fmtDate(r.createdAt)}
                      </td>
                      <td className="p-2 border text-center">
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <button
                            onClick={() => approveOne(r._id)}
                            disabled={busyId !== null}
                            className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-xs sm:text-sm transition cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => deleteOne(r._id)}
                            disabled={busyId !== null}
                            className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-xs sm:text-sm transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
