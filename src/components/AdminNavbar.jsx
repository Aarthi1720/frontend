import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";
import {
  LayoutDashboard,
  BarChart2,
  UserRound,
  Globe,
  LogOut,
} from "lucide-react";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common.Authorization;
    toast.success("Logged out");
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  // shared styles
  const navCls = (active) =>
    `flex flex-col items-center text-sm ${
      active
        ? "text-[#0D9488] font-semibold"
        : "text-[#6B7280] hover:text-[#111827]"
    }`;

  return (
    <>
      {/* Top bar: brand + logout */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-[#E5E7EB] shadow-sm flex justify-between items-center px-4 h-14">
        <Link
          to="/admin/dashboard"
          className="text-lg font-bold tracking-tight text-[#0D9488]"
        >
          CasaStay
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-[#FB7185] hover:text-[#E11D48]"
        >
          <LogOut size={18} /> Logout
        </button>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E5E7EB] shadow-md md:hidden">
        <div className="grid grid-cols-4 h-16 items-center">
          <NavLink to="/admin/dashboard" className={navCls(isActive("/admin/dashboard"))}>
            <LayoutDashboard size={20} />
            <span className="text-xs">Dashboard</span>
          </NavLink>
          <NavLink to="/admin/analytics" className={navCls(isActive("/admin/analytics"))}>
            <BarChart2 size={20} />
            <span className="text-xs">Analytics</span>
          </NavLink>
          <NavLink to="/admin/account" className={navCls(isActive("/admin/account"))}>
            <UserRound size={20} />
            <span className="text-xs">Account</span>
          </NavLink>
          <Link to="/" className={navCls(false)}>
            <Globe size={20} />
            <span className="text-xs">View Site</span>
          </Link>
        </div>
      </nav>

      {/* Desktop nav (brand left, navs right) */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/admin/dashboard"
            className="text-xl font-bold tracking-tight text-[#0D9488]"
          >
            CasaStay
          </Link>
          <nav className="flex items-center gap-4">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-[#CCFBF1] text-[#0D9488]"
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-[#CCFBF1] text-[#0D9488]"
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                }`
              }
            >
              Analytics
            </NavLink>
            <NavLink
              to="/admin/account"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-[#CCFBF1] text-[#0D9488]"
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                }`
              }
            >
              Account
            </NavLink>
            <Link
              to="/"
              className="px-3 py-2 text-sm font-medium text-[#0D9488] hover:underline"
            >
              View site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-[#FB7185] hover:text-[#E11D48]"
            >
              <LogOut size={16} /> Logout
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}

