import React, { useEffect, useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import toast from "react-hot-toast";
import api from "../lib/axios";
import Spinner from "../components/common/Spinner";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const AdminAnalytics = () => {
  const [bookingData, setBookingData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState({
    booked: 0,
    available: 0,
  });
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthsToShow, setMonthsToShow] = useState(6);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/analytics");
        setLabels(data.labels || []);
        setBookingData(data.bookings || []);
        setRevenueData(data.revenue || []);
        setOccupancyData(data.occupancy || { booked: 0, available: 0 });
      } catch (err) {
        console.error("Analytics error:", err);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const slicedLabels = labels.slice(-monthsToShow);
  const slicedBookings = bookingData.slice(-monthsToShow);
  const slicedRevenue = revenueData.slice(-monthsToShow);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label || "";
            const value = ctx.raw;
            if (label.toLowerCase().includes("revenue")) {
              return `${label}: ₹${value.toLocaleString("en-IN")}`;
            } else if (label.toLowerCase().includes("booking")) {
              return `${label}: ${value} booking(s)`;
            }
            return `${label}: ${value}`;
          },
        },
      },
      legend: { position: "top" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) =>
            value >= 1000 ? `₹${value.toLocaleString("en-IN")}` : value,
        },
      },
    },
  };

  if (loading) return <p className="p-4">Loading analytics…</p>;
  if (loading) return <Spinner />;

  return (
    <div className="p-4 bg-gray-50 min-h-screen space-y-6 w-full">
      {/* Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#0D9488]">
          Analytics Dashboard
        </h2>
        <select
          value={monthsToShow}
          onChange={(e) => setMonthsToShow(Number(e.target.value))}
          className="border-2 border-gray-300 p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-600"
        >
          <option value={3}>Last 3 Months</option>
          <option value={6}>Last 6 Months</option>
          <option value={12}>Last 12 Months</option>
        </select>
      </div>

      {/* Booking Trends Card */}
      <section className="w-full">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          📈 Booking Trends
        </h3>
        <div className="w-full h-[300px] bg-white rounded-lg shadow p-4">
          <Line
            data={{
              labels: slicedLabels,
              datasets: [
                {
                  label: "Bookings",
                  data: slicedBookings,
                  borderColor: "#0D9488",
                  backgroundColor: "rgba(13,148,136,0.2)",
                  fill: true,
                },
              ],
            }}
            options={commonOptions}
          />
        </div>
      </section>

      {/* Revenue Overview Card */}
      <section className="w-full">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          💰 Revenue Overview
        </h3>
        <div className="w-full h-[300px] bg-white rounded-lg shadow p-4">
          <Bar
            data={{
              labels: slicedLabels,
              datasets: [
                {
                  label: "Revenue (₹)",
                  data: slicedRevenue,
                  backgroundColor: "rgba(34,197,94,0.6)",
                },
              ],
            }}
            options={commonOptions}
          />
        </div>
      </section>

      {/* Occupancy Rate Card */}
      <section className="w-full">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          🛏️ Occupancy Rate
        </h3>
        <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow p-4">
          <Doughnut
            data={{
              labels: ["Booked", "Available"],
              datasets: [
                {
                  data: [occupancyData.booked, occupancyData.available],
                  backgroundColor: ["#f87171", "#60a5fa"],
                },
              ],
            }}
            options={commonOptions}
          />
        </div>
      </section>
    </div>
  );
};

export default AdminAnalytics;
