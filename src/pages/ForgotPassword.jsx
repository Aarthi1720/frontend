import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { maskEmail } from "../utils/maskEmail";
import { MailCheck, ArrowLeft } from "lucide-react"; // ← Import required icons

const ForgotPassword = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");

  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Enter your email");
    if (sending) return;
    if (cooldown > 0) return;

    setSending(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success(`📩 OTP sent to ${maskEmail(email)}`, { id: "otp-sent" });

      setCooldown(30);
      setTimeout(() => {
        navigate("/verify-otp", { state: { email }, replace: true });
      }, 500); // Delay navigation to let toast render
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ccfbf1] to-[#fce7f3] px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-[#0D9488] flex items-center justify-center gap-2">
          <MailCheck className="w-6 h-6 text-[#0D9488]" />
          Forgot Your Password?
        </h2>

        <p className="text-sm text-gray-600 text-center">
          Enter your email to receive a one-time password (OTP)
        </p>

        <form onSubmit={handleSendOtp} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border-2 border-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D9488] caret-[#0D9488] text-sm"
          />

          <button
            type="submit"
            disabled={cooldown > 0 || sending}
            className={`w-full py-2 rounded-md text-white font-medium transition text-sm ${
              cooldown > 0 || sending
                ? "bg-[#0D9488]/60 cursor-not-allowed"
                : "bg-[#0D9488] hover:bg-[#0f766e]"
            }`}
          >
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : sending
              ? "Sending..."
              : "Send OTP"}
          </button>
        </form>

        <p
          className="text-sm text-center text-[#FB7185] hover:underline cursor-pointer flex items-center justify-center gap-1"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </p>

        <div className="text-xs text-center text-gray-500">
          Make sure your email is registered with CasaStay.
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
