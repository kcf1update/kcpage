import React from "react";
import { Link } from "react-router-dom";

import AdBar from "./AdBar.jsx";
import TopCard from "./components/TopCard";
import PageNav from "./components/PageNav";

import { nextRaceContent, NEXT_RACE_DRIVERS } from "./content/nextRaceContent";

// --- Helpers: parse "1m33.459s" (and a couple other formats) into ms ---
function extractLapMs(result) {
  if (!result) return Number.POSITIVE_INFINITY;

  const s = String(result).trim().toLowerCase();
  if (!s || s === "-" || s === "—") return Number.POSITIVE_INFINITY;
  if (s.includes("did not run") || s.includes("dns") || s.includes("dnf")) {
    return Number.POSITIVE_INFINITY;
  }

  // Your format: "1m33.459s"
  const m = s.match(/(\d+)\s*m\s*(\d+(?:\.\d+)?)\s*s/);
  if (m) {
    const minutes = parseInt(m[1], 10);
    const seconds = parseFloat(m[2]);
    if (!Number.isNaN(minutes) && !Number.isNaN(seconds)) {
      return Math.round((minutes * 60 + seconds) * 1000);
    }
  }

  // Support: "1:33.459"
  const c = s.match(/(\d+)\s*:\s*(\d+(?:\.\d+)?)/);
  if (c) {
    const minutes = parseInt(c[1], 10);
    const seconds = parseFloat(c[2]);
    if (!Number.isNaN(minutes) && !Number.isNaN(seconds)) {
      return Math.round((minutes * 60 + seconds) * 1000);
    }
  }

  // Support: "33.459" or "33.459s"
  const sec = s.match(/(\d+(?:\.\d+)?)(?:\s*s)?/);
  if (sec) {
    const seconds = parseFloat(sec[1]);
    if (!Number.isNaN(seconds)) return Math.round(seconds * 1000);
  }

  return Number.POSITIVE_INFINITY;
}

function formatGapMs(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "";
  return `+${(ms / 1000).toFixed(3)}s`;
}

// --- Paste-sheet parsing helpers (full names, any order) ---
const DRIVER_ALIASES = {
  // timing sheet name -> official name in NEXT_RACE_DRIVERS
  "ollie bearman": "Ollie Bearman",
  "oliver bearman": "Ollie Bearman",

  "alex albon": "Alex Albon",
  "alexander albon": "Alex Albon",
};

function normalizeName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveDriverIndex(line, drivers) {
  const normLine = normalizeName(line);

  // Check aliases first (handles Oliver/Ollie and Alexander/Alex)
  for (const alias in DRIVER_ALIASES) {
    if (normLine.includes(alias)) {
      const realName = DRIVER_ALIASES[alias];
      return drivers.indexOf(realName);
    }
  }

  // Fallback: match official driver names directly
  for (let i = 0; i < drivers.length; i++) {
    if (normLine.includes(normalizeName(drivers[i]))) return i;
  }

  return -1;
}

function buildResultsFromPaste(pasteText, drivers) {
  const out = Array(drivers.length).fill("");
  const raw = String(pasteText || "").trim();
  if (!raw) return out;

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const lower = line.toLowerCase();

    const idx = resolveDriverIndex(line, drivers);
    if (idx === -1) continue;

    const hasDidNotRun =
      lower.includes("did not run") || lower.includes("dns") || lower.includes("dnf");

    // Find a lap time on the line (supports 1m33.459s or 1:33.459)
    const timeMatch =
      lower.match(/\d+\s*m\s*\d+(?:\.\d+)?\s*s/) || lower.match(/\d+\s*:\s*\d+(?:\.\d+)?/);

    if (hasDidNotRun && !timeMatch) {
      out[idx] = "did not run";
      continue;
    }

    if (timeMatch) {
      // store just the matched time, clean spacing
      out[idx] = timeMatch[0].replace(/\s+/g, "");
    } else {
      // fallback: keep whatever was pasted
      out[idx] = line;
    }
  }

  return out;
}

/**
 * PREVIEW: Driver meta (flag + number)
 * - This is a simple mapping so you can see the UI layout.
 * - Fill it in over time. Missing values will gracefully fall back.
 */
const DRIVER_META = {
  "Alex Albon": { number: 23, flag: "🇹🇭" },
  "Carlos Sainz": { number: 55, flag: "🇪🇸" },
  "Charles Leclerc": { number: 16, flag: "🇲🇨" },
  "Esteban Ocon": { number: 31, flag: "🇫🇷" },
  "Fernando Alonso": { number: 14, flag: "🇪🇸" },
  "Ollie Bearman": { number: 87, flag: "🇬🇧" },
  // Add the rest whenever you want
};

