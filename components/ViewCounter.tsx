"use client";

import { useEffect, useState } from "react";

const formatViews = (num: number | null) => {
  if (num === null) return "...";
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toLocaleString();
};

export default function ViewCounter() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Fetch and increment views on mount
    fetch("/api/views")
      .then((res) => res.json())
      .then((data) => setViews(data.views))
      .catch(() => setViews(0));
  }, []);

  return (
    <div className="tui-view-counter">
      <svg
        className="w-3.5 h-3.5 mr-2 opacity-60"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span className="text-[10px] font-bold tracking-[0.1em]">
        {formatViews(views)}
      </span>
    </div>
  );
}
