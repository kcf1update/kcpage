import React, { useEffect } from "react";
import { Link } from "react-router-dom";

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
  if (s.includes("did not run") || s.includes("dns") || s.includes("dnf") || s.includes("dsq")) {
    return Number.POSITIVE_INFINITY;
  }

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

// ---------- qualifying helpers ----------
function getQualifyingMs(value) {
  return extractLapMs(value);
}

function getBestQualifyingMs(row) {
  const q3ms = getQualifyingMs(row.q3);
  if (q3ms !== Number.POSITIVE_INFINITY) return q3ms;

  const q2ms = getQualifyingMs(row.q2);
  if (q2ms !== Number.POSITIVE_INFINITY) return q2ms;

  return getQualifyingMs(row.q1);
}

function getQualifyingRankBucket(row) {
  const hasQ3 = getQualifyingMs(row.q3) !== Number.POSITIVE_INFINITY;
  const hasQ2 = getQualifyingMs(row.q2) !== Number.POSITIVE_INFINITY;

  if (hasQ3) return 1; // Q3 runners
  if (hasQ2) return 2; // Q2 exits
  return 3; // Q1 exits
}

function displayQualTime(value) {
  if (!value || String(value).trim() === "") return "—";
  return value;
}



// ---------- session fill detection / ordering ----------
function hasPracticeResults(session) {
  const res = session?.results || {};
  return Array.isArray(NEXT_RACE_DRIVER_IDS) && NEXT_RACE_DRIVER_IDS.some((id) => {
    const r = res[id] || {};
    return (
      (typeof r.lapTime === "string" && r.lapTime.trim() !== "") ||
      (typeof r.status === "string" && r.status.trim() !== "") ||
      String(r.laps ?? "").trim() !== ""
    );
  });
}

function hasQualifyingResults(session) {
  const res = session?.results || {};
  return Array.isArray(NEXT_RACE_DRIVER_IDS) && NEXT_RACE_DRIVER_IDS.some((id) => {
    const r = res[id] || {};
    return (
      (typeof r.q1 === "string" && r.q1.trim() !== "") ||
      (typeof r.q2 === "string" && r.q2.trim() !== "") ||
      (typeof r.q3 === "string" && r.q3.trim() !== "")
    );
  });
}

function hasRaceResults(session) {
  const res = session?.results || {};
  return Array.isArray(NEXT_RACE_DRIVER_IDS) && NEXT_RACE_DRIVER_IDS.some((id) => {
    const r = res[id] || {};
    return (
      Number.isFinite(r.pos) ||
      Number.isFinite(r.grid) ||
      Number.isFinite(r.points) ||
      (typeof r.status === "string" && r.status.trim() !== "")
    );
  });
}

function hasSessionResults(session) {
  if (!session) return false;

 if (session.type === "practice") {
  return hasPracticeResults(session);
}

if (session.type === "qualifying" || session.type === "sprint_shootout") {
  return hasQualifyingResults(session);
}

  if (session.type === "race" || session.type === "sprint_race") {
    return hasRaceResults(session);
  }

  return false;
}

