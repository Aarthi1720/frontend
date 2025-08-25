import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import api from "../lib/axios";
import StripeCheckout from "../components/payments/StripeCheckout";
import Spinner from "./common/Spinner";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

const StripeCheckoutWrapper = ({ bookingId, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(0); // paise
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.post("/payments/create-intent", { bookingId });
        setClientSecret(res.data.clientSecret);
        setAmount(res.data.amount); // FINAL amount in paise (after offer + coins)
      } catch (e) {
        console.error("Failed to init Stripe intent:", e);
        setErr(e?.response?.data?.error || "Payment cannot be initialized");
      } finally {
        setLoading(false);
      }
    };
    if (bookingId) init();
  }, [bookingId]);

  if (loading) return <Spinner />;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!clientSecret) return <div>Payment not initialized</div>;

  const options = {
    clientSecret,
    appearance: { theme: "flat" },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripeCheckout
        bookingId={bookingId}
        amount={amount}
        onSuccess={onSuccess}
      />
    </Elements>
  );
};

export default StripeCheckoutWrapper;
