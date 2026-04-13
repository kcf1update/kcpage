// src/components/PageNav.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

// Keep nav items lean for mobile
const NAV_ITEMS = [
  { key: "navHome", label: "Home", to: "/" },
  { key: "navF1News", label: "More News", to: "/news" },
  { key: "navRaceCentre", label: "Race Centre", to: "/next-race" },
    { key: "navYouTube", label: "YouTube", to: "/youtube" },
  { key: "navComments", label: "Discuss", to: "/comments" },
];

export default function PageNav() {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto max-w-6xl w-full overflow-x-auto no-scrollbar">
      {/* ONE ROW, NEVER WRAP — scrolls horizontally on mobile if needed */}
      <nav className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap pb-1 min-w-max [-webkit-overflow-scrolling:touch]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
         

          return (
           <Link
  key={item.key}
  to={item.to}
  className={[
    "shrink-0 rounded-full px-3 sm:px-4 py-2 text-[11px] sm:text-sm font-medium transition",
    "backdrop-blur border text-white hover:bg-black/50",

    // Normal buttons
    "border-white/15 bg-black/35",

    

    // Active page highlight (NEW)
active &&
  "bg-cyan-400/20 border-cyan-300 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.35)]",
  ].join(" ")}
>
  {item.label}
</Link>
          );
        })}

        {/* TEMPORARILY HIDDEN — restore later */}
        {false && (
          <a
            href="https://www.instagram.com/kcf1update"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full px-3 sm:px-4 py-2 text-[11px] sm:text-sm font-semibold transition backdrop-blur border border-white/15 bg-black/35 text-pink-400 hover:bg-black/50"
            title="Instagram"
          >
            Instagram
          </a>
        )}
      </nav>
    </div>
  );
}