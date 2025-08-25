import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

const Inner = ({ onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required"
    });

    setSubmitting(false);

    if (confirmError) {
      setError(confirmError.message || "Payment failed.");
      onClose(false);
    } else {
      onSuccess?.();
      onClose(true);
    }
  };

  return (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Complete your payment
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onClose(false)}
            disabled={submitting}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || submitting}
            className="px-5 py-2 rounded-md bg-[#0D9488] text-white hover:bg-[#0f766e] disabled:opacity-50 transition"
          >
            {submitting ? "Processing…" : "Pay Now"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

};

const PaymentModal = ({ clientSecret, onSuccess, onClose }) => {
  if (!clientSecret) return null;
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <Inner onSuccess={onSuccess} onClose={onClose} />
    </Elements>
  );
};

export default PaymentModal;
