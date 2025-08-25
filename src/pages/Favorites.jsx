import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";
import HotelCardGrid from "../components/HotelCardGrid";
import { ArrowLeft, Heart } from "lucide-react";
import Spinner from "../components/common/Spinner";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users/favorites");
      setFavorites(data);
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
      toast.error("Failed to load favorites");
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemoveFavorite = (hotelId) => {
    setFavorites((prev) => prev.filter((h) => h._id !== hotelId));
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ccfbf1] to-[#fce7f3] pt-20 md:pt-10 pb-10 md:px-5 lg:px-10">
      <button
        onClick={() => navigate("/")}
        className="mb-4 flex items-center gap-1 text-[#0D9488] hover:text-[#0F766E] transition ml-5"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </button>
      <h2 className="text-2xl font-bold text-[#FB7185] mb-6 text-center flex items-center justify-center gap-2">
        <Heart className="w-6 h-6 text-[#FB7185]" />
        My Favorite Hotels
      </h2>

      <div className="max-w-6xl mx-auto px-4">
        <HotelCardGrid
          hotels={favorites}
          loading={loading}
          onRemoveFavorite={handleRemoveFavorite}
        />
      </div>
    </div>
  );
};

export default Favorites;
