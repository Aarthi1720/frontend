// src/components/SearchBar.jsx
import React from "react";

const SearchBar = ({
  location,
  setLocation,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  guests,
  setGuests,
  onSearch,
}) => {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className=" px-4 md:px-6">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-4 flex flex-col md:flex-row gap-2 items-stretch ">
        {/* Location */}
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="flex-1 border border-gray-300 p-2 rounded text-sm text-gray-500 outline-none"
        />

        {/* Check-in */}
        <input
          type="date"
          value={checkIn}
          min={today} // ✅ Prevent past check-in
          onChange={(e) => setCheckIn(e.target.value)}
          className="flex-1 border border-gray-300 p-2 rounded text-sm text-gray-500 outline-none"
        />

        {/* Check-out */}
        <input
          type="date"
          value={checkOut}
          min={checkIn || today} // ✅ Prevent check-out before check-in
          onChange={(e) => setCheckOut(e.target.value)}
          className="flex-1 border border-gray-300 p-2 rounded text-sm text-gray-500 outline-none"
        />

        {/* Guests */}
        <input
          type="number"
          min={0}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          placeholder="Guests"
          className="border border-gray-300 p-2 rounded text-sm text-gray-500 outline-none md:w-[50%] lg:w-[20%]"
        />

        {/* Search Button */}
        <button
          onClick={onSearch}
          className="lg:w-auto w-full bg-[#0D9488] hover:bg-[#0f766e] text-white px-5 py-2 rounded text-sm font-semibold"
        >
          Search
        </button>
      </div>
    </div>
  );

  // return (
  //   <div className="bg-white p-4 rounded shadow-md flex flex-col gap-2 md:flex-row md:max-w-7xl md:relative">
  //     <input
  //       value={location}
  //       onChange={(e) => setLocation(e.target.value)}
  //       type="text"
  //       placeholder="Location"
  //       className="border border-gray-300 text-black p-1 rounded w-full md:w-[50%]"
  //     />
  //     <input
  //       value={checkIn}
  //       onChange={(e) => setCheckIn(e.target.value)}
  //       type="date"
  //       className="border border-gray-300 text-black p-1 rounded w-full md:w-[50%]"
  //     />
  //     <input
  //       value={checkOut}
  //       onChange={(e) => setCheckOut(e.target.value)}
  //       type="date"
  //       className="border border-gray-300 text-black p-1 rounded  w-full md:w-[50%]"
  //     />
  //     <input
  //       value={guests}
  //       onChange={(e) => setGuests(Number(e.target.value))}
  //       type="number"
  //       className="border border-gray-300 text-black p-1 rounded  w-full md:w-[50%]"
  //     />
  //     <button
  //       onClick={onSearch}
  //       className="bg-[#0D9488] hover:bg-[#0f766e] text-white px-4 py-2 rounded  w-full md:w-[50%]"
  //     >
  //       Search
  //     </button>
  //   </div>
  // );
};

export default SearchBar;

// import { MapPin, Calendar, Users, Search } from "lucide-react";

// export default function SearchBar({
//   location, setLocation,
//   checkIn, setCheckIn,
//   checkOut, setCheckOut,
//   guests, setGuests,
//   onSearch
// }) {
//   const field =
//     "w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm " +
//     "placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#99F6E4] focus:border-[#0D9488]";

//   return (
//     <div className="w-full">
//       {/* Mobile-first grid: stack → spread out on md+ */}
//       <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5 md:gap-3">
//         {/* Location */}
//         <label className="col-span-1 sm:col-span-2 md:col-span-2">
//           <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2">
//             <MapPin className="w-4 h-4 text-[#0D9488]" />
//             <input
//               value={location}
//               onChange={(e) => setLocation(e.target.value)}
//               placeholder="Location"
//               className="w-full outline-none text-sm placeholder:text-[#94A3B8]"
//             />
//           </div>
//         </label>

//         {/* Check-in */}
//         <label className="col-span-1">
//           <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2">
//             <Calendar className="w-4 h-4 text-[#0D9488]" />
//             {/* keep text input to avoid changing your dd-mm-yyyy logic */}
//             <input
//               value={checkIn}
//               onChange={(e) => setCheckIn(e.target.value)}
//               placeholder="dd-mm-yyyy"
//               inputMode="numeric"
//               className="w-full outline-none text-sm placeholder:text-[#94A3B8]"
//             />
//           </div>
//         </label>

//         {/* Check-out */}
//         <label className="col-span-1">
//           <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2">
//             <Calendar className="w-4 h-4 text-[#0D9488]" />
//             <input
//               value={checkOut}
//               onChange={(e) => setCheckOut(e.target.value)}
//               placeholder="dd-mm-yyyy"
//               inputMode="numeric"
//               className="w-full outline-none text-sm placeholder:text-[#94A3B8]"
//             />
//           </div>
//         </label>

