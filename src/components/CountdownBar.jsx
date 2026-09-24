import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function CountdownBar() {
  const getTimeRemaining = () => {
    const targetTime = new Date("2026-09-24T05:30:00-03:00").getTime();
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

  const weekendStarted = timeLeft.total <= 0;

  return (
    <section
  className="relative overflow-hidden rounded-2xl border border-red-500/60 px-3 py-3 shadow-[0_0_18px_rgba(225,6,0,0.20)] sm:px-5 sm:py-4"
  style={{
    background:
  "linear-gradient(105deg, #ffffff 0%, #ffffff 30%, #f2f2f2 42%, #e10600 78%, #b00000 100%)",
  }}
>

     <div className="grid w-full grid-cols-[1.4fr_0.9fr_0.7fr] items-center gap-1.5 sm:grid-cols-[1.2fr_1fr_0.8fr] sm:gap-4">

        {/* RACE NAME */}
        <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
  <span className="text-[9px] font-extrabold text-black sm:text-base lg:text-lg">
    AZERBAIJAN GRAND PRIX
  </span>

  <img
    src="/flags/az.png"
    alt="Azerbaijan flag"
    className="h-2.5 w-auto shrink-0 sm:h-4 lg:h-5"
  />
</div>

        {/* COUNTDOWN / LIVE MESSAGE */}
        <div className="min-w-0 flex items-center justify-center -translate-x-3 sm:translate-x-0">
  {weekendStarted ? (
    <span className="text-[10px] font-bold uppercase tracking-wide text-black sm:text-xs lg:text-sm">
      RACE WEEKEND UNDERWAY • FOLLOW THE WEEKEND IN RACE CENTRE
    </span>
  ) : (
    <span className="whitespace-nowrap text-[10px] font-extrabold leading-none text-black sm:text-sm lg:text-base">
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </span>
  )}
</div>

        {/* RACE CENTRE */}
        <div className="flex justify-end">
          <Link
            to="/racecenter"
            className="whitespace-nowrap rounded-full border border-white/80 bg-black/15 px-2.5 py-1.5 text-[8px] font-bold text-white transition hover:bg-black/25 sm:px-4 sm:py-2 sm:text-xs"
          >
            {weekendStarted
              ? "RACE CENTRE / RESULTS →"
              : "RACE CENTRE →"}
          </Link>
        </div>

      </div>

    </section>
  );
}