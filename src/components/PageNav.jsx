// src/components/PageNav.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

// Keep nav items lean for mobile
const NAV_ITEMS = [
  { key: "navPoints", label: "Points", to: "/points" },
  { key: "navRaceCentre", label: "Race Centre", to: "/next-race" },
  { key: "navF1News", label: "F1 News", to: "/news" },
  { key: "navYouTube", label: "YouTube", to: "/youtube" },
  { key: "navComments", label: "Comment", to: "/comments" },
];

export default function PageNav() {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto max-w-6xl w-full">
      {/* ONE ROW, NEVER WRAP — scrolls horizontally on mobile if needed */}
      <nav className="flex flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 [-webkit-overflow-scrolling:touch]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;

          return (
            <Link
              key={item.key}
              to={item.to}
              className={[
                "shrink-0 rounded-full px-3 sm:px-4 py-2 text-[11px] sm:text-sm font-medium transition",
                "backdrop-blur border border-white/15 bg-black/35 text-white hover:bg-black/50",
                active &&
                  "bg-black/70 border-white/40 text-white shadow-[0_0_18px_rgba(255,255,255,0.18)] ring-1 ring-white/25",
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
