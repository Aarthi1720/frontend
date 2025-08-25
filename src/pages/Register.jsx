import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/common/Spinner";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      await api.post("/auth/verify-registration", {
        email: form.email,
        otp,
      });
      toast.success("✅ Account verified");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <Spinner />;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ccfbf1] to-[#fce7f3] px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
        <h2 className="text-3xl font-bold text-center text-[#0D9488]">
          {step === 1 ? "Register" : "Verify OTP"}
        </h2>

        {step === 1 ? (
          <>
            <input
              name="name"
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 px-4 py-2 rounded-md text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 px-4 py-2 rounded-md text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 px-4 py-2 rounded-md text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
            <button
              onClick={handleRegister}
              disabled={loading}
              className={`w-full py-2 rounded-md text-white font-semibold transition duration-300 ${
                loading
                  ? "bg-[#0D9488]/60 cursor-wait"
                  : "bg-gradient-to-br from-[#0D9488] to-[#68b4ad] hover:bg-gradient-to-tl active:scale-105"
              }`}
            >
              {loading ? "Sending OTP…" : "Register"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm mb-2 text-gray-600 text-center">
              Enter the OTP sent to <strong>{form.email}</strong>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border-2 border-gray-300 px-4 py-2 rounded-md text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.trim().length !== 6}
              className={`w-full py-2 rounded-md text-white font-semibold transition ${
                loading || otp.trim().length !== 6
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Verifying…" : "Verify & Activate"}
            </button>
          </>
        )}

        <p className="text-sm text-center">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[#0D9488] hover:underline font-medium"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
