import { useState, useEffect } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

export default function OfferForm({ hotelId, onCreated }) {
  const [form, setForm] = useState({
    code: "",
    discountPercent: 10,
    validFrom: "",
    validTo: "",
    maxRedemptions: 100,
    description: "",
  });
  const [autoExpiry, setAutoExpiry] = useState(false);

  useEffect(() => {
    if (autoExpiry && form.validFrom) {
      const fromDate = new Date(form.validFrom);
      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + 7);
      setForm((f) => ({ ...f, validTo: toDate.toISOString().split("T")[0] }));
    }
  }, [autoExpiry, form.validFrom]);

  const isIncomplete =
    !form.code || !form.validFrom || !form.validTo || !hotelId;

  const submit = async (e) => {
    e.preventDefault();
    if (isIncomplete) {
      toast.error(!hotelId ? "Hotel ID is missing" : "Please fill all fields");
      return;
    }

    try {
      await api.post("/offers", { ...form, hotelId });
      toast.success("Offer created");
      onCreated?.();
      setForm({
        code: "",
        discountPercent: 10,
        validFrom: "",
        validTo: "",
        maxRedemptions: 100,
        description: "",
      });
      setAutoExpiry(false);
    } catch (err) {
      console.error("Offer creation failed:", err?.response?.data || err);
      toast.error(err?.response?.data?.message || "Failed to create offer");
    }
  };
  const today = new Date().toISOString().split("T")[0];
  return (
    <>
      <form
        onSubmit={submit}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 mb-4"
      >
        <input
          value={form.code}
          onChange={(e) =>
            setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
          }
          placeholder="Code"
          className="border-2 border-gray-400 text-gray-700 p-2 rounded outline-none"
        />
        <input
          type="number"
          min="1"
          max="90"
          value={form.discountPercent}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              discountPercent: Number(e.target.value),
            }))
          }
          placeholder="% Off"
          className="border-2 border-gray-400 text-gray-700 p-2 rounded outline-none"
        />
        {/* Valid From – cannot be in the past */}
        <input
          type="date"
          min={today}
          value={form.validFrom}
          onChange={(e) =>
            setForm((f) => ({ ...f, validFrom: e.target.value }))
          }
          className="border-2 border-gray-400 text-gray-700 p-2 rounded outline-none"
        />

        {/* Valid To – must be same day or after Valid From */}
        <input
          type="date"
          min={form.validFrom || today}
          value={form.validTo}
          onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))}
          disabled={autoExpiry}
          className="border-2 border-gray-400 text-gray-700 p-2 rounded outline-none"
        />

        <input
          type="number"
          min="1"
          value={form.maxRedemptions}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              maxRedemptions: Number(e.target.value),
            }))
          }
          placeholder="Max Redemptions"
          className="border-2 border-gray-400 text-gray-700 p-2 rounded outline-none"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={autoExpiry}
            onChange={(e) => setAutoExpiry(e.target.checked)}
            className="accent-[#0D9488]"
          />
          Auto-expiry (7 days)
        </label>

        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Optional Description"
          className="col-span-1 sm:col-span-2 md:col-span-6 border-2 border-gray-400 text-gray-700 p-2 rounded outline-none"
        />

        <button
          type="submit"
          disabled={isIncomplete}
          className={`px-4 py-2 rounded font-medium text-white transition ${
            isIncomplete
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#0D9488] hover:bg-[#0f766e]"
          }`}
        >
          Add
        </button>
      </form>

      {/* Preview Card */}
      <div className="bg-white border rounded p-4 shadow-sm max-w-md">
        <h3 className="text-lg font-semibold text-[#0D9488] mb-1">
          {form.code || "OFFERCODE"}
        </h3>
        <p className="text-sm text-gray-700">
          Save <strong>{form.discountPercent}%</strong> on your booking
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Valid from <strong>{form.validFrom || "—"}</strong> to{" "}
          <strong>{form.validTo || "—"}</strong>
        </p>
        <p className="text-xs text-gray-500">
          Max redemptions: <strong>{form.maxRedemptions}</strong>
        </p>
        {form.description && (
          <p className="text-xs text-gray-500 mt-1 italic">
            {form.description}
          </p>
        )}
      </div>
    </>
  );
}
