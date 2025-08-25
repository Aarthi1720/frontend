import React from 'react';
import HotelCard from './HotelCard';

const HotelCardGrid = ({ hotels, loading, onRemoveFavorite }) => {
  if (loading) {
    <p className='text-gray-500'>Loading</p>
  }

  if (!Array.isArray(hotels) || hotels.length === 0) {
    return <p className="text-center text-[#6B7280] py-8">No hotels found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {hotels.map((hotel) => (
        hotel && hotel._id && (
          <HotelCard
            key={hotel._id}
            hotel={hotel}
            onRemoveFavorite={onRemoveFavorite}
          />
        )
      ))}
    </div>
  );

};

export default HotelCardGrid;
