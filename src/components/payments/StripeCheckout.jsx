import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "../../lib/axios";
import Modal from "../common/Modal";
import Spinner from "../common/Spinner";

/**
 * amount: number (paise) – comes from create-intent via the wrapper.
 */
const StripeCheckout = ({ bookingId, onSuccess, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success/${bookingId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed. Please try again.");
      } else if (paymentIntent?.status === "succeeded") {
        try {
          let booking;
          for (let i = 0; i < 3; i++) {
            try {
              const res = await api.get(`/bookings/${bookingId}`);
              booking = res.data;
              break;
            } catch {
              await new Promise((r) => setTimeout(r, 1000));
            }
          }
          if (!booking) throw new Error("Not found after retries");

          onSuccess?.(booking);
          navigate(`/booking-success/${booking._id}`, {
            state: { justBooked: true, booking },
            replace: true, 
          });
        } catch (fetchErr) {
          console.error("Failed to fetch booking after payment:", fetchErr);
          setErrorMessage("Payment succeeded but booking could not be fetched.");
        }
      } else {
        setErrorMessage(`Payment status: ${paymentIntent?.status || "unknown"}`);
      }
    } catch {
      setErrorMessage("Unexpected error during payment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Wait until Stripe is ready
  if (!stripe || !elements) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  return (
  <div className="bg-white p-6 rounded-lg shadow-md relative max-w-md mx-auto">
    {errorMessage && (
      <Modal
        title="Payment Error"
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
    )}

    <PaymentElement />

    <button
      onClick={handlePayment}
      disabled={submitting || !amount}
      className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition cursor-pointer
                 disabled:opacity-50 disabled:cursor-not-allowed
                 bg-[#0D9488] hover:bg-[#0f766e]"
    >
      {submitting ? (
        <>
          <Spinner size="sm" className="animate-spin" />
          Processing…
        </>
      ) : (
        `Pay ₹${(amount / 100).toFixed(2)}`
      )}
    </button>

    {submitting && (
      <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
        <Spinner />
      </div>
    )}
  </div>
);

};

export default StripeCheckout;
