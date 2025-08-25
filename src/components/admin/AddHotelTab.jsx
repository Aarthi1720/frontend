import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../../lib/axios";

const AddHotelTab = ({ onHotelAdded }) => {
  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    country: "",
    address: "",
    description: "",
    amenities: [],
    emergencyName: "",
    emergencyPhone: "",
    emergencyHours: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const payload = {
      name: form.name,
      location: {
        city: form.city,
        state: form.state,
        country: form.country,
        coordinates: {
          type: "Point",
          coordinates: [parseFloat(form.longitude), parseFloat(form.latitude)],
        },
      },
      address: form.address,
      description: form.description,
      amenities: form.amenities,
      emergencyContact: {
        name: form.emergencyName,
        phone: form.emergencyPhone,
        availableHours: form.emergencyHours,
      },
    };

    try {
      setLoading(true);
      const { data } = await api.post("/hotels", payload);
      if (data && data._id) {
        onHotelAdded?.(data); // use the correct object

        // ✅ Reset form after successful add
        setForm({
          name: "",
          city: "",
          state: "",
          country: "",
          address: "",
          description: "",
          amenities: [],
          emergencyName: "",
          emergencyPhone: "",
          emergencyHours: "",
          latitude: "",
          longitude: "",
        });
      } else {
        toast.error("Hotel created but no ID returned.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add hotel");
    } finally {
      setLoading(false);
    }
  };

  if(loading) return <p className="text-gray-500">Loading...</p>

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <h2 className="text-2xl font-semibold mb-2 text-teal-700">
        Add New Hotel
      </h2>

      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Hotel Name"
        required
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500 caret-teal-700"
      />
      <input
        type="text"
        name="city"
        value={form.city}
        onChange={handleChange}
        placeholder="City"
        required
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500 caret-teal-700"
      />
      <input
        type="text"
        name="state"
        value={form.state}
        onChange={handleChange}
        placeholder="State"
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500 caret-teal-700"
      />
      <input
        type="text"
        name="country"
        value={form.country}
        onChange={handleChange}
        placeholder="Country"
        required
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500 caret-teal-700"
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="number"
          name="latitude"
          value={form.latitude}
          onChange={handleChange}
          placeholder="Latitude"
          step="any"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500 caret-teal-700"
        />
        <input
          type="number"
          name="longitude"
          value={form.longitude}
          onChange={handleChange}
          placeholder="Longitude"
          step="any"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500 caret-teal-700"
        />
      </div>

      <textarea
        name="address"
        value={form.address}
        onChange={handleChange}
        placeholder="Address"
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500 caret-teal-700"
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500 caret-teal-700"
      />

      <div className="mb-3">
        <p className="font-semibold mb-2 text-teal-700">Hotel Amenities</p>
        {["WiFi", "Parking", "Pool", "Gym", "Elevator", "Restaurant"].map(
          (item) => (
            <label
              key={item}
              className="mr-4 inline-block text-sm text-gray-700"
            >
              <input
                type="checkbox"
                checked={form.amenities.includes(item)}
                onChange={() => {
                  setForm((prev) => {
                    const updated = prev.amenities.includes(item)
                      ? prev.amenities.filter((a) => a !== item)
                      : [...prev.amenities, item];
                    return { ...prev, amenities: updated };
                  });
                }}
                className="mr-1 accent-teal-600"
              />
              {item}
            </label>
          )
        )}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="font-semibold mb-2 text-teal-700">Emergency Contact</h3>
        <input
          type="text"
          name="emergencyName"
          value={form.emergencyName}
          onChange={handleChange}
          placeholder="Manager Name"
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500 caret-teal-700"
        />
        <input
          type="text"
          name="emergencyPhone"
          value={form.emergencyPhone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500 caret-teal-700"
        />
        <input
          type="text"
          name="emergencyHours"
          value={form.emergencyHours}
          onChange={handleChange}
          placeholder="Available Hours (e.g., 24/7)"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500 caret-teal-700"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition disabled:bg-gray-400 cursor-pointer"
      >
        {loading ? "Adding…" : "Add Hotel"}
      </button>
    </form>
  );
};

export default AddHotelTab;
