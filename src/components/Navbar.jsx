import React, { useContext, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { AuthContext } from "../context/AuthContext";
import {
  Heart,
  Home,
  List,
  LogOut,
  ToolCase,
  User,
  Building2,
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, ready, setUser } = useContext(AuthContext);

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);
  const isAdmin = user?.role === "admin";

  const updateFavCount = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const { data } = await api.get("/users/favorites");
      setUser((prev) =>
        prev ? { ...prev, favoriteCount: data.length } : prev
      );
    } catch {
      setUser((prev) => (prev ? { ...prev, favoriteCount: 0 } : prev));
    }
  }, [isLoggedIn, setUser]);

  useEffect(() => {
    updateFavCount();
    window.addEventListener("favoriteUpdated", updateFavCount);
    return () => window.removeEventListener("favoriteUpdated", updateFavCount);
  }, [updateFavCount]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common.Authorization;
    setUser(null);
    toast.success("Logged out");
    navigate("/login");
  };

  const activeColor = "text-[#0D9488]";
  const hoverNeutral = "hover:text-[#111827]";
  const focusRing =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]";
  const linkBase = `text-[#6B7280] transition-all duration-150 ease-in-out font-medium ${hoverNeutral} ${focusRing}`;
  const badge =
    "absolute -top-2 -right-3 bg-[#FB7185] text-white text-xs px-1.5 py-0.5 rounded-full";

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 w-full bg-white backdrop-blur-sm border-b border-[#E5E7EB] shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-[#0D9488]"
          >
            CasaStay
          </Link>

          {/* Mobile Profile Icon */}
          <div className="md:hidden">
            {isLoggedIn && (
              <NavLink
                to="/profile"
                aria-label="Profile"
                className={`p-2 rounded-lg text-[#0D9488] hover:bg-[#CCFBF1] ${focusRing}`}
              >
                <User size={22} />
              </NavLink>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex gap-6 items-center">
            {[
              { to: "/", label: "Home" },
              { to: "/hotels", label: "Hotels" },
              { to: "/profile", label: "Profile", condition: isLoggedIn },
              {
                to: "/my-bookings",
                label: "My Bookings",
                condition: user?.role === "user",
              },
              {
                to: "/favorites",
                label: "Favorites",
                condition: isLoggedIn,
                showBadge: true,
              },
              {
                to: "/admin/dashboard",
                label: "Admin Panel",
                condition: isAdmin && ready,
              },
            ]
              .filter((link) => link.condition !== false)
              .map(({ to, label, showBadge }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `relative ${linkBase} ${
                      isActive ? `font-semibold ${activeColor}` : ""
                    }`
                  }
                >
                  {label}
                  {showBadge && user?.favoriteCount > 0 && (
                    <span className={badge}>{user.favoriteCount}</span>
                  )}
                </NavLink>
              ))}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className={`text-[#FB7185] hover:text-[#E11D48] flex items-center gap-1 ${focusRing}`}
              >
                <LogOut size={18} /> Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                className={`text-[#0D9488] hover:underline flex items-center gap-1 ${focusRing}`}
              >
                <User size={18} /> Login
              </NavLink>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-[#E5E7EB] shadow md:hidden z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around items-center py-2 pb-[env(safe-area-inset-bottom)]">
            {[
              { to: "/", icon: Home, label: "Home" },
              { to: "/hotels", icon: Building2, label: "Hotels" },
              {
                to: "/my-bookings",
                icon: List,
                label: "Bookings",
                condition: user?.role === "user",
              },
              {
                to: "/favorites",
                icon: Heart,
                label: "Fav",
                condition: isLoggedIn,
                showBadge: true,
              },
              {
                to: "/admin/dashboard",
                icon: ToolCase,
                label: "Admin",
                condition: isAdmin && ready,
              },
            ]
              .filter((link) => link.condition !== false)
              .map(({ to, icon: Icon, label, showBadge }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `relative ${
                      isActive ? "text-[#0D9488]" : "text-[#6B7280]"
                    } text-sm flex flex-col items-center ${focusRing}`
                  }
                  aria-label={label}
                >
                  <Icon size={20} />
                  <span className="text-xs">{label}</span>
                  {showBadge && user?.favoriteCount > 0 && (
                    <span className={badge}>{user.favoriteCount}</span>
                  )}
                </NavLink>
              ))}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className={`text-[#FB7185] text-sm flex flex-col items-center ${focusRing}`}
                aria-label="Logout"
              >
                <LogOut size={20} />
                <span className="text-xs">Logout</span>
              </button>
            ) : (
              <NavLink
                to="/login"
                className={`text-[#6B7280] text-sm flex flex-col items-center ${focusRing}`}
                aria-label="Login"
              >
                <User size={20} />
                <span className="text-xs">Login</span>
              </NavLink>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
