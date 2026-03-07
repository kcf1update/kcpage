// src/components/PageNav.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

// Keep nav items lean for mobile
const NAV_ITEMS = [
  { key: "navHome", label: "Home", to: "/" },
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
          const isRaceCentre = item.key === "navRaceCentre";

          return (
            <Link
              key={item.key}
              to={item.to}
              className={[
                "shrink-0 rounded-full px-3 sm:px-4 py-2 text-[11px] sm:text-sm font-medium transition",
                "backdrop-blur border text-white hover:bg-black/50",

                // Normal buttons
                !isRaceCentre && "border-white/15 bg-black/35",

                // Race Centre button — faded checkered flag look with blue text
                isRaceCentre &&
                  "border-white/30 text-sky-300 shadow-[0_0_10px_rgba(255,255,255,0.15)]",

                // Active page highlight (unchanged)
                active &&
                  "bg-black/70 border-white/40 shadow-[0_0_18px_rgba(255,255,255,0.18)] ring-1 ring-white/25",
              ].join(" ")}
              style={
                isRaceCentre
                  ? {
                      backgroundImage:
                        "linear-gradient(45deg,rgba(255,255,255,0.18) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.18) 50%,rgba(255,255,255,0.18) 75%,transparent 75%,transparent 100%)",
                      backgroundSize: "10px 10px",
                      backgroundColor: "#1f2937",
                    }
                  : {}
              }
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