import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { AuthContext } from "../context/AuthContext";
import { maskEmail } from "../utils/maskEmail";
import { Key, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode || "profile";
  const emailFromState = location.state?.email;
  const otpFromState = location.state?.otp;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!emailFromState && !user?.email) {
      navigate("/forgot-password", { replace: true }); // 👈 Block direct access
      return;
    }
    if (emailFromState) setEmail(emailFromState);
    else if (user?.email) setEmail(user.email);
  }, [emailFromState, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("All fields are required");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setResetting(true);
    try {
      const payload =
        mode === "forgot"
          ? { email, otp: otpFromState, password } // ✅ use verified OTP from state
          : { email, password };

      await api.post("/auth/reset-password", payload);
      toast.success("✅ Password reset successful");

      setTimeout(() => {
        navigate(mode === "forgot" ? "/login" : "/profile", { replace: true }); // 👈
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ccfbf1] to-[#fce7f3] px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-[#0D9488] flex items-center justify-center gap-2">
          <Key className="w-6 h-6 text-[#0D9488]" />
          Reset Password
        </h2>

        <p className="text-sm text-center text-gray-600">
          For{" "}
          <span className="font-medium text-[#0D9488]">{maskEmail(email)}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            value={email}
            readOnly
            className="w-full border-2 border-gray-200 px-4 py-2 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (min 6 characters)"
              className="w-full border-2 border-gray-200 px-4 py-2 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-sm text-[#0D9488] hover:text-[#0f766e]"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="relative mt-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full border-2 border-gray-200 px-4 py-2 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2 text-sm text-[#0D9488] hover:text-[#0f766e]"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={resetting}
            className={`w-full py-2 rounded-md text-white font-medium transition text-sm ${
              resetting
                ? "bg-[#0D9488]/60 cursor-wait"
                : "bg-[#0D9488] hover:bg-[#0f766e]"
            }`}
          >
            {resetting ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
