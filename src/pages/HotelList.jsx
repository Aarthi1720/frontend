import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/axios';
import HotelCardGrid from '../components/HotelCardGrid';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';

const HotelList = () => {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = searchParams.get('location') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '';

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/hotels/search-availability', {
          params: { location, checkIn, checkOut, guests }
        });
        setHotels(data.hotels || []);
      } catch (err) {
        console.error('Error fetching hotels:', err);
        toast.error('Failed to fetch hotels for your search');
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [location, checkIn, checkOut, guests]);

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 pt-6 px-4">
      <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">Search Results</h2>
      
      {loading && <p className="text-center text-gray-500">Loading hotels...</p>}

      {!loading && hotels.length === 0 && (
        <p className="text-center text-red-500">No hotels found for the selected filters.</p>
      )}

      {!loading && hotels.length > 0 && (
        <HotelCardGrid hotels={hotels} loading={false} />
      )}
    </div>
  );
};

export default HotelList;
