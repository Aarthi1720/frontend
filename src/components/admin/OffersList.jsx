import React, { useEffect, useState } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import StatusBadge from "../StatusBadge";
import Spinner from "../common/Spinner";

export default function OffersList({
  hotelId,
  offers: propOffers,
  onUpdated,
  loading: propLoading,
}) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(propLoading || !propOffers);
  const [busyId, setBusyId] = useState(null);
  const [editOffer, setEditOffer] = useState(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/offers", {
        params: hotelId ? { hotelId } : {},
      });
      // console.log('✅ Offers fetched from API:', data);
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load offers error:", err);
      toast.error("Failed to load offers");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch when hotelId changes or component mounts
    fetchOffers();
  }, [hotelId]);

  const deleteOffer = async (id) => {
    if (!confirm("Delete this offer?")) return;
    try {
      setBusyId(id);
      await api.delete(`/offers/${id}`);
      toast.success("Offer deleted");
      onUpdated ? onUpdated() : fetchOffers();
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const deactivateOffer = async (id) => {
    try {
      setBusyId(id);
      await api.patch(`/offers/${id}/deactivate`);
      toast.success("Offer deactivated");
      onUpdated ? onUpdated() : fetchOffers();
    } catch {
      toast.error("Deactivate failed");
    } finally {
      setBusyId(null);
    }
  };

  const saveEdit = async () => {
    if (!editOffer) return;
    try {
      setBusyId(editOffer._id);
      await api.put(`/offers/${editOffer._id}`, editOffer);
      toast.success("Offer updated");
      setEditOffer(null);
      onUpdated ? onUpdated() : fetchOffers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const isExpired = (to) => {
    try {
      return new Date(to) < new Date();
    } catch {
      return false;
    }
  };

  if (loading) return <Spinner />;
  if (!offers.length) return <p className="text-gray-500">No offers found.</p>;
  if (!hotelId) {
    return (
      <p className="text-red-600">
        Please enter a valid Hotel ID to manage offers.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((o) => {
        const expired = isExpired(o.validTo);
        const status = expired ? "expired" : o.isActive ? "active" : "inactive";

        return (
          <div
            key={o._id}
            className="border p-4 rounded bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#0D9488]">{o.code}</h3>
              <p className="text-sm text-gray-700">
                {o.discountPercent}% off · Min ₹{o.minBookingAmount} · Max{" "}
                {o.maxRedemptions || "∞"} uses
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Valid:{" "}
                {o.validFrom ? new Date(o.validFrom).toLocaleDateString() : "—"}{" "}
                → {o.validTo ? new Date(o.validTo).toLocaleDateString() : "—"}
              </p>
              <div className="mt-1">
                <StatusBadge status={status} />
              </div>

              {o.maxRedemptions > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    Usage: {o.redemptionCount} / {o.maxRedemptions}
                  </p>
                  <div className="h-2 bg-gray-200 rounded mt-1 w-full max-w-xs">
                    <div
                      className="h-2 bg-[#0D9488] rounded"
                      style={{
                        width: `${Math.min(
                          100,
                          (o.redemptionCount / o.maxRedemptions) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {o.description && (
                <p className="mt-1 text-xs text-gray-600 italic">
                  {o.description}
                </p>
              )}
            </div>

            <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
              <button
                onClick={() => setEditOffer(o)}
                className="px-3 py-1 rounded bg-[#0D9488] text-white text-sm hover:bg-[#0f766e]"
              >
                Edit
              </button>
              {!expired && o.isActive && (
                <button
                  onClick={() => deactivateOffer(o._id)}
                  disabled={busyId === o._id}
                  className="px-3 py-1 rounded bg-amber-500 text-white text-sm hover:bg-amber-600 disabled:opacity-50"
                >
                  Deactivate
                </button>
              )}
              <button
                onClick={() => deleteOffer(o._id)}
                disabled={busyId === o._id}
                className="px-3 py-1 rounded bg-rose-500 text-white text-sm hover:bg-rose-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}

      {/* Edit Offer Modal */}
      {editOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-[#0D9488]">Edit Offer</h2>

            {/* Form Fields */}
            {[
              "code",
              "description",
              "discountPercent",
              "minBookingAmount",
              "maxRedemptions",
              "validFrom",
              "validTo",
            ].map((field) => (
              <label key={field} className="block">
                <span className="text-sm text-gray-700 capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </span>
                {["description"].includes(field) ? (
                  <textarea
                    value={editOffer[field] || ""}
                    onChange={(e) =>
                      setEditOffer({ ...editOffer, [field]: e.target.value })
                    }
                    className="border p-2 w-full rounded mt-1"
                  />
                ) : (
                  <input
                    type={
                      field.includes("Percent") ||
                      field.includes("Amount") ||
                      field.includes("Redemptions")
                        ? "number"
                        : field.includes("valid")
                        ? "date"
                        : "text"
                    }
                    value={
                      field.includes("valid") && editOffer[field]
                        ? new Date(editOffer[field]).toISOString().split("T")[0]
                        : editOffer[field] || ""
                    }
                    onChange={(e) => {
                      const val =
                        field.includes("Percent") || field.includes("Amount")
                          ? Number(e.target.value)
                          : e.target.value;
                      setEditOffer({ ...editOffer, [field]: val });
                    }}
                    className="border p-2 w-full rounded mt-1"
                  />
                )}
              </label>
            ))}

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditOffer(null)}
                className="px-3 py-1 rounded bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={busyId === editOffer._id}
                className="px-3 py-1 rounded bg-[#0D9488] text-white hover:bg-[#0f766e] disabled:opacity-50 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
