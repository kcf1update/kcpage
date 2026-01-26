import React from "react";
import { Link, useLocation } from "react-router-dom";
import { getTranslations } from "../translations";
import useLocalStorageState from "./useLocalStorageState";

// No "Home" here (per your request)
const NAV_ITEMS = [
  { key: "navPoints", fallback: "Points", to: "/points" },
  { key: "navNextRace", fallback: "Next Race Info", to: "/next-race" },
  { key: "navF1News", fallback: "F1 News", to: "/news" },
{ key: "navYouTube", fallback: "YouTube", to: "/youtube" },
  { key: "navComments", fallback: "Comments", to: "/comments" },
];

export default function PageNav() {
  const { pathname } = useLocation();

  // Always read the same lang value the selector writes
  const [lang] = useLocalStorageState("lang", "en");

  // IMPORTANT: translations.js must support the override (Step B)
  const uiText = getTranslations(lang);

  return (
    <div className="mx-auto max-w-6xl w-full">
      <nav className="flex flex-wrap items-center justify-start gap-2">

        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
const isComments = item.to === "/comments";

          const label = uiText?.[item.key] || item.fallback;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
  "rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition",

  // base style
  "backdrop-blur",

  // COMMENTS = BLUE
  isComments
    ? "border border-cyan-400/70 bg-cyan-500/20 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.55)] hover:bg-cyan-500/30"
    : "border border-white/15 bg-black/35 text-white hover:bg-black/50",

  // active page override
  active && "bg-white text-slate-900 border-white/40 shadow-none",
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
