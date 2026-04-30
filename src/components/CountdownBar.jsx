import { useEffect, useState } from "react";

export default function CountdownBar() {
  const getTimeRemaining = () => {
    const targetTime = new Date("2026-05-01T16:30:00Z").getTime();
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
    <div className="flex items-center justify-center gap-2 text-red-400 font-semibold">
      <img src="/flags/us.png" alt="United States flag" className="h-4 w-auto" />
     <span>MIAMI GRAND PRIX LIVE NOW</span>
    </div>
  );
}

  return (
  <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base text-white font-semibold">
    <img src="/flags/us.png" alt="United States flag" className="h-4 w-auto" />
    <span>MIAMI GRAND PRIX STARTS IN:</span>
    <span className="text-sky-300 text-sm sm:text-base md:text-lg">
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  </div>
);
}