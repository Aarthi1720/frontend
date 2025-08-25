import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import HotelCardGrid from '../components/HotelCardGrid';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Spinner from '../components/common/Spinner';

const HotelsPage = () => {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const location = searchParams.get('location') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '';

  const hasDates = Boolean(checkIn && checkOut);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        let data;
        if (hasDates) {
          ({ data } = await api.get('/hotels/search-availability', {
            params: { location, checkIn, checkOut, guests }
          }));
        } else {
          ({ data } = await api.get('/hotels', {
            params: { location, limit: 12 }
          }));
        }
        setHotels(data.hotels || []);
      } catch (err) {
        console.error('Error fetching hotels:', err);
        toast.error('Failed to fetch hotels');
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [location, checkIn, checkOut, guests, hasDates]);

  const summary = [
    location && `Location: ${location}`,
    hasDates && `Dates: ${checkIn} → ${checkOut}`,
    guests && `Guests: ${guests}`
  ].filter(Boolean).join(' · ');

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ccfbf1] to-[#fce7f3] p-10">
      <button
        onClick={() => navigate('/')}
        className="relative z-10 flex items-center gap-1 text-[#0D9488] hover:text-[#0F766E] mb-4 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>
      <h2 className="text-3xl font-bold text-[#0D9488] mb-2 text-center md:text-left">Hotels</h2>
      {summary && (
        <p className="text-center text-[#6B7280] mb-6">{summary}</p>
      )}

      {loading && (
        <p className="text-center text-[#6B7280]">Loading hotels…</p>
      )}

      {!loading && hotels.length === 0 && (
        <p className="text-center text-[#FB7185]">No hotels found for the selected filters.</p>
      )}

      {!loading && hotels.length > 0 && (
        <HotelCardGrid hotels={hotels} loading={false} />
      )}
    </div>
  );
};

export default HotelsPage;