//         {/* Guests */}
//         <label className="col-span-1 sm:col-span-1">
//           <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2">
//             <Users className="w-4 h-4 text-[#0D9488]" />
//             <input
//               value={guests}
//               onChange={(e) => setGuests(Number(e.target.value || 1))}
//               placeholder="1"
//               inputMode="numeric"
//               className="w-full outline-none text-sm placeholder:text-[#94A3B8]"
//             />
//           </div>
//         </label>

//         {/* Search button (full width on mobile) */}
//         <div className="col-span-1 sm:col-span-2 md:col-span-1">
//           <button
//             onClick={onSearch}
//             className="w-full inline-flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
//           >
//             <Search className="w-4 h-4" />
//             Search
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { MapPin, Calendar, Users, Search } from "lucide-react";

// export default function SearchBar({
//   location, setLocation,
//   checkIn, setCheckIn,
//   checkOut, setCheckOut,
//   guests, setGuests,
//   onSearch
// }) {
//   return (
//     <div className="">
//       {/* Mobile-first grid: stack → spread on md+ */}
//       <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5 md:gap-3">
//         {/* Location */}
//         <label className="col-span-1 sm:col-span-2 md:col-span-2">
//           <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2">
//             <MapPin className="w-4 h-4 text-[#0D9488]" />
//             <input
//               value={location}
//               onChange={(e) => setLocation(e.target.value)}
//               placeholder="Location"
//               className="w-full outline-none text-sm placeholder:text-[#94A3B8]"
//             />
//           </div>
//         </label>

//         {/* Check-in */}
//         <label className="col-span-1">
//           <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2">
//             <Calendar className="w-4 h-4 text-[#0D9488]" />
//             {/* keep text to avoid breaking your dd-mm-yyyy logic */}
//             <input
//               value={checkIn}
//               onChange={(e) => setCheckIn(e.target.value)}
//               placeholder="dd-mm-yyyy"
//               inputMode="numeric"
//               className="w-full outline-none text-sm placeholder:text-[#94A3B8]"
//             />
//           </div>
//         </label>

//         {/* Check-out */}
//         <label className="col-span-1">
//           <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2">
//             <Calendar className="w-4 h-4 text-[#0D9488]" />
//             <input
//               value={checkOut}
//               onChange={(e) => setCheckOut(e.target.value)}
//               placeholder="dd-mm-yyyy"
//               inputMode="numeric"
//               className="w-full outline-none text-sm placeholder:text-[#94A3B8]"
//             />
//           </div>
//         </label>

//         {/* Guests */}
//         <label className="col-span-1 sm:col-span-1">
//           <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2">
//             <Users className="w-4 h-4 text-[#0D9488]" />
//             <input
//               value={guests}
//               onChange={(e) => setGuests(Number(e.target.value || 1))}
//               placeholder="1"
//               inputMode="numeric"
//               className="w-full outline-none text-sm placeholder:text-[#94A3B8]"
//             />
//           </div>
//         </label>

//         {/* Search button */}
//         <div className="col-span-1 sm:col-span-2 md:col-span-1">
//           <button
//             onClick={onSearch}
//             className="w-full inline-flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
//           >
//             <Search className="w-4 h-4" />
//             Search
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { MapPin, Calendar, Users, Search } from "lucide-react";

// export default function SearchBar({
//   location, setLocation,
//   checkIn, setCheckIn,
//   checkOut, setCheckOut,
//   guests, setGuests,
//   onSearch
// }) {
//   const today = new Date().toISOString().split('T')[0];
// return (
//   <div className="md:w-full">
//     <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
//       {/* Location */}
//       <label className="col-span-1 sm:col-span-2 md:col-span-2">
//         <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
//           <MapPin className="w-5 h-5 text-[#0D9488]" />
//           <input
//             value={location}
//             onChange={(e) => setLocation(e.target.value)}
//             placeholder="Location"
//             className="md:w-full text-sm placeholder:text-[#94A3B8] outline-none"
//           />
//         </div>
//       </label>

//       {/* Check-in */}
//       <label className="col-span-1">
//         <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
//           <Calendar className="w-5 h-5 text-[#0D9488]" />
//           <input
//             value={checkIn}
//             onChange={(e) => setCheckIn(e.target.value)}
//             placeholder="dd-mm-yyyy"
//             inputMode="numeric"
//             className="md:w-full text-sm placeholder:text-[#94A3B8] outline-none"
//           />
//         </div>
//       </label>

//       {/* Check-out */}
//       <label className="col-span-1">
//         <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
//           <Calendar className="w-5 h-5 text-[#0D9488]" />
//           <input
//             value={checkOut}
//             onChange={(e) => setCheckOut(e.target.value)}
//             placeholder="dd-mm-yyyy"
//             inputMode="numeric"
//             className="md:w-full text-sm placeholder:text-[#94A3B8] outline-none"
//           />
//         </div>
//       </label>

