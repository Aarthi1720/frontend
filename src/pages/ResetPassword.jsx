import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { AuthContext } from "../context/AuthContext";
import { Key, Eye, EyeOff } from "lucide-react";
import { maskEmail } from "../utils/maskEmail";

const ResetPassword = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode || "profile";
  const emailFromState = location.state?.email;
  const otpFromState = location.state?.otp;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!emailFromState && !user?.email) {
      navigate("/forgot-password", { replace: true });
      return;
    }
    setEmail(emailFromState || user?.email || "");
  }, [emailFromState, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword)
      return toast.error("All fields are required");

    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");

    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    setResetting(true);
    try {
      const payload = mode === "forgot" ? { email, otp: otpFromState, password } : { email, password };
      await api.post("/auth/reset-password", payload);
      toast.success("✅ Password reset successful");

      setTimeout(() => {
        navigate(mode === "forgot" ? "/login" : "/profile", { replace: true });
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ccfbf1] to-[#fce7f3] px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-[#0D9488] flex items-center gap-2">
          <Key className="w-6 h-6" /> Reset Password
        </h2>

        <p className="text-sm text-center text-gray-600">For <span className="font-medium text-[#0D9488]">{maskEmail(email)}</span></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} readOnly className="w-full border px-4 py-2 rounded-md bg-gray-100 text-gray-500 text-sm" />

          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="New password"
              className="w-full border px-4 py-2 rounded-md pr-10 text-sm focus:ring-2 focus:ring-[#0D9488]" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-sm text-[#0D9488]">{showPassword ? <EyeOff /> : <Eye />}</button>
          </div>

          <div className="relative">
            <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password"
              className="w-full border px-4 py-2 rounded-md pr-10 text-sm focus:ring-2 focus:ring-[#0D9488]" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2 text-sm text-[#0D9488]">{showConfirmPassword ? <EyeOff /> : <Eye />}</button>
          </div>

          <button type="submit" disabled={resetting}
            className={`w-full py-2 rounded-md text-white font-medium transition ${
              resetting ? "bg-[#0D9488]/60 cursor-wait" : "bg-[#0D9488] hover:bg-[#0f766e]"
            }`}>
            {resetting ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
