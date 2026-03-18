import { useEffect, useState } from "react";

export default function CountdownBar() {
  const getTimeRemaining = () => {
    const targetTime = new Date("2026-03-27T02:30:00Z").getTime();
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
      <div className="text-center text-red-400 font-semibold">
        🇯🇵 JAPANESE GRAND PRIX LIVE NOW
      </div>
    );
  }

  return (
  <div className="flex items-center justify-center gap-2 text-white font-semibold">
    <img src="/flags/jp.png" alt="Japan flag" className="h-4 w-auto" />
    <span>JAPANESE GRAND PRIX STARTS IN:</span>
    <span className="text-sky-300">
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  </div>
);
}