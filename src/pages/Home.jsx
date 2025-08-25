import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import OfferCarousel from "../components/OfferCarousel";
import bg1 from "../assets/images/bg.jpg";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import HotelCard from "../components/HotelCard";

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const navigate = useNavigate();

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/hotels", {
        params: { limit: 10, page: 1 },
      });
      setHotels(data.hotels || []);
    } catch (err) {
      console.error("Error fetching hotels:", err);
      toast.error("Failed to load hotels");
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const { data } = await api.get("/offers/public?limit=4");
      setOffers(data.offers || []);
    } catch (err) {
      console.error("Error fetching offers:", err);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (checkIn) params.append("checkIn", checkIn);
    if (checkOut) params.append("checkOut", checkOut);
    if (guests) params.append("guests", guests);
    navigate(`/hotels?${params.toString()}`);
  };

  useEffect(() => {
    fetchHotels();
    fetchOffers();
  }, []);

  return (
    <div className="bg-[#fdfaf6] min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[520px]">
        <div className="absolute inset-0 bg-black/40">
          <img
            src={bg1}
            alt="Hero Background"
            className="absolute inset-0 object-cover w-full h-full"
          />
          <div className="relative z-10 inset-0 flex flex-col items-center justify-center text-center text-white px-4 mt-20">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-lg">
              Find Your Perfect Stay
            </h1>
            <p className="text-base md:text-lg mb-5 drop-shadow">
              Explore top-rated hotels, exclusive deals, and seamless bookings
            </p>
            <div className="w-full">
              <SearchBar
                location={location}
                setLocation={setLocation}
                checkIn={checkIn}
                setCheckIn={setCheckIn}
                checkOut={checkOut}
                setCheckOut={setCheckOut}
                guests={guests}
                setGuests={setGuests}
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="py-10 px-4 md:px-8 bg-[#fefcf9]">
        <h2 className="text-2xl font-semibold mb-6 text-[#6b5a44]">
          🏨 Featured Hotels
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading hotels…</p>
        ) : hotels.length === 0 ? (
          <p className="text-gray-500">No hotels found.</p>
        ) : (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24}
            grabCursor
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3.2 },
            }}
            navigation
            pagination={{ clickable: true }}
          >
            {hotels.map((hotel) => (
              <SwiperSlide key={hotel._id}>
                <HotelCard hotel={hotel} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/hotels"
            className="inline-block bg-gradient-to-r from-[#dc9421] to-[#a66f0e] hover:from-[#b87e17] hover:to-[#875d0a] text-white px-5 py-2 rounded shadow"
          >
            View all hotels
          </Link>
        </div>
      </section>

      {/* Offers Section */}
      <section className="p-6 bg-[#fefcf9]">
        <h2 className="text-2xl font-semibold mb-4 text-[#6b5a44]">
          🔥 Travel Deals
        </h2>
        <OfferCarousel offers={offers} interval={5000} />
      </section>

      {/* Testimonials Section */}
      <section className="p-6 bg-[#f3f2f0]">
        <h2 className="text-2xl font-semibold mb-4 text-[#6b5a44]">
          💬 What Our Guests Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Priya",
              comment: "Booking was smooth and the hotel was amazing!",
            },
            {
              name: "Rahul",
              comment: "Loved the loyalty coins feature. Great value!",
            },
            {
              name: "Meena",
              comment: "Emergency contact gave me peace of mind during travel.",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow"
            >
              <p className="text-gray-700 italic">“{t.comment}”</p>
              <p className="mt-2 font-semibold text-right text-[#6b5a44]">
                — {t.name}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
