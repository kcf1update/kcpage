import React from "react";
import { Link } from "react-router-dom";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="relative mb-2">
      <div className="flex items-center justify-between">
        
        {/* Car Banner */}
        <div className="relative w-[88%] max-w-6xl h-20 sm:h-24 md:h-28 overflow-hidden bg-white">
          <img
            src="/flags/ca.png"
            alt="Canada flag"
            className="absolute top-2 right-2 h-5 w-auto z-10 opacity-90"
          />

          <img
            src="/img/kcs-f1-car.png"
            alt="KC's F1 Worldwide Update car"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="ml-3 flex h-20 sm:h-24 md:h-28 w-16 md:w-24 lg:w-28 flex-col justify-center gap-3 rounded-xl border-2 border-cyan-400 bg-black/30 px-3"
          aria-label="Open navigation menu"
        >
          <span className="block h-[5px] w-full rounded bg-cyan-300"></span>
          <span className="block h-[5px] w-full rounded bg-cyan-300"></span>
          <span className="block h-[5px] w-full rounded bg-cyan-300"></span>
          <span className="block h-[5px] w-full rounded bg-cyan-300"></span>
        </button>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border-2 border-cyan-400 bg-black/95 p-4 shadow-[0_0_20px_rgba(34,211,238,0.45)]">
          <div className="flex flex-col gap-3 text-base font-semibold text-cyan-300">
            <Link onClick={() => setMenuOpen(false)} to="/">Home</Link>
            <Link onClick={() => setMenuOpen(false)} to="/news">More News</Link>
            <Link
  onClick={() => setMenuOpen(false)}
  to="/next-race"
  className="text-cyan-200 font-extrabold drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]"
>
  Race Centre
</Link>
            <Link onClick={() => setMenuOpen(false)} to="/youtube">YouTube</Link>
          </div>
        </div>
      )}
    </div>
  );
}