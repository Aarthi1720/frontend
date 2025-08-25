import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ room, hotelId }) => {
  const navigate = useNavigate();

  const handleBook = () => {
    navigate(`/book/${hotelId}/${room._id}`);
  };

  const imageUrl = room.images?.[0]?.url || "https://source.unsplash.com/400x300/?room";

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition duration-300 overflow-hidden">
      <img
        src={imageUrl}
        alt={room.name}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-4 space-y-2">
        <h4 className="text-lg font-semibold text-gray-800">{room.name}</h4>
        <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-blue-600 font-bold">₹{room.price?.toLocaleString()}/night</span>
          <button
            onClick={handleBook}
            className="bg-green-600 text-white px-4 py-1.5 text-sm rounded hover:bg-green-700"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
