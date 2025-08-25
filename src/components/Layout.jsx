import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AdminNavbar from "./AdminNavbar";

// tiny helper: read role from localStorage safely
function getStoredUserRole() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.role || null;
  } catch {
    return null;
  }
}

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const role = getStoredUserRole();
  const isAdmin = role === "admin";

  // Only show AdminNavbar if path is /admin* AND stored role is admin
  const showAdminNav = isAdminPath && isAdmin;

  // Routes that should be full-width (no max container)
  const fullScreenPrefixes = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
    "/profile",
    "/favorites",
    "/hotels",   // includes /hotels and /hotels/:id
    "/booking/", // booking flow pages
  ];
  const isHome = location.pathname === "/";
  const isFullScreen =
    isHome || fullScreenPrefixes.some((p) => location.pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {showAdminNav ? <AdminNavbar /> : <Navbar />}

      <main
        className={[
          "flex-grow",
          isFullScreen
            ? "w-full"
            : "w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-screen-xl",
          "pt-16",
          showAdminNav
            ? "pb-6"
            : "pb-[calc(env(safe-area-inset-bottom)+64px)] md:pb-8",
        ].join(" ")}
      >
        {children}
      </main>

      {!showAdminNav && <Footer />}
    </div>
  );
};

export default Layout;