//       {/* Guests */}
//       <label className="col-span-1 sm:col-span-1">
//         <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
//           <Users className="w-5 h-5 text-[#0D9488]" />
//           <input
//             value={guests}
//             onChange={(e) => setGuests(Number(e.target.value || 1))}
//             placeholder="1"
//             inputMode="numeric"
//             className="md:w-full text-sm placeholder:text-[#94A3B8] outline-none"
//           />
//         </div>
//       </label>
//     </div>
//     {/* Search */}
//       <div className="col-span-1 sm:col-span-2 md:col-span-1 mt-5">
//         <button
//           onClick={onSearch}
//           className="flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md transition"
//         >
//           <Search className="w-5 h-5" />
//           Search
//         </button>
//       </div>
//   </div>
// );

//   return (
//   <div className="w-full">
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       {/* Location */}
//       <label className="w-full">
//         <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
//           <MapPin className="w-5 h-5 text-[#0D9488]" />
//           <input
//             value={location}
//             onChange={(e) => setLocation(e.target.value)}
//             placeholder="Location"
//             className="w-full text-sm placeholder:text-[#94A3B8] outline-none text-gray-600"
//           />
//         </div>
//       </label>

//       {/* Check-in */}
//       <label className="w-full">
//         <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
//           <Calendar className="w-5 h-5 text-[#0D9488]" />
//           <input
//             value={checkIn}
//             type="date"
//             min={today} // ✅ Prevent past check-in
//             onChange={(e) => setCheckIn(e.target.value)}
//             placeholder="dd-mm-yyyy"
//             inputMode="numeric"
//             className="w-full text-sm placeholder:text-[#94A3B8] outline-none text-gray-500"
//           />
//         </div>
//       </label>

//       {/* Check-out */}
//       <label className="w-full">
//         <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
//           <Calendar className="w-5 h-5 text-[#0D9488]" />
//           <input
//             value={checkOut}
//             type="date"
//             min={checkIn || today} // ✅ Prevent check-out before check-in
//             onChange={(e) => setCheckOut(e.target.value)}
//             placeholder="dd-mm-yyyy"
//             inputMode="numeric"
//             className="w-full text-sm placeholder:text-[#94A3B8] outline-none text-gray-600"
//           />
//         </div>
//       </label>

//       {/* Guests */}
//       <label className="w-full">
//         <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
//           <Users className="w-5 h-5 text-[#0D9488]" />
//           <input
//             value={guests}
//             onChange={(e) => setGuests(Number(e.target.value || 1))}
//             placeholder="1"
//             inputMode="numeric"
//             className="w-full text-sm placeholder:text-[#94A3B8] outline-none text-gray-500"
//           />
//         </div>
//       </label>
//     </div>

//     {/* Search Button - Full width below form */}
//     <div className="mt-5">
//       <button
//         onClick={onSearch}
//         className="w-full flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md transition cursor-pointer"
//       >
//         <Search className="w-5 h-5" />
//         Search
//       </button>
//     </div>
//   </div>
// );

// return (
//   <div className="w-full bg-white rounded-xl p-4 shadow-md">
//     <div className="flex flex-col md:flex-row md:items-center gap-4">
//       {/* Location */}
//       <div className="flex-1 flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
//         <MapPin className="w-5 h-5 text-[#0D9488]" />
//         <input
//           type="text"
//           value={location}
//           onChange={(e) => setLocation(e.target.value)}
//           placeholder="Location"
//           className="w-full text-sm text-gray-600 placeholder:text-gray-400 outline-none"
//         />
//       </div>

//       {/* Check-In */}
//       <div className="flex-1 flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
//         <Calendar className="w-5 h-5 text-[#0D9488]" />
//         <input
//           type="date"
//           value={checkIn}
//           min={today}
//           onChange={(e) => setCheckIn(e.target.value)}
//           className="w-full text-sm text-gray-600 placeholder:text-gray-400 outline-none"
//         />
//       </div>

//       {/* Check-Out */}
//       <div className="flex-1 flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
//         <Calendar className="w-5 h-5 text-[#0D9488]" />
//         <input
//           type="date"
//           value={checkOut}
//           min={checkIn || today}
//           onChange={(e) => setCheckOut(e.target.value)}
//           className="w-full text-sm text-gray-600 placeholder:text-gray-400 outline-none"
//         />
//       </div>

//       {/* Guests */}
//       <div className="flex-1 flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0D9488]">
//         <Users className="w-5 h-5 text-[#0D9488]" />
//         <input
//           type="number"
//           value={guests}
//           min={1}
//           onChange={(e) => setGuests(Number(e.target.value))}
//           placeholder="1"
//           className="w-full text-sm text-gray-600 placeholder:text-gray-400 outline-none"
//         />
//       </div>

//       {/* Search Button */}
//       <button
//         onClick={onSearch}
//         className="mt-2 md:mt-0 md:ml-4 px-4 py-2 bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-xl text-sm font-medium shadow-md transition w-full md:w-auto"
//       >
//         <div className="flex items-center gap-2 justify-center">
//           <Search className="w-5 h-5" />
//           Search
//         </div>
//       </button>
//     </div>
//   </div>
// );

// }
