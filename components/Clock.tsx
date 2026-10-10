"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Clock() {
  // null until mounted so server and first client render agree
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = now ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}` : "--:--:--";
  const date = now
    ? now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }).toUpperCase()
    : "-- --- --";

  return (
    <div className="bio-clock" aria-label="local time">
      <span className="bio-clock-time">{time}</span>
      <span className="bio-clock-sep">·</span>
      <span className="bio-clock-date">{date}</span>
    </div>
  );
}
