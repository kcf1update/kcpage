// src/NextRacePage.jsx
import React, { useEffect } from "react";

import AdBar from "./AdBar.jsx";
import TopCard from "./components/TopCard";
import PageNav from "./components/PageNav";

import { nextRaceContent, NEXT_RACE_DRIVER_IDS } from "./content/nextRaceContent";
import { getDriverById } from "./content/drivers";

// ---------- time helpers ----------
function extractLapMs(result) {
  if (!result) return Number.POSITIVE_INFINITY;

  const s = String(result).trim().toLowerCase();
  if (!s || s === "-" || s === "—") return Number.POSITIVE_INFINITY;

  // treat these as "no valid lap time"
  if (s.includes("did not run") || s.includes("dns") || s.includes("dnf") || s.includes("dsq"))
    return Number.POSITIVE_INFINITY;

  // formats like "1m22.456s"
  const m = s.match(/(\d+)\s*m\s*(\d+(?:\.\d+)?)\s*s/);
  if (m) {
    const minutes = parseInt(m[1], 10);
    const seconds = parseFloat(m[2]);
    if (!Number.isNaN(minutes) && !Number.isNaN(seconds)) {
      return Math.round((minutes * 60 + seconds) * 1000);
    }
  }

  // formats like "1:22.456"
  const c = s.match(/(\d+)\s*:\s*(\d+(?:\.\d+)?)/);
  if (c) {
    const minutes = parseInt(c[1], 10);
    const seconds = parseFloat(c[2]);
    if (!Number.isNaN(minutes) && !Number.isNaN(seconds)) {
      return Math.round((minutes * 60 + seconds) * 1000);
    }
  }

  // formats like "82.456"
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

// ---------- UI bits ----------
function DriverPill({ driverId }) {
  const d = getDriverById(driverId);

  if (!d) {
    return (
      <span className="inline-flex rounded-full bg-white/10 px-2 py-1 text-[11px]">
        —
      </span>
    );
  }

  // flag images live in /public/flags/{countryCode}.png
  const flagSrc = d.countryCode ? `/flags/${String(d.countryCode).toLowerCase()}.png` : "";

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium">
      <span className="min-w-[28px] text-sky-200">#{d.number}</span>

      {flagSrc ? (
        <img
          src={flagSrc}
          alt={d.countryCode ? d.countryCode.toUpperCase() : ""}
          className="h-4 w-4 rounded-full border border-white/20 object-cover"
          loading="lazy"
        />
      ) : null}

      <span className="whitespace-nowrap">{d.name}</span>
    </span>
  );
}

