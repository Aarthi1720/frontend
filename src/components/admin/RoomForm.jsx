import React, { useState } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import ImageUpload from "../ImageUpload";

const RoomForm = ({ hotelId, onCreated }) => {
  const [type, setType] = useState("Standard");
  const [bedType, setBedType] = useState("Queen");
  const [view, setView] = useState("City");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [amenities, setAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleAmenityToggle = (item) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!hotelId) return toast.error("Enter a Hotel ID first");

    const formData = new FormData();
    formData.append("hotelId", hotelId);
    formData.append("type", type);
    formData.append("bedType", bedType);
    formData.append("view", view);
    formData.append("description", description);
    formData.append("price", price);

    formData.append("capacity.adults", adults);
    formData.append("capacity.children", children);

    amenities.forEach((a) => formData.append("amenities[]", a));
    images.forEach((file) => formData.append("images", file)); // ✅ actual files

    try {
      setSubmitting(true);
      const { data } = await api.post("/rooms/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Room created successfully");
      onCreated?.(data);

      // Reset
      setType("Standard");
      setBedType("Queen");
      setView("City");
      setDescription("");
      setPrice("");
      setAdults(2);
      setChildren(0);
      setAmenities([]);
      setImages([]);
    } catch (err) {
      console.error(
        "Room create failed:",
        err?.response?.data || err.message || err
      );
      toast.error(err?.response?.data?.error || "Failed to create room");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-[#0D9488]">
        Add New Room
      </h3>

      <div className="grid gap-4 mb-3 md:grid-cols-2 ">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="your-grid-container border-2 border-gray-400 text-gray-500 outline-none p-2 rounded lg:w-[90%]"
        >
          <option value="Standard">Standard</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Suite">Suite</option>
        </select>

        <select
          value={bedType}
          onChange={(e) => setBedType(e.target.value)}
          className="border-2 border-gray-400 text-gray-500 outline-none p-2 rounded w-full lg:w-[90%]"
        >
          <option className="">Queen</option>
          <option>King</option>
          <option>Twin</option>
        </select>

        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="border-2 border-gray-400 text-gray-500 outline-none p-2 rounded mb-3 w-full lg:w-[90%]"
        >
          <option>City</option>
          <option>Sea</option>
          <option>Courtyard</option>
        </select>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Room Description"
        className="border-2 border-gray-400 text-gray-500 outline-none p-2 rounded w-full mb-3"
      />

      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price per night"
        className="border-2 border-gray-400 text-gray-500 outline-none p-2 rounded w-full mb-3"
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-3">
        <div className="w-full">
          <label className="text-sm font-medium text-gray-700">Adults</label>
          <input
            type="number"
            min={1}
            value={adults}
            onChange={(e) => setAdults(e.target.value)}
            className="border-2 border-gray-400 text-gray-500 outline-none p-2 rounded w-full"
          />
        </div>
        <div className="w-full">
          <label className="text-sm font-medium text-gray-700">Children</label>
          <input
            type="number"
            min={0}
            value={children}
            onChange={(e) => setChildren(e.target.value)}
            className="border-2 border-gray-400 text-gray-500 outline-none p-2 rounded w-full"
          />
        </div>
      </div>

      <div className="mb-3">
        <p className="font-semibold mb-2 text-[#0D9488]">Amenities</p>
        {["WiFi", "AC", "TV", "Mini Fridge", "Balcony"].map((item) => (
          <label key={item} className="mr-4 inline-block text-sm text-gray-700">
            <input
              type="checkbox"
              checked={amenities.includes(item)}
              onChange={() => handleAmenityToggle(item)}
              className="accent-teal-600"
            />
            <span className="ml-1">{item}</span>
          </label>
        ))}
      </div>

      <ImageUpload files={images} setFiles={setImages} />

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-[#0D9488] hover:bg-[#0f766e] text-white px-4 py-2 rounded w-full mt-4 transition cursor-pointer"
      >
        {submitting ? "Creating…" : "Create Room"}
      </button>
    </div>
  );
};

export default RoomForm;
