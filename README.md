# 🌐 Hotel Booking System – Frontend

This is the **frontend** of the Hotel Booking System – a modern, responsive platform for booking hotel rooms, viewing availability, applying offers, and writing reviews. Built with **React + TailwindCSS**, it integrates seamlessly with the backend API.

---

## ✨ Features

### 🔍 Hotel Search & Filtering
- Search hotels by **location**
- Filter by **amenities**, **guests**, **dates**
- Home page includes a **featured hotels carousel**

### 🛏️ Room Details & Availability
- See room images, pricing, amenities
- Check real-time room availability by date
- View capacity and description

### 📅 Booking System
- Book rooms with check-in/out, guests, special requests
- Integrated with **payment gateway**
- Booking form with client-side validations

### 💳 Payment Integration
- Accepts **credit/debit cards** or **wallets**
- Confirms booking only after successful payment

### 🧾 Booking History
- View **upcoming** and **past bookings**
- Download receipts
- View booking status and details

### ⭐ Reviews & Ratings
- Leave reviews only after completed **paid stays**
- Ratings with star-based system (1 to 5)
- Comments with admin moderation
- Verified badges for guests

### 🎁 Offers & Discounts
- View active offers (home & during booking)
- Apply **discount codes**
- Supports **flat** or **percentage** offers with conditions

### 🪪 ID Verification (KYC)
- Upload Aadhar card photo for verification
- Admins approve or reject manually
- Profile shows verification status

### 🎖 Loyalty Coins
- Earn coins for bookings over ₹1000
- Displayed in the profile page

---

## 🧑‍💻 Tech Stack

| Layer          | Tech                    |
|----------------|-------------------------|
| Frontend       | React (Vite)            |
| Styling        | Tailwind CSS            |
| Routing        | React Router            |
| State          | Context API             |
| API Calls      | Axios                   |
| Notifications  | React Hot Toast         |
| Carousel       | Swiper.js               |

---

## 📁 Folder Structure

frontend/
├── assets/ # Static assets (images, bg)
├── components/ # Reusable components
├── context/ # Auth context
├── lib/ # Axios config
├── pages/ # Page components
├── App.jsx # Main app logic
├── main.jsx # App root
├── index.css
├── .env
