import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) return toast.error("All fields are required");

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });

      const token = data.token;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const me = await api.get("/users/me");
      localStorage.setItem("user", JSON.stringify(me.data));
      setUser(me.data);

      toast.success(`Welcome back, ${me.data.name}!`);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password", { state: { email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ccfbf1] to-[#fce7f3] px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-[#0D9488]">👋Welcome Back</h2>
        <p className="text-sm text-center text-gray-500">Log in to access your dashboard</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D9488] caret-[#0D9488] text-sm text-gray-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-2 border-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D9488] caret-[#0D9488] text-sm text-gray-500"
        />

        <div className="text-right text-sm">
          <button onClick={handleForgotPassword} className="text-[#FB7185] hover:underline font-medium">
            Forgot password?
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-2 rounded-md text-white font-medium transition text-sm ${
            loading ? "bg-[#0D9488]/60 cursor-wait" : "bg-gradient-to-br from-[#0D9488] to-[#68b4ad] hover:bg-gradient-to-tl"
          }`}
        >
          {loading ? "Logging in…" : "Login"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-[#109e92] hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
