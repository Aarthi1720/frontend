import React, { useEffect, useState } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import Loader from "../ui/Loader";

const formatINR = (n) => {
  const num = Number(n || 0);
  try {
    return num.toLocaleString("en-IN");
  } catch {
    return String(num);
  }
};

const formatPct = (n) => {
  const num = Number(n || 0);
  return `${Math.round(num)}%`;
};

export default function AnalyticsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await api.get("/analytics");
      // Expecting shape: { totalBookings, totalRevenue, occupancyRate, avgRating }
      setStats({
        totalBookings: Number(data?.totalBookings || 0),
        totalRevenue: Number(data?.totalRevenue || 0),
        occupancyRate: Number(data?.occupancyRate || 0),
        avgRating:
          typeof data?.avgRating === "number"
            ? data.avgRating
            : Number(data?.avgRating || 0),
      });
    } catch (err) {
      console.error("Analytics load error:", err);
      toast.error("Failed to load analytics");
      setStats({
        totalBookings: 0,
        totalRevenue: 0,
        occupancyRate: 0,
        avgRating: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !stats) {
    return (
      <div className="p-4">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-700">Overview</h2>
        <button
          onClick={() => {
            setRefreshing(true);
            load({ silent: true });
          }}
          disabled={refreshing}
          className={`px-3 py-1 rounded text-sm text-white cursor-pointer ${
            refreshing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#0D9488] hover:bg-[#0f766e]"
          } transition`}
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="p-4 bg-[#E0F2F1] rounded shadow">
          <p className="text-sm text-[#00695C]">Total Bookings</p>
          <p className="text-2xl font-bold text-[#004D40] mt-1">
            {formatINR(stats?.totalBookings)}
          </p>
        </div>

        {/* Total Revenue */}
        <div className="p-4 bg-[#E8F5E9] rounded shadow">
          <p className="text-sm text-[#2E7D32]">Total Revenue</p>
          <p className="text-2xl font-bold text-[#1B5E20] mt-1">
            ₹{formatINR(stats?.totalRevenue)}
          </p>
        </div>

        {/* Occupancy */}
        <div className="p-4 bg-[#FFFDE7] rounded shadow">
          <p className="text-sm text-[#F9A825]">Occupancy</p>
          <p className="text-2xl font-bold text-[#F57F17] mt-1">
            {formatPct(stats?.occupancyRate)}
          </p>
        </div>

        {/* Avg Rating */}
        <div className="p-4 bg-[#F3E5F5] rounded shadow">
          <p className="text-sm text-[#6A1B9A]">Avg Rating</p>
          <p className="text-2xl font-bold text-[#4A148C] mt-1">
            {typeof stats?.avgRating === "number"
              ? stats.avgRating.toFixed(1)
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
