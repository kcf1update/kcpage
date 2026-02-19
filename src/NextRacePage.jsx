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
    .replace(/[^a-z\s\-]/g, "")
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

export default function NextRacePage() {
  // Convenience: sessions in the order you defined in the content file
  const sessions = nextRaceContent.sessions || [];

  return (
    <div className="relative min-h-screen text-white">
      {/* Gray background overlay to match kcpage */}
      <div className="absolute inset-0 -z-10 bg-black/70" />

      {/* Foreground content */}
      <div className="next-race-page relative z-10 mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-1 sm:pt-4 pb-8 lg:px-8">
        {/* ✅ TOP CARD FIRST (full width across) */}
        <TopCard>
          <TopCard.Header
            title="Race Centre"
            subtitle="Schedule, weather, and session results."
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

        {/* ✅ NAV UNDER TOP CARD */}
        <div className="mt-1 flex items-center justify-between gap-4">
          <PageNav />
          <div className="shrink-0">{/* language selector hidden for launch */}</div>
        </div>

        <div className="-mt-3">
          <AdBar />
        </div>

        {/* Top row: race info + weather */}
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

                {/* ✅ Track Info link (only shows if you set trackInfoUrl in content) */}
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
                      Check out the next track
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

        {/* Results per session */}
        <section className="space-y-6">
          {sessions.map((session, idx) => {
            // ✅ If paste exists, build results array from it; otherwise use results[]
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

            const leader = rows.find(
              (r) => Number.isFinite(r.ms) && r.ms !== Number.POSITIVE_INFINITY
            );
            const leaderMs = leader ? leader.ms : null;

            return (
              <article
                key={session.id || idx}
                className="card-green rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur"
              >
                <header className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">
                    {session.label || `Session ${idx + 1}`}
                  </h2>
                  <p className="text-[11px] text-gray-300"></p>
                </header>

                <div className="max-h-72 overflow-auto pr-1 text-xs sm:text-sm">
                  <table className="min-w-full border-separate border-spacing-y-1">
                    <thead className="text-[11px] uppercase tracking-wide text-gray-300">
                      <tr>
                        <th className="px-2 py-1 text-left">Driver</th>
                        <th className="px-2 py-1 text-left">Result</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row) => {
                        const gap =
                          leaderMs != null &&
                          Number.isFinite(row.ms) &&
                          row.ms !== Number.POSITIVE_INFINITY
                            ? formatGapMs(row.ms - leaderMs)
                            : "";

                        return (
                          <tr key={row.driver} className="align-middle">
                            <td className="px-2 py-1">
                              <span className="inline-flex rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium">
                                {row.driver}
                              </span>
                            </td>

                            <td className="px-2 py-1">
                              <div className="w-full rounded-full border border-white/10 bg-black/50 px-2 py-1 text-xs">
                                {row.result}
                                {gap ? <span className="ml-2 opacity-70">{gap}</span> : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
