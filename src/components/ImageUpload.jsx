import React, { useRef } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

export default function ImageUpload({
  files,
  setFiles,
  existing = [],
  onRemoveExisting,
}) {
  const fileInputRef = useRef();

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files);
    const imagesOnly = selected.filter((f) => f.type.startsWith("image/"));

    if (files.length + imagesOnly.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setFiles((prev) => [...prev, ...imagesOnly]);
  };

  const handleRemove = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        className="flex items-center gap-2 px-4 py-2 rounded text-sm text-white bg-[#0D9488] hover:bg-[#0f766e] transition"
      >
        <PhotoIcon className="w-5 h-5 text-white" />
        Upload Images
      </button>

      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={handleSelect}
        className="hidden"
      />

      {/* New Files Preview */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded overflow-hidden"
            >
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-bl"
                aria-label="Remove image"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Existing Cloudinary Images Preview */}
      {existing.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {existing.map((img, idx) => (
            <div
              key={idx}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded overflow-hidden"
            >
              <img
                src={img.url}
                alt="uploaded"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveExisting(img)}
                className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-bl"
                aria-label="Delete uploaded image"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
