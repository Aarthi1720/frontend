import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AdminNavbar from "./AdminNavbar";

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // These routes should not be constrained by max-width
  const fullScreenRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
    "/profile",
    "/favorites",
    "/hotels",
    "/hotels/:id",
    "/booking-success/:bookingId",
    "/booking/:hotelId/:roomId",
    "/my-bookings",
  ];
  const isFullScreen = fullScreenRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      <main
        className={[
          "flex-grow",
          isFullScreen
            ? "w-full"
            : "w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-screen-xl",
          "pt-16",
          isAdminRoute
            ? "pb-6"
            : "pb-[calc(env(safe-area-inset-bottom)+64px)] md:pb-8",
        ].join(" ")}
      >
        {children}
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default Layout;
