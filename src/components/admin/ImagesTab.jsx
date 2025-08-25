import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import ImageUpload from "../ImageUpload";

export default function ImagesTab({ hotelId }) {
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false); // ⬅️ initialize false

  useEffect(() => {
    if (!hotelId || hotelId.length !== 24) {
      setExistingImages([]); // clear images if invalid
      return;
    }

    const timer = setTimeout(() => {
      const fetchHotel = async () => {
        try {
          setLoading(true);
          const { data } = await api.get(`/hotels/${hotelId}`);
          setExistingImages(data.images || []);
        } catch {
          toast.error("Failed to load hotel images");
        } finally {
          setLoading(false);
        }
      };

      fetchHotel();
    }, 500); // ⏱ debounce time in ms

    // Cleanup if hotelId changes before timeout finishes
    return () => clearTimeout(timer);
  }, [hotelId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hotelId) return toast.error("Hotel ID is missing");
    if (!files.length) return toast.error("Please select at least one image");

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      setUploading(true);
      await api.post(`/hotels/${hotelId}/upload-image`, formData);
      toast.success("Images uploaded");
      setFiles([]);

      // Reload images
      const { data } = await api.get(`/hotels/${hotelId}`);
      setExistingImages(data.images || []);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (img) => {
    try {
      await api.delete(`/hotels/${hotelId}/images`, {
        headers: { "Content-Type": "application/json" },
        data: { public_id: img.public_id },
      });

      setExistingImages((prev) =>
        prev.filter((i) => i.public_id !== img.public_id)
      );
      toast.success("Image deleted");
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      toast.error("Delete failed");
    }
  };

  if (loading) return <p>Loading hotel images...</p>;

  if (!hotelId || hotelId.length !== 24) {
    return (
      <p className="text-red-600">⚠️ Please enter a valid Hotel ID above.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload
        files={files}
        setFiles={setFiles}
        existing={existingImages}
        onRemoveExisting={handleDelete}
      />
      <button
        type="submit"
        disabled={uploading || !files.length}
        className="px-4 py-2 rounded text-white transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        style={{
          backgroundColor: uploading || !files.length ? "#ccc" : "#0D9488",
          ...(uploading || !files.length
            ? {}
            : { ":hover": { backgroundColor: "#0f766e" } }),
        }}
      >
        {uploading ? "Uploading…" : "Upload Selected"}
      </button>
    </form>
  );
}
