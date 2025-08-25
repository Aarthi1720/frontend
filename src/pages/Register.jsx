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
    if (!form.name || !form.email || !form.password)
      return toast.error("All fields are required");

    if (!/^\S+@\S+\.\S+$/.test(form.email))
      return toast.error("Enter a valid email address");

    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");

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
    if (otp.trim().length !== 6) return toast.error("Enter a valid 6-digit OTP");

    setLoading(true);
    try {
      await api.post("/auth/verify-registration", { email: form.email, otp });
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
        <h2 className="text-3xl font-bold text-center text-[#0D9488]">{step === 1 ? "Register" : "Verify OTP"}</h2>

        {step === 1 ? (
          <>
            <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange}
              className="w-full border-2 border-gray-300 px-4 py-2 rounded-md text-gray-600 focus:ring-2 focus:ring-[#0D9488] outline-none" />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange}
              className="w-full border-2 border-gray-300 px-4 py-2 rounded-md text-gray-600 focus:ring-2 focus:ring-[#0D9488] outline-none" />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange}
              className="w-full border-2 border-gray-300 px-4 py-2 rounded-md text-gray-600 focus:ring-2 focus:ring-[#0D9488] outline-none" />

            <button onClick={handleRegister} disabled={loading}
              className={`w-full py-2 rounded-md text-white font-semibold transition ${
                loading ? "bg-[#0D9488]/60 cursor-wait" : "bg-gradient-to-br from-[#0D9488] to-[#68b4ad] hover:bg-gradient-to-tl"
              }`}>
              {loading ? "Sending OTP…" : "Register"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-center text-gray-600 mb-2">Enter the OTP sent to <strong>{form.email}</strong></p>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP"
              className="w-full border-2 border-gray-300 px-4 py-2 rounded-md text-gray-600 focus:ring-2 focus:ring-[#0D9488]" />
            <button onClick={handleVerifyOtp} disabled={loading}
              className={`w-full py-2 rounded-md text-white font-semibold transition ${
                loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
              }`}>
              {loading ? "Verifying…" : "Verify & Activate"}
            </button>
          </>
        )}

        <p className="text-sm text-center">
          Already have an account?{" "}
          <a href="/login" className="text-[#0D9488] hover:underline font-medium">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