function StatChip({ label, value, tone = "sky" }) {
  const toneMap = {
    sky: "border-sky-400/40 bg-sky-500/10 text-sky-100",
    amber: "border-amber-400/40 bg-amber-500/10 text-amber-100",
    green: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
    red: "border-red-400/40 bg-red-500/10 text-red-100",
  };
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs ${
        toneMap[tone] || toneMap.sky
      }`}
    >
      <span className="uppercase tracking-[0.18em] opacity-80">{label}</span>
      <span className="font-semibold">{value || "—"}</span>
    </div>
  );
}

function PodiumTiles({ podiumIds }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="mb-3 grid gap-2 sm:grid-cols-3">
      {podiumIds.map((id, i) => (
        <div
          key={id}
          className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
        >
          <div className="text-xs text-gray-300">{medals[i]} Podium</div>
          <div className="mt-1">
            <DriverPill driverId={id} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- summaries ----------
function computeSessionLapSummary(session) {
  const res = session?.results || {};

  const rows = NEXT_RACE_DRIVER_IDS.map((id) => {
    const r = res[id] || {};
    const lapTime = r.lapTime || "";
    const status = r.status || "";
    const laps = r.laps ?? "";
    const ms = extractLapMs(lapTime || status);
    return { id, lapTime, status, laps, ms };
  });

  rows.sort((a, b) => a.ms - b.ms);

  const fastest = rows.find((x) => x.ms !== Number.POSITIVE_INFINITY);
  const mostLaps = rows
    .filter((x) => Number.isFinite(Number(x.laps)))
    .sort((a, b) => Number(b.laps) - Number(a.laps))[0];

  return {
    fastestText: fastest
      ? `${getDriverById(fastest.id)?.name || fastest.id} ${fastest.lapTime || fastest.status || "—"}`
      : "—",
    mostLapsText: mostLaps
      ? `${getDriverById(mostLaps.id)?.name || mostLaps.id} (${mostLaps.laps})`
      : "—",
  };
}

function computeRaceSummary(session) {
  const res = session?.results || {};
  const rows = NEXT_RACE_DRIVER_IDS.map((id) => {
    const r = res[id] || {};
    return {
      id,
      pos: Number.isFinite(r.pos) ? r.pos : null,
      status: r.status || "",
    };
  });

  const classified = rows
    .filter((x) => Number.isFinite(x.pos))
    .sort((a, b) => a.pos - b.pos);

  const winner = classified[0];
  const podium = classified.slice(0, 3);

  const dnfs = rows.filter((x) => {
    const up = String(x.status).toUpperCase();
    return up.includes("DNF") || up.includes("DNS");
  }).length;

  return {
    winnerText: winner ? `${getDriverById(winner.id)?.name || winner.id}` : "—",
    podiumIds: podium.map((p) => p.id),
    dnfText: String(dnfs || 0),
  };
}

// ---------- tables ----------
function LapTimeTable({ session }) {
  const res = session?.results || {};

  const rows = NEXT_RACE_DRIVER_IDS.map((id) => {
    const r = res[id] || {};
    const lapTime = r.lapTime || "";
    const status = r.status || "";
    const laps = r.laps ?? "";
    const ms = extractLapMs(lapTime || status);
    return { id, lapTime, status, laps, ms };
  });

  rows.sort((a, b) => a.ms - b.ms);

  const leader = rows.find((x) => x.ms !== Number.POSITIVE_INFINITY);
  const leaderMs = leader ? leader.ms : null;

  const gapTone = (gapMs) => {
    if (!Number.isFinite(gapMs) || gapMs <= 0) return "text-sky-200/80";
    if (gapMs <= 250) return "text-emerald-300"; // <= 0.250s
    if (gapMs <= 750) return "text-amber-300";   // <= 0.750s
    return "text-red-300";                       // > 0.750s
  };

  return (
    <div className="max-h-[320px] overflow-auto pr-1 text-xs sm:text-sm">
      <table className="min-w-full border-separate border-spacing-y-1">
        <thead className="text-[11px] uppercase tracking-wide text-gray-300">
          <tr>
            <th className="px-2 py-1 text-left">Pos</th>
            <th className="px-2 py-1 text-left">Driver</th>
            <th className="px-2 py-1 text-left">Time</th>
            <th className="px-2 py-1 text-left">Laps</th>
            <th className="px-2 py-1 text-left">Gap</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => {
            const hasTime = row.ms !== Number.POSITIVE_INFINITY;
            const isLeader = hasTime && leader?.id === row.id;

            const gapMs =
              leaderMs != null && hasTime && !isLeader ? row.ms - leaderMs : null;

            const gap = gapMs != null ? formatGapMs(gapMs) : "";
            const timeCell = row.lapTime || row.status || "—";

            return (
              <tr
                key={row.id}
                className={`align-middle ${
                  isLeader ? "bg-white/5 ring-1 ring-emerald-400/30 rounded-2xl" : ""
                }`}
              >
                <td className="px-2 py-1 text-gray-300">{hasTime ? i + 1 : "—"}</td>

                <td className="px-2 py-1">
                  <DriverPill driverId={row.id} />
                </td>

                <td className="px-2 py-1">
                  <div className="rounded-full border border-white/10 bg-black/50 px-2 py-1">
                    {timeCell}
                  </div>
                </td>

                <td className="px-2 py-1 text-gray-100">
                  {row.laps !== "" ? row.laps : "—"}
                </td>

                <td className={`px-2 py-1 ${gapTone(gapMs)}`}>
                  {!hasTime ? "—" : isLeader ? "LEADER" : gap || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RaceTable({ session }) {
  const res = session?.results || {};
  const rows = NEXT_RACE_DRIVER_IDS.map((id) => {
    const r = res[id] || {};
    return {
      id,
      pos: Number.isFinite(r.pos) ? r.pos : null,
      status: r.status || "",
      grid: Number.isFinite(r.grid) ? r.grid : null,
      points: Number.isFinite(r.points) ? r.points : null,
    };
  });

  rows.sort((a, b) => {
    const aC = Number.isFinite(a.pos);
    const bC = Number.isFinite(b.pos);
    if (aC && bC) return a.pos - b.pos;
    if (aC) return -1;
    if (bC) return 1;
    return (getDriverById(a.id)?.name || a.id).localeCompare(
      getDriverById(b.id)?.name || b.id
    );
  });

  return (
    <div className="max-h-[520px] overflow-auto pr-1 text-xs sm:text-sm">
      <table className="min-w-full border-separate border-spacing-y-1">
        <thead className="text-[11px] uppercase tracking-wide text-gray-300">
          <tr>
            <th className="px-2 py-1 text-left">Pos</th>
            <th className="px-2 py-1 text-left">Driver</th>
            <th className="px-2 py-1 text-left">Time/Status</th>
            <th className="px-2 py-1 text-left">Grid</th>
            <th className="px-2 py-1 text-left">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="align-middle">
              <td className="px-2 py-1 text-gray-300">
                {Number.isFinite(row.pos) ? row.pos : "—"}
              </td>
              <td className="px-2 py-1">
                <DriverPill driverId={row.id} />
              </td>
              <td className="px-2 py-1">
                <div className="rounded-full border border-white/10 bg-black/50 px-2 py-1">
                  {row.status || "—"}
                </div>
              </td>
              <td className="px-2 py-1 text-gray-100">
                {Number.isFinite(row.grid) ? row.grid : "—"}
              </td>
              <td className="px-2 py-1">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 font-semibold">
                  {Number.isFinite(row.points) ? row.points : "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- card renderer ----------
function SessionCard({ session }) {
  const type = session.type || "practice";
  let headerStrip = null;

  // BOTH practice + qualifying use the same lapTime system now
  if (type === "practice" || type === "qualifying") {
    const sum = computeSessionLapSummary(session);
    headerStrip = (
      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <StatChip label="Fastest" value={sum.fastestText} tone="sky" />
        <StatChip label="Most Laps" value={sum.mostLapsText} tone="green" />
        <StatChip
          label="Note"
          value={session.extraNote || session.trackNote || "—"}
          tone="amber"
        />
      </div>
    );
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          <span className="text-sky-200">{session.label || "Session"}</span>
        </h2>
      </header>

      {headerStrip}

      {type === "practice" || type === "qualifying" ? (
        <LapTimeTable session={session} />
      ) : null}
    </article>
  );
}

function RaceCard({ session }) {
  const sum = computeRaceSummary(session);
  const podiumIds = sum.podiumIds || [];

  return (
    <article className="rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          <span className="text-sky-200">{session.label || "Race"}</span>
        </h2>
      </header>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <StatChip label="Winner" value={sum.winnerText} tone="sky" />
        <StatChip label="DNFs" value={sum.dnfText} tone="red" />
        <StatChip label="Note" value={session.extraNote || "—"} tone="amber" />
      </div>

      {podiumIds.length === 3 ? <PodiumTiles podiumIds={podiumIds} /> : null}

      <RaceTable session={session} />
    </article>
  );
}

export default function NextRacePage() {
  const sessions = nextRaceContent.sessions || [];
  const raceSession = sessions.find((s) => s.type === "race") || null;
  const sessionResults = sessions.filter((s) => s.type !== "race");

  useEffect(() => {
    const raceName = nextRaceContent.raceName ? ` – ${nextRaceContent.raceName}` : "";
    document.title = `Race Centre${raceName} | KC's Worldwide F1 Update`;
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 -z-10 bg-black/70" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-1 sm:pt-3 pb-10 lg:px-8">
        <TopCard>
          <TopCard.Header
            title="Race Centre"
            subtitle="Schedule, weather, session results & race results."
            logoSrc="/img/car-smoking.png"
          />
        </TopCard>

        <div className="mt-1 flex items-center justify-between gap-4">
          <PageNav />
          <div className="shrink-0" />
        </div>

        {/* Top row */}
        <section className="grid gap-6 md:grid-cols-3 mt-2">
          <article className="rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur md:col-span-2">
            <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-200/90">
                    Race name
                  </p>
                  <div className="mt-1 w-full rounded-full border border-white/10 bg-black/50 px-3 py-1 text-sm">
                    {nextRaceContent.raceName || "—"}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-200/90">
                    Dates
                  </p>
                  <div className="mt-1 w-full rounded-full border border-white/10 bg-black/50 px-3 py-1 text-sm">
                    {nextRaceContent.raceDates || "—"}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-200/90">
                    Location
                  </p>
                  <div className="mt-1 w-full rounded-full border border-white/10 bg-black/50 px-3 py-1 text-sm">
                    {nextRaceContent.location || "—"}
                  </div>
                </div>
              </div>
            </header>

            <div className="mt-2">
              <h2 className="text-sm font-semibold text-gray-100">
                Weekend Schedule <span className="text-sky-200">(Atlantic Time)</span>
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

          {/* Weather + track guide */}
          <article className="h-full overflow-hidden rounded-3xl border border-black/10 shadow-sm bg-white flex flex-col">
            <div className="bg-white p-4">
              <h2 className="text-base font-semibold text-gray-900">
                Weather <span className="text-sky-700">Forecast</span>
              </h2>
              <p className="mt-1 text-xs text-gray-600">Quick notes for the race weekend.</p>

              <div className="mt-3 h-24 w-full whitespace-pre-line rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 overflow-auto">
                {nextRaceContent.weather || "—"}
              </div>
            </div>

            <div className="h-[4px] w-full bg-sky-800" />

            <div className="flex-1 bg-sky-900 p-4 flex flex-col justify-between">
              <div>
                {/* CHANGED: Big centered title */}
                <div className="flex items-center justify-center h-32">
                  <div className="text-4xl font-bold uppercase tracking-wide text-white text-center">
                    TRACK GUIDE
                  </div>
                </div>
              </div>

              {/* Track Guide links */}
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/img/Tracks/Albertpark.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-sky-200/30 bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600 transition"
                  title="Open page 1"
                >
                  Track Guide (1/2)
                </a>

                <a
                  href="/img/Tracks/Albertpark2.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-sky-200/30 bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600 transition"
                  title="Open page 2"
                >
                  Tech Guide (2/2)
                </a>
              </div>
            </div>
          </article>
        </section>

        {/* Results */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="order-2 lg:order-1 space-y-6">
            {sessionResults.map((s) => (
              <SessionCard key={s.id || s.label} session={s} />
            ))}
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-4 self-start">
            {raceSession ? (
              <RaceCard session={raceSession} />
            ) : (
              <article className="rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur">
                <h2 className="text-lg font-semibold text-sky-200">Race</h2>
                <p className="mt-2 text-sm text-gray-300">
                  Add a session with <span className="font-semibold">type: "race"</span>{" "}
                  in nextRaceContent.js to show race results here.
                </p>
              </article>
            )}
          </div>
        </section>

        <div className="mt-2">
          <AdBar />
        </div>
      </div>
    </div>
  );
}