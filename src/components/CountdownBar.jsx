import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
export default function CountdownBar() {
  const getTimeRemaining = () => {
    const targetTime = new Date("2026-05-22T16:30:00Z").getTime();
    const now = Date.now();
    const total = targetTime - now;

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { total, days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (timeLeft.total <= 0) {
  return (
    <Link
      to="/next-race"
      className="inline-flex items-center justify-center gap-2 rounded-full border border-red-400/70 bg-red-500/10 px-3 py-1.5 text-xs sm:text-sm font-bold text-red-300 shadow-[0_0_10px_rgba(248,113,113,0.35)] transition hover:border-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200"
      title="Go to Race Centre"
    >
      <img src="/flags/us.png" alt="United States flag" className="h-4 w-auto" />
      <span>CANADIAN GRAND PRIX LIVE NOW</span>
      <span className="text-cyan-300">Race Centre ↗</span>
    </Link>
  );
}

  return (
  <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base text-white font-semibold">
    <img src="/flags/ca.png" alt="Canada flag" className="h-4 w-auto" />
    <span>CANADIAN GRAND PRIX STARTS IN:</span>
    <span className="text-sky-300 text-sm sm:text-base md:text-lg">
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  </div>
);
}