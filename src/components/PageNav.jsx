// src/components/PageNav.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

// No "Home" here (per your request)
const NAV_ITEMS = [
  { key: "navPoints", fallback: "Points", to: "/points" },
  { key: "navNextRace", fallback: "Race Centre", to: "/next-race" },

  { key: "navF1News", fallback: "F1 News", to: "/news" },
  { key: "navYouTube", fallback: "YouTube", to: "/youtube" },
  {
    key: "navComments",
    fallback: "Join the F1 Discussion",
    to: "/comments",
  },
];

export default function PageNav() {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto max-w-6xl w-full">
      <nav className="flex flex-wrap items-center justify-start gap-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          const isComments = item.to === "/comments";

          // Translations removed — always use fallback label
          const label = item.fallback;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                "rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition",
                "backdrop-blur",

                // COMMENTS = BLUE
                isComments
                  ? "border border-cyan-400/70 bg-cyan-500/20 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.55)] hover:bg-cyan-500/30"
                  : "border border-white/15 bg-black/35 text-white hover:bg-black/50",

                // active page override (keeps it visible on any background)
                active &&
                  (isComments
                    ? "bg-cyan-500/35 border-cyan-300/90 text-white shadow-[0_0_22px_rgba(34,211,238,0.75)] ring-1 ring-cyan-200/60"
                    : "bg-black/70 border-white/40 text-white shadow-[0_0_18px_rgba(255,255,255,0.18)] ring-1 ring-white/25"),
              ].join(" ")}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