function getSessionWeekendRank(session) {
  const type = session?.type || "";
  const id = session?.id || "";

  if (type === "race") return 5;
  if (type === "qualifying") return 4;
  if (type === "sprint_race") return 3;
  if (type === "sprint_shootout") return 2;
  if (type === "practice" && id === "p1") return 1;

  if (id === "p3") return 3;
  if (id === "p2") return 2;
  if (id === "p1") return 1;

  return 0;
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

  const flagSrc = d.countryCode ? `/flags/${String(d.countryCode).toLowerCase()}.png` : "";

  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium">
      <span className="min-w-[28px] text-sky-200">#{d.number}</span>

      {flagSrc ? (
        <img
          src={flagSrc}
          alt={d.countryCode ? d.countryCode.toUpperCase() : ""}
          className="h-4 w-4 rounded-full border border-white/20 object-cover"
          loading="lazy"
        />
      ) : null}

      <span className="truncate whitespace-nowrap">{d.name}</span>
    </span>
  );
}
function PodiumTiles({ podiumIds }) {
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="mb-3 grid gap-2 sm:grid-cols-3">
      {podiumIds.map((id, i) => (
        <div
          key={id}
          className="min-w-0 rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
        >
          <div className="text-xs text-gray-300">{medals[i]} Podium</div>
          <div className="mt-1 min-w-0">
            <DriverPill driverId={id} />
          </div>
        </div>
      ))}
    </div>
  );
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
    if (gapMs <= 250) return "text-emerald-300";
    if (gapMs <= 750) return "text-amber-300";
    return "text-red-300";
  };

  return (
    <div className="max-w-full overflow-x-hidden overflow-y-auto pr-0 text-xs sm:text-sm">
      <table className="w-full min-w-0 border-separate border-spacing-y-1 table-fixed">
        <thead className="text-[10px] uppercase tracking-wide text-gray-300 sm:text-[11px]">
          <tr>
            <th className="w-[9%] px-1 py-1 text-left sm:px-2">Pos</th>
            <th className="w-[41%] px-1 py-1 text-left sm:px-2">Driver</th>
            <th className="w-[22%] px-1 py-1 text-left sm:px-2">Time</th>
            <th className="w-[12%] px-1 py-1 text-left sm:px-2">Laps</th>
            <th className="w-[16%] px-1 py-1 text-left sm:px-2">Gap</th>
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
                  isLeader ? "rounded-2xl bg-white/5 ring-1 ring-emerald-400/30" : ""
                }`}
              >
                <td className="px-1 py-1 text-gray-300 sm:px-2">
                  {hasTime ? i + 1 : "—"}
                </td>

                <td className="min-w-0 px-1 py-1 sm:px-2">
                  <DriverPill driverId={row.id} />
                </td>

                <td className="px-1 py-1 sm:px-2">
                  <div className="truncate rounded-full border border-white/10 bg-black/50 px-2 py-1">
                    {timeCell}
                  </div>
                </td>

                <td className="px-1 py-1 text-gray-100 sm:px-2">
                  {row.laps !== "" ? row.laps : "—"}
                </td>

                <td className={`px-1 py-1 sm:px-2 ${gapTone(gapMs)}`}>
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

function QualifyingTable({ session }) {
  const res = session?.results || {};

  const rows = NEXT_RACE_DRIVER_IDS.map((id) => {
    const r = res[id] || {};
    return {
      id,
      q1: r.q1 || "",
      q2: r.q2 || "",
      q3: r.q3 || "",
    };
  });

  rows.sort((a, b) => {
    const bucketDiff = getQualifyingRankBucket(a) - getQualifyingRankBucket(b);
    if (bucketDiff !== 0) return bucketDiff;
    return getBestQualifyingMs(a) - getBestQualifyingMs(b);
  });

  return (
    <div className="min-w-0 max-w-full text-xs sm:text-sm">
      <div className="mb-2 flex items-center justify-end sm:hidden">
        <span className="select-none text-[9px] uppercase tracking-[0.14em] text-gray-500">
          ↔ swipe
        </span>
      </div>

      <div className="max-w-full overflow-x-auto overflow-y-hidden [scrollbar-width:thin]">
        <table className="min-w-[680px] border-separate border-spacing-y-1">
          <thead className="text-[10px] uppercase tracking-wide text-gray-300 sm:text-[11px]">
            <tr>
              <th className="w-[52px] px-1 py-1 text-left sm:px-2">Pos</th>
              <th className="w-[220px] px-1 py-1 text-left sm:px-2">Driver</th>
              <th className="w-[136px] px-1 py-1 text-left sm:px-2">Q1</th>
              <th className="w-[136px] px-1 py-1 text-left sm:px-2">Q2</th>
              <th className="w-[136px] px-1 py-1 text-left sm:px-2">Q3</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => {
              const isPole = i === 0 && getQualifyingMs(row.q3) !== Number.POSITIVE_INFINITY;

              return (
                <tr
                  key={row.id}
                  className={`align-middle ${
                    isPole ? "rounded-2xl bg-white/5 ring-1 ring-emerald-400/30" : ""
                  }`}
                >
                  <td className="whitespace-nowrap px-1 py-1 text-gray-300 sm:px-2">
                    {i + 1}
                  </td>

                  <td className="px-1 py-1 sm:px-2">
                    <div className="min-w-[200px]">
                      <DriverPill driverId={row.id} />
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-1 py-1 sm:px-2">
                    <div className="rounded-full border border-white/10 bg-black/50 px-2 py-1">
                      {displayQualTime(row.q1)}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-1 py-1 sm:px-2">
                    <div className="rounded-full border border-white/10 bg-black/50 px-2 py-1">
                      {displayQualTime(row.q2)}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-1 py-1 sm:px-2">
                    <div
                      className={`rounded-full border px-2 py-1 ${
                        isPole
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                          : "border-white/10 bg-black/50"
                      }`}
                    >
                      {displayQualTime(row.q3)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
    <div className="max-w-full overflow-x-hidden overflow-y-auto pr-0 text-xs sm:text-sm">
      <table className="w-full min-w-0 border-separate border-spacing-y-1 table-fixed">
        <thead className="text-[10px] uppercase tracking-wide text-gray-300 sm:text-[11px]">
          <tr>
            <th className="w-[9%] px-1 py-1 text-left sm:px-2">Pos</th>
            <th className="w-[39%] px-1 py-1 text-left sm:px-2">Driver</th>
            <th className="w-[24%] px-1 py-1 text-left sm:px-2">Time/Status</th>
            <th className="w-[12%] px-1 py-1 text-left sm:px-2">Grid</th>
            <th className="w-[16%] px-1 py-1 text-left sm:px-2">Pts</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="align-middle">
              <td className="px-1 py-1 text-gray-300 sm:px-2">
                {Number.isFinite(row.pos) ? row.pos : "—"}
              </td>
              <td className="min-w-0 px-1 py-1 sm:px-2">
                <DriverPill driverId={row.id} />
              </td>
              <td className="px-1 py-1 sm:px-2">
                <div className="truncate rounded-full border border-white/10 bg-black/50 px-2 py-1">
                  {row.status || "—"}
                </div>
              </td>
              <td className="px-1 py-1 text-gray-100 sm:px-2">
                {Number.isFinite(row.grid) ? row.grid : "—"}
              </td>
              <td className="px-1 py-1 sm:px-2">
                <span className="inline-flex rounded-full bg-white/10 px-2 py-1 font-semibold sm:px-3">
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
  const isPracticeLike = type === "practice";
const isQualifyingLike = type === "qualifying" || type === "sprint_shootout";
const isRaceLike = type === "sprint_race";

  

  

  

  

  return (
    <article className="min-w-0 max-w-full overflow-x-hidden rounded-3xl border border-white/10 bg-black/30 p-3 backdrop-blur sm:p-4">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          <span className="text-sky-200">{session.label || "Session"}</span>
        </h2>
      </header>

      

      {isPracticeLike ? <LapTimeTable session={session} /> : null}
      {isQualifyingLike ? <QualifyingTable session={session} /> : null}
      {isRaceLike ? <RaceTable session={session} /> : null}
    </article>
  );
}

function RaceCard({ session }) {
  const sum = computeRaceSummary(session);
  const podiumIds = sum.podiumIds || [];

  return (
    <article className="min-w-0 max-w-full overflow-x-hidden rounded-3xl border border-white/10 bg-black/30 p-3 backdrop-blur sm:p-4">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          <span className="text-sky-200">{session.label || "Race"}</span>
        </h2>
      </header>

      

      {podiumIds.length === 3 ? <PodiumTiles podiumIds={podiumIds} /> : null}

      <RaceTable session={session} />
    </article>
  );
}

export default function NextRacePage() {
  const sessions = nextRaceContent.sessions || [];

  const orderedSessions = [...sessions].sort((a, b) => {
    const aFilled = hasSessionResults(a) ? 1 : 0;
    const bFilled = hasSessionResults(b) ? 1 : 0;

    
    if (aFilled !== bFilled) return bFilled - aFilled;

    return getSessionWeekendRank(a) - getSessionWeekendRank(b);
  });

  const raceSession = orderedSessions.find((s) => s.type === "race") || null;
  const sessionResults = orderedSessions.filter((s) => s.type !== "race");

  const raceHasResults = hasRaceResults(raceSession);

  useEffect(() => {
    const raceName = nextRaceContent.raceName ? ` – ${nextRaceContent.raceName}` : "";
    document.title = `Race Centre${raceName} | KC's Worldwide F1 Update`;
  }, []);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden text-white">
      <div className="absolute inset-0 -z-10 bg-black/70" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4 overflow-x-hidden px-4 pb-10 pt-1 sm:pt-3 lg:px-8">
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
        <section className="mt-2 grid gap-4 md:grid-cols-3 md:gap-6">
          <article className="min-w-0 rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur md:col-span-2">
            <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-200/90">
                    Race name
                  </p>
                  <div className="mt-1 w-full truncate rounded-full border border-white/10 bg-black/50 px-3 py-1 text-sm">
                    {nextRaceContent.raceName || "—"}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-200/90">
                    Dates
                  </p>
                  <div className="mt-1 w-full truncate rounded-full border border-white/10 bg-black/50 px-3 py-1 text-sm">
                    {nextRaceContent.raceDates || "—"}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-200/90">
                    Location
                  </p>
                  <div className="mt-1 w-full truncate rounded-full border border-white/10 bg-black/50 px-3 py-1 text-sm">
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
                    className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
                  >
                    <div className="min-w-0 text-sm font-medium">
                      {session.label || `Session ${idx + 1}`}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-gray-300">
                        Time
                      </span>
                      <div className="w-32 rounded-full border border-white/10 bg-black/50 px-2 py-1 text-right text-[11px] sm:w-40 sm:text-xs">
                        {session.time || "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Weather + track guide */}
          <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
            <div className="bg-white p-3 sm:p-4">
              <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
                Weather <span className="text-sky-700">Forecast</span>
              </h2>
              <p className="mt-1 text-[11px] text-gray-600 sm:text-xs">
                Quick notes for the race weekend.
              </p>

              <div className="mt-2 h-auto min-h-[72px] w-full overflow-auto whitespace-pre-line rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs text-gray-900 sm:mt-3 sm:h-24 sm:text-sm">
                {nextRaceContent.weather || "—"}
              </div>
            </div>

            <div className="h-[4px] w-full bg-sky-800" />

            <div className="flex flex-1 flex-col justify-between bg-sky-900 p-3 sm:p-4">
              <div>
                <div className="flex h-20 items-center justify-center sm:h-32">
                  <div className="text-center text-2xl font-bold uppercase tracking-wide text-white sm:text-4xl">
                    TRACK GUIDE
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:flex-wrap">
                <a
                  href="/img/tracks/japanesetrack.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-sky-200/30 bg-sky-700 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-sky-600 sm:px-4 sm:text-xs"
                  title="Open page 1"
                >
                  Track Guide (1/2)
                </a>

                <a
                  href="/img/Tracks/tek2.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-sky-200/30 bg-sky-700 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-sky-600 sm:px-4 sm:text-xs"
                  title="Open page 2"
                >
                  Tech Guide (2/2)
                </a>

                <Link
                  to="/previous-results"
                  className="inline-flex items-center justify-center rounded-full border border-sky-200/30 bg-sky-700 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-sky-600"
                >
                  Previous Results
                </Link>
              </div>
            </div>
          </article>
        </section>

        {/* Results */}
        <section className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-6">
          {raceHasResults ? (
            <>
              <div className="order-1 min-w-0 self-start lg:order-2 lg:sticky lg:top-4">
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

              <div className="order-2 min-w-0 space-y-6 lg:order-1">
                {sessionResults.map((s) => (
                  <SessionCard key={s.id || s.label} session={s} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="order-1 min-w-0 space-y-6 lg:order-1">
                {sessionResults.map((s) => (
                  <SessionCard key={s.id || s.label} session={s} />
                ))}
              </div>

              <div className="order-2 min-w-0 self-start lg:order-2 lg:sticky lg:top-4">
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
            </>
          )}
        </section>

        <div className="mt-2">
          <AdBar />
        </div>
      </div>
    </div>
  );
}