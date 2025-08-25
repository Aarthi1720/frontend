import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { maskEmail } from "../utils/maskEmail";
import { MailCheck, Clock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const otpRef = useRef(null);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
      return;
    }
    otpRef.current?.focus();
  }, [email, navigate]);

  const handleVerify = async () => {
    if (otp.trim().length !== 6) return toast.error("Enter a valid 6-digit OTP");
    setVerifying(true);
    try {
      await api.post("/auth/verify-reset-otp", { email, otp });
      toast.success("✅ OTP verified");
      navigate("/reset-password", { state: { email, otp, mode: "forgot" }, replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ccfbf1] to-[#fce7f3] px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-[#0D9488] flex items-center justify-center gap-2">
          <MailCheck className="w-6 h-6" /> Verify OTP
        </h2>

        <p className="text-sm text-center text-gray-600">Enter the OTP sent to <span className="font-medium text-[#0D9488]">{maskEmail(email)}</span></p>

        <input ref={otpRef} type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="• • • • • •"
          className="w-full border-2 border-gray-200 px-4 py-2 rounded-md text-center tracking-widest font-mono text-sm focus:ring-2 focus:ring-[#0D9488]" maxLength={6} />

        <button onClick={handleVerify} disabled={verifying || otp.trim().length !== 6}
          className={`w-full py-2 rounded-md text-white font-medium transition ${
            verifying ? "bg-[#0D9488]/60 cursor-wait" : "bg-[#0D9488] hover:bg-[#0f766e]"
          }`}>
          {verifying ? <><Clock className="inline w-5 h-5 mr-2 animate-spin" /> Verifying…</> : <><MailCheck className="inline w-5 h-5 mr-2" /> Verify OTP</>}
        </button>

        <p onClick={() => navigate("/forgot-password", { replace: true })}
          className="text-sm text-center text-[#FB7185] hover:underline cursor-pointer flex items-center justify-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Resend OTP
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
