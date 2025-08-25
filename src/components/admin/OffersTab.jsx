import React, { useState, useEffect, useCallback } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import OfferForm from "./OfferForm";
import OffersList from "./OffersList";
import Loader from "../ui/Loader";

const OffersTab = ({ hotelId }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/offers", {
        params: hotelId && hotelId.trim() !== "" ? { hotelId } : {},
      });
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load offers error:", err);
      toast.error("Failed to load offers");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    if (hotelId) fetchOffers();
    else console.warn("Hotel ID missing — offers will not load");
  }, [fetchOffers, hotelId]);

  if (loading) {
    return (
      <div className="p-4">
        <Loader />
      </div>
    );
  }

  if (!hotelId) {
    return (
      <p className="text-red-600">⚠️ Please enter a valid Hotel ID above.</p>
    );
  }

  return (
    <div className="space-y-4">
      <OfferForm hotelId={hotelId} onCreated={fetchOffers} />
      <OffersList
        hotelId={hotelId}
        offers={offers}
        onUpdated={fetchOffers}
        loading={loading}
      />
    </div>
  );
};

export default OffersTab;
