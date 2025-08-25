import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { eachDayOfInterval } from "date-fns";
import Spinner from "./common/Spinner";
import { Check, Minus, X, CalendarRange } from "lucide-react";

// Local date parser (avoids UTC shift)
const parse = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Local date formatter → YYYY-MM-DD
const fmtDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const todayStr = fmtDate(new Date());
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AvailabilityBar = ({ hotelId, initialCalendar, roomsAvailability }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [startDate, setStartDate] = useState(searchParams.get("checkIn") || "");
  const [endDate, setEndDate] = useState(searchParams.get("checkOut") || "");
  const [guests, setGuests] = useState(searchParams.get("guests") || "");
  const [loading, setLoading] = useState(false);
  const [perDate, setPerDate] = useState(initialCalendar?.perDate || []);
  const [summary, setSummary] = useState(initialCalendar?.summary || null);

  const hasRange = startDate && endDate;

  useEffect(() => {
    setStartDate(searchParams.get("checkIn") || "");
    setEndDate(searchParams.get("checkOut") || "");
    setGuests(searchParams.get("guests") || "");
  }, [searchParams]);

  useEffect(() => {
    if (initialCalendar?.summary) {
      setSummary(initialCalendar.summary);
      return;
    }
    if (!hasRange || !roomsAvailability?.length) return;

    const s = parse(startDate);
    const e = parse(endDate);
    const rangeDates = eachDayOfInterval({
      start: s,
      end: new Date(e.getTime() - 86400000),
    }).map(fmtDate);

    const availableCount = roomsAvailability.filter((room) => {
      const booked = room.availability
        ?.filter((d) => d.bookedRooms >= d.totalRooms)
        .map((d) => d.date) || [];
      return rangeDates.every((d) => !booked.includes(d));
    }).length;

    setSummary({ available: availableCount, total: roomsAvailability.length });
  }, [initialCalendar, roomsAvailability, hasRange, startDate, endDate]);

  const check = async () => {
    if (!hasRange || !guests) return toast.error("Please select valid dates and guests");
    if (new Date(startDate) >= new Date(endDate)) {
      return toast.error("Check-out must be after check-in");
    }

    setSearchParams({ checkIn: startDate, checkOut: endDate, guests }, { replace: true });

    setLoading(true);
    try {
      const { data } = await api.get("/availability", {
        params: { hotelId, startDate, endDate },
      });
      setSummary(data.summary || null);
      setPerDate(data.perDate || []);
    } catch {
      toast.error("Failed to check availability");
    } finally {
      setLoading(false);
    }
  };

  const onDayClick = (dateStr) => {
    if (dateStr < todayStr) return;
    if (!startDate || endDate) {
      setStartDate(dateStr);
      setEndDate("");
      setSummary(null);
    } else if (new Date(dateStr) < new Date(startDate)) {
      setStartDate(dateStr);
      setSummary(null);
    } else {
      setEndDate(dateStr);
      setTimeout(check, 0);
    }
  };

  const calendar = useMemo(() => {
    if (!perDate.length) return null;
    const first = perDate[0].date ? parse(perDate[0].date) : null;
    if (!first) return null;

    const dayIndex = (first.getDay() + 6) % 7;
    const blanks = Array.from({ length: dayIndex }, (_, i) => ({
      key: `blank-${i}`,
      blank: true,
    }));
    const tiles = perDate.map((d) => ({ key: d.date, ...d, blank: false }));
    return [...blanks, ...tiles];
  }, [perDate]);

  const rangeFlags = useMemo(() => {
    const s = parse(startDate);
    const e = parse(endDate);
    return {
      isInRange: (d) => s && e && parse(d) >= s && parse(d) < e,
      isStart: (d) => d === startDate,
      isEnd: (d) => d === endDate,
    };
  }, [startDate, endDate]);

  return (
    <div className="bg-white p-4 rounded shadow flex flex-col gap-3">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Check-in</label>
          <input
            type="date"
            value={startDate}
            min={todayStr}
            onChange={(e) => {
              setStartDate(e.target.value);
              setSummary(null);
            }}
            className="border-2 border-gray-400 caret-[#0D9488] cursor-pointer  focus:outline-none rounded px-3 py-2 text-sm text-gray-700"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Check-out</label>
          <input
            type="date"
            value={endDate}
            min={startDate || todayStr}
            onChange={(e) => {
              setEndDate(e.target.value);
              setSummary(null);
            }}
            className="border-2 border-gray-400 caret-[#0D9488] cursor-pointer focus:outline-none rounded px-3 py-2 text-sm text-gray-700"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Guests</label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="border-2 border-gray-400 w-20 focus:outline-none rounded px-3 py-2 text-sm text-gray-700 caret-[#0D9488]"
          />
        </div>
        <button
          onClick={check}
          disabled={loading || !hasRange || !guests}
          className="bg-gradient-to-br from-[#0D9488] to-[#68b4ad] hover:bg-gradient-to-tl active:scale-105 text-white text-sm font-medium px-4 py-2 rounded cursor-pointer transition duration-400 "
        >
          {loading ? "Checking…" : "Check Availability"}
        </button>
        {summary && (
          <div className="text-sm text-gray-600 md:ml-auto cursor-pointer">
            <span className="font-semibold text-[#FB7185]">{summary.available}</span> of{" "}
            {summary.total} rooms available
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <Check className="w-4 h-4 text-green-500" /> All free
        </span>
        <span className="flex items-center gap-1">
          <Minus className="w-4 h-4 text-yellow-500" /> Partial
        </span>
        <span className="flex items-center gap-1">
          <X className="w-4 h-4 text-red-500" /> Fully booked
        </span>
        <span className="flex items-center gap-1">
          <CalendarRange className="w-4 h-4 text-[#0D9488]" /> Selected range
        </span>
      </div>

      {/* Calendar */}
      {loading ? (
        <Spinner />
      ) : calendar ? (
        <div className="grid grid-cols-7 gap-2 text-xs text-center">
          {weekdays.map((d) => (
            <div key={d} className="font-medium text-gray-600">
              {d}
            </div>
          ))}
          {calendar.map((tile) =>
            tile.blank ? (
              <div key={tile.key} className="py-1" />
            ) : tile.date < todayStr ? (
              <div
                key={tile.key}
                className="bg-gray-200 text-gray-400 rounded py-1 cursor-not-allowed"
              >
                {parse(tile.date).getDate()}
              </div>
            ) : (
              <button
                key={tile.key}
                onClick={() => onDayClick(tile.date)}
                className={`rounded py-1 cursor-pointer ${
                  rangeFlags.isInRange(tile.date) ||
                  rangeFlags.isStart(tile.date) ||
                  rangeFlags.isEnd(tile.date)
                    ? "ring-2 ring-[#0D9488]"
                    : ""
                } ${
                  tile.available === 0
                    ? "bg-red-400 text-white"
                    : tile.available === tile.total
                    ? "bg-green-400 text-black"
                    : "bg-yellow-300 text-black"
                }`}
              >
                {parse(tile.date).getDate()}
              </button>
            )
          )}
        </div>
      ) : (
        <div className="text-xs text-gray-500">
          Select check-in and check-out to view availability.
        </div>
      )}
    </div>
  );
};

export default AvailabilityBar;