function DriverPill({ name }) {
  const meta = DRIVER_META[name] || {};
  const flag = meta.flag || "🏁";
  const number = meta.number != null ? String(meta.number) : "—";

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium">
      <span className="text-sm leading-none">{flag}</span>
      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-black/40 px-2 py-[2px] text-[10px] border border-white/10">
        {number}
      </span>
      <span>{name}</span>
    </span>
  );
}

/**
 * PREVIEW: manual race results (you’ll edit this after race day)
 * - position drives sorting (1,2,3…)
 * - you can add status like "DNF" later if you want
 */
const MOCK_RACE_RESULTS = [
  // Example entries (edit anytime)
  { driver: "Charles Leclerc", position: 2 },
  { driver: "Fernando Alonso", position: 6 },
  { driver: "Alex Albon", position: 10 },
  { driver: "Carlos Sainz", position: 3 },
  { driver: "Esteban Ocon", position: 7 },
  // If someone is missing, they just won’t appear
];

function RaceResultsCard({ title = "Race Results", results }) {
  const sorted = [...(results || [])]
    .filter((r) => r && typeof r.position === "number" && r.driver)
    .sort((a, b) => a.position - b.position);

  const podiumBg = (pos) => {
    if (pos === 1) return "bg-yellow-500/10 border-yellow-400/30";
    if (pos === 2) return "bg-gray-200/10 border-gray-200/30";
    if (pos === 3) return "bg-amber-700/10 border-amber-400/20";
    return "bg-black/40 border-white/10";
  };

  return (
    <article className="card-green rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur">
      <header className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-gray-300">
            Enter positions manually — it auto-sorts.
          </p>
        </div>
      </header>

      <div className="mt-3 max-h-[520px] overflow-auto pr-1">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-gray-200">
            No results entered yet.
            <div className="mt-1 text-xs text-gray-400">
              Add finishing order after race day.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((r) => (
              <div
                key={`${r.driver}-${r.position}`}
                className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 ${podiumBg(
                  r.position
                )}`}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/40 text-xs font-semibold">
                    {r.position}
                  </span>
                  <DriverPill name={r.driver} />
                </div>

                {/* Optional placeholder for points/time/status later */}
                <div className="text-xs text-gray-300">
                  {r.status ? (
                    <span className="rounded-full border border-white/10 bg-black/40 px-2 py-1">
                      {r.status}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function CompactSessionCard({ session, sessionIndex }) {
  // If paste exists, build results array from it; otherwise use results[]
  const computedResults =
    typeof session?.paste === "string" && session.paste.trim()
      ? buildResultsFromPaste(session.paste, NEXT_RACE_DRIVERS)
      : session?.results;

  // Build rows using computed results, then sort by lap time (ms)
  const rows = NEXT_RACE_DRIVERS.map((driver, driverIdx) => {
    const result = Array.isArray(computedResults)
      ? computedResults[driverIdx] || ""
      : computedResults?.[driver] || "";
    const ms = extractLapMs(result);
    return { driver, result, ms };
  });

  rows.sort((a, b) => {
    if (a.ms !== b.ms) return a.ms - b.ms;
    return a.driver.localeCompare(b.driver);
  });

  const leader = rows.find((r) => Number.isFinite(r.ms) && r.ms !== Number.POSITIVE_INFINITY);
  const leaderMs = leader ? leader.ms : null;

  return (
    <article className="card-green rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur">
      <header className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-semibold">
          {session.label || `Session ${sessionIndex + 1}`}
        </h2>
        {session.time ? (
          <div className="text-[11px] text-gray-300">
            <span className="mr-2 uppercase tracking-[0.2em]">Time</span>
            <span className="rounded-full border border-white/10 bg-black/40 px-2 py-1">
              {session.time}
            </span>
          </div>
        ) : null}
      </header>

      {/* Compact, timing-screen style list */}
      <div className="max-h-64 overflow-auto pr-1">
        <div className="space-y-1">
          {rows.map((row, i) => {
            const gap =
              leaderMs != null &&
              Number.isFinite(row.ms) &&
              row.ms !== Number.POSITIVE_INFINITY
                ? formatGapMs(row.ms - leaderMs)
                : "";

            return (
              <div
                key={row.driver}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-2 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-black/40 text-[10px] text-gray-200">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <DriverPill name={row.driver} />
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="rounded-full border border-white/10 bg-black/50 px-2 py-1 text-[11px] sm:text-xs">
                    {row.result || "—"}
                    {gap ? <span className="ml-2 opacity-70">{gap}</span> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export default function NextRacePage() {
  const sessions = nextRaceContent.sessions || [];

  return (
    <div className="relative min-h-screen text-white">
      {/* Gray background overlay to match kcpage */}
      <div className="absolute inset-0 -z-10 bg-black/70" />

      {/* Foreground content */}
      <div className="next-race-page relative z-10 mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-1 sm:pt-4 pb-8 lg:px-8">
        {/* ✅ TOP CARD FIRST (unchanged) */}
        <TopCard>
          <TopCard.Header
            title="Race Centre"
            subtitle="Schedule, weather, and session results. "
            logoSrc="/img/kcs-f1-car.png"
            right={
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-red-600 bg-red-600 text-white px-4 py-1 text-xs sm:text-sm shadow-[0_0_18px_rgba(239,68,68,0.55)] hover:bg-red-700 transition"
              >
                <span className="text-lg leading-none">&larr;</span>
                <span>Back to home</span>
              </Link>
            }
          />
        </TopCard>

        {/* ✅ NAV UNDER TOP CARD (unchanged) */}
        <div className="mt-1 flex items-center justify-between gap-4">
          <PageNav />
          <div className="shrink-0">{/* language selector hidden for launch */}</div>
        </div>

        <div className="-mt-3">
          <AdBar />
        </div>

        {/* Top row: race info + weather (unchanged) */}
        <section className="grid gap-6 lg:grid-cols-3 mt-2">
          {/* Race & sessions card */}
          <article className="card-green lg:col-span-2 rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur">
            <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-300">
                    Race name
                  </p>
                  <div className="mt-1 w-full rounded-full border border-white/10 bg-black/50 px-3 py-1 text-sm">
                    {nextRaceContent.raceName || "—"}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-300">Dates</p>
                  <div className="mt-1 w-full rounded-full border border-white/10 bg-black/50 px-3 py-1 text-sm">
                    {nextRaceContent.raceDates || "—"}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-300">
                    Location
                  </p>
                  <div className="mt-1 w-full rounded-full border border-white/10 bg-black/50 px-3 py-1 text-sm">
                    {nextRaceContent.location || "—"}
                  </div>
                </div>

                {nextRaceContent.trackInfoUrl ? (
                  <div className="sm:pt-5">
                    <a
                      href={nextRaceContent.trackInfoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full
border border-sky-400/40
bg-sky-500/15
px-3 py-1 text-xs text-sky-300
hover:bg-sky-500/25 hover:text-sky-200
transition hover:shadow-[0_0_14px_rgba(56,189,248,0.6)]"
                      title="Open track information"
                    >
                      Check out the next race
                      <span className="text-[10px] text-gray-300">↗</span>
                    </a>
                  </div>
                ) : null}
              </div>
            </header>

            <div className="mt-2">
              <h2 className="text-sm font-semibold text-gray-100">
                Weekend Schedule (Atlantic Time)
              </h2>

              <div className="mt-2 space-y-2 text-sm">
                {sessions.map((session, idx) => (
                  <div
                    key={session.id || idx}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
                  >
                    <div className="text-sm font-medium">
                      {session.label || `Session ${idx + 1}`}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-gray-300">
                        Time
                      </span>
                      <div className="w-40 rounded-full border border-white/10 bg-black/50 px-2 py-1 text-right text-xs">
                        {session.time || "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Weather card */}
          <article className="card-green rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur">
            <h2 className="text-lg font-semibold">Weather</h2>
            <p className="mt-1 text-xs text-gray-300">
              Forecast notes for the race weekend.
            </p>

            <div className="mt-3 h-40 w-full whitespace-pre-line rounded-2xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-gray-100 overflow-auto">
              {nextRaceContent.weather || "—"}
            </div>
          </article>
        </section>

        {/* ✅ NEW: Split layout - Sessions (left) + Race Results (right) */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* LEFT: compact sessions */}
          <div className="lg:col-span-2 space-y-6">
            {sessions.map((session, idx) => (
              <CompactSessionCard
                key={session.id || idx}
                session={session}
                sessionIndex={idx}
              />
            ))}
          </div>

          {/* RIGHT: race results card */}
          <div className="lg:col-span-1">
            <RaceResultsCard results={MOCK_RACE_RESULTS} />
          </div>
        </section>
      </div>
    </div>
  );
}