import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import BookingsTab from "../components/admin/BookingsTab";
import RoomsTab from "../components/admin/RoomsTab";
import ImagesTab from "../components/admin/ImagesTab";
import OffersTab from "../components/admin/OffersTab";
import AnalyticsTab from "../components/admin/AnalyticsTab";
import PendingReviewsTab from "../components/admin/PendingReviewsTab";
import AddHotelTab from "../components/admin/AddHotelTab";

import {
  Building2,
  Image,
  BedDouble,
  Gift,
  ClipboardList,
  Star,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import PendingVerificationsTab from "../components/admin/PendingVerificationsTab";

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const tabs = [
  { id: "addhotel", label: "Add Hotel", icon: <Building2 size={18} /> },
  { id: "images", label: "Hotel Images", icon: <Image size={18} /> },
  { id: "rooms", label: "Rooms", icon: <BedDouble size={18} /> },
  { id: "offers", label: "Offers", icon: <Gift size={18} /> },
  { id: "bookings", label: "Bookings", icon: <ClipboardList size={18} /> },
  { id: "reviews", label: "Pending Reviews", icon: <Star size={18} /> },
  {
    id: "idverifications",
    label: "ID Verifications",
    icon: <ShieldCheck size={18} />,
  },
  { id: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
];

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "bookings";
  const [active, setActive] = useState(initialTab);
  const [hotelId, setHotelId] = useState("");
  const [pendingHotelId, setPendingHotelId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.role || user.role !== "admin") {
      toast.error("Access denied. Admins only.");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const saved = localStorage.getItem("admin-hotelId");
    if (saved) {
      setHotelId(saved);
      setPendingHotelId(saved);
    }
  }, []);

  useEffect(() => {
    if (hotelId) {
      localStorage.setItem("admin-hotelId", hotelId);
    }
  }, [hotelId]);

  const isHotelInputTab = ["rooms", "images", "offers"].includes(active);

  const handleConfirmHotelId = () => {
    if (pendingHotelId.length === 24) {
      setHotelId(pendingHotelId);
      toast.success("Hotel ID updated!");
    } else {
      toast.error("Invalid Hotel ID");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-[#0D9488]">
        Admin Panel
      </h1>

      {/* Hotel ID Selection */}
      {isHotelInputTab && (
        <div className="mb-4 space-y-3">
          {hotelId && (
            <div className="p-3 bg-green-100 border border-green-300 rounded">
              <p className="text-green-800">
                ✅ Now managing Hotel: <strong>{hotelId}</strong>
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(hotelId);
                  toast.success("Hotel ID copied!");
                }}
                className="mt-2 px-3 py-1 bg-[#0D9488] hover:bg-[#0f766e] text-white text-sm rounded"
              >
                Copy Hotel ID
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              value={pendingHotelId}
              onChange={(e) => setPendingHotelId(e.target.value)}
              placeholder="Enter Hotel ID"
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
            <button
              onClick={handleConfirmHotelId}
              className="px-3 py-2 bg-[#0D9488] hover:bg-[#0f766e] text-white text-sm rounded w-full sm:w-auto"
            >
              Set ID
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActive(tab.id);
              navigate(`/admin/dashboard?tab=${tab.id}`);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
              active === tab.id
                ? "bg-[#0D9488] text-white"
                : "bg-white text-gray-700 shadow hover:bg-gray-100"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        {active === "bookings" && <BookingsTab />}
        {active === "rooms" && <RoomsTab hotelId={hotelId} />}
        {active === "images" && <ImagesTab hotelId={hotelId} />}
        {active === "offers" && <OffersTab hotelId={hotelId} />}
        {active === "reviews" && <PendingReviewsTab />}
        {active === "idverifications" && <PendingVerificationsTab />}
        {active === "analytics" && <AnalyticsTab />}
        {active === "addhotel" && (
          <AddHotelTab
            onHotelAdded={(hotel) => {
              setHotelId(hotel._id);
              setPendingHotelId(hotel._id);
              localStorage.setItem("admin-hotelId", hotel._id);
              toast.success(`Hotel "${hotel.name}" added successfully.`);
              setActive("images");
              navigate("/admin/dashboard?tab=images");
            }}
          />
        )}
      </div>
    </div>
  );
}
