import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import RoomForm from "./RoomForm";
import { TrashIcon } from "@heroicons/react/24/solid";

const RoomsTab = ({ hotelId }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadRooms = async () => {
    if (!hotelId) {
      setRooms([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/rooms/${hotelId}`);
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Rooms load error:", err);
      toast.error("Failed to load rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [hotelId]);

  const handleDelete = async (roomId) => {
    try {
      await api.delete(`/rooms/${roomId}`);
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
      toast.success("Room deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (!hotelId) {
    return (
      <p className="text-red-600">⚠️ Please enter a valid Hotel ID above.</p>
    );
  }

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600">
        Managing rooms for Hotel ID:{" "}
        <span className="font-medium text-gray-800">{hotelId || "—"}</span>
      </p>

      <div className="flex items-center mb-3">
        {!hotelId && <p className="text-gray-500">Enter a Hotel ID above.</p>}
        <button
          onClick={() => setShowForm((v) => !v)}
          disabled={!hotelId}
          className={`ml-auto px-4 py-1 rounded ${
            hotelId
              ? "bg-[#0D9488] text-white hover:bg-[#0f766e]"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          } transition`}
        >
          {showForm ? "Close Form" : "Add Room"}
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <RoomForm
            hotelId={hotelId}
            onCreated={(resData) => {
              if (resData?.room?._id) {
                setRooms((prev) => [resData.room, ...prev]);
              } else {
                loadRooms();
              }
              setShowForm(false);
            }}
          />
        </div>
      )}

      <div className="bg-white p-4 rounded shadow-md">
        {loading && <p className="text-gray-600">Loading rooms…</p>}
        {!loading && rooms.length === 0 && (
          <p className="text-gray-500">No rooms found.</p>
        )}
        {!loading &&
          rooms.map((r) => (
            <div
              key={r._id}
              className="border-b-gray-500 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              {r.images?.[0]?.url && (
                <img
                  src={r.images[0].url}
                  alt="Room Preview"
                  className="w-full max-w-[120px] h-auto object-cover rounded"
                />
              )}

              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {r.type} {r.bedType} ({r.view}) — ₹{r.price}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {r.bedType} • {r.view} • Sleeps {r.capacity?.adults ?? 0}+
                  {r.capacity?.children ?? 0} •{" "}
                  {r.amenities?.length > 0
                    ? r.amenities.join(", ")
                    : "No amenities"}
                </p>
              </div>

              <button
                onClick={() => handleDelete(r._id)}
                className="text-sm text-red-500 mt-2 sm:mt-0"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RoomsTab;
