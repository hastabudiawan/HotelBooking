"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { addDays, todayInJakarta } from "@/lib/format";

const fieldClass =
  "mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-2 focus:outline-brand/30";

export function SearchBox() {
  // Kosong saat render di server supaya tidak berbeda dengan browser.
  const [today, setToday] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  //   useEffect(() => {
  //     const now = todayInJakarta();
  //     setToday(now);
  //     setCheckIn(addDays(now, 1));
  //     setCheckOut(addDays(now, 2));
  //   }, []);

  useEffect(() => {
    const now = todayInJakarta();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(now);
    setCheckIn(addDays(now, 1));
    setCheckOut(addDays(now, 2));
  }, []);

  function onCheckInChange(value: string) {
    setCheckIn(value);
    // Check-out harus minimal sehari setelah check-in.
    if (value && (!checkOut || checkOut <= value)) {
      setCheckOut(addDays(value, 1));
    }
  }

  return (
    <form
      action="/rooms"
      method="get"
      className="grid gap-4 rounded-lg bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.7fr_auto] lg:items-end"
    >
      <label className="block text-sm font-semibold">
        Check-in
        <input
          type="date"
          name="checkIn"
          required
          min={today || undefined}
          value={checkIn}
          onChange={(event) => onCheckInChange(event.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-semibold">
        Check-out
        <input
          type="date"
          name="checkOut"
          required
          min={checkIn ? addDays(checkIn, 1) : undefined}
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-semibold">
        Guests
        <select name="guests" defaultValue="2" className={fieldClass}>
          {[1, 2, 3, 4, 5, 6].map((count) => (
            <option key={count} value={count}>
              {count} {count === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit" className="w-full sm:col-span-2 lg:col-span-1">
        Check availability
      </Button>
    </form>
  );
}
