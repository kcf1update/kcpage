import React from "react";
import { Link } from "react-router-dom";

import AdBar from "./AdBar.jsx";
import TopCard from "./components/TopCard";
import PageNav from "./components/PageNav";

import { nextRaceContent, NEXT_RACE_DRIVER_IDS } from "./content/nextRaceContent";
import { DRIVERS } from "./content/drivers";

// ---------- time helpers ----------
function extractLapMs(result) {
  if (!result) return Number.POSITIVE_INFINITY;

  const s = String(result).trim().toLowerCase();
  if (!s || s === "-" || s === "—") return Number.POSITIVE_INFINITY;
  if (s.includes("did not run") || s.includes("dns") || s.includes("dnf")) {
    return Number.POSITIVE_INFINITY;
  }

  // "1m33.459s"
  const m = s.match(/(\d+)\s*m\s*(\d+(?:\.\d+)?)\s*s/);
  if (m) {
    const minutes = parseInt(m[1], 10);
    const seconds = parseFloat(m[2]);
    if (!Number.isNaN(minutes) && !Number.isNaN(seconds)) {
      return Math.round((minutes * 60 + seconds) * 1000);
    }
  }

  // "1:33.459"
  const c = s.match(/(\d+)\s*:\s*(\d+(?:\.\d+)?)/);
  if (c) {
    const minutes = parseInt(c[1], 10);
    const seconds = parseFloat(c[2]);
    if (!Number.isNaN(minutes) && !Number.isNaN(seconds)) {
      return Math.round((minutes * 60 + seconds) * 1000);
    }
  }

  // "33.459"
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

function getDriver(driverId) {
  return DRIVERS.find((d) => d.id === driverId);
}

// ---------- UI bits ----------
function DriverPill({ driverId }) {
  const d = getDriver(driverId);
  if (!d) return <span className="inline-flex rounded-full bg-white/10 px-2 py-1 text-[11px]">—</span>;

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium">
      <span className="min-w-[24px] text-sky-200">#{d.number}</span>
      {d.flag ? (
        <img
          src={d.flag}
          alt=""
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
    <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs ${toneMap[tone] || toneMap.sky}`}>
      <span className="uppercase tracking-[0.18em] opacity-80">{label}</span>
      <span className="font-semibold">{value || "—"}</span>
    </div>
  );
}

// ---------- session computations ----------
function computePracticeSummary(session) {
  const res = session?.results || {};
  const rows = NEXT_RACE_DRIVER_IDS.map((id) => {
    const r = res[id] || {};
    const ms = extractLapMs(r.bestLap);
    return { id, bestLap: r.bestLap || "", laps: r.laps ?? "", ms };
  }).filter(Boolean);

  rows.sort((a, b) => a.ms - b.ms);

  const fastest = rows.find((x) => x.ms !== Number.POSITIVE_INFINITY);
  const mostLaps = rows
    .filter((x) => Number.isFinite(Number(x.laps)))
    .sort((a, b) => Number(b.laps) - Number(a.laps))[0];

  return {
    fastestText: fastest ? `${getDriver(fastest.id)?.name || fastest.id} ${fastest.bestLap}` : "—",
    mostLapsText: mostLaps ? `${getDriver(mostLaps.id)?.name || mostLaps.id} (${mostLaps.laps})` : "—",
  };
}

function computeQualySummary(session) {
  const res = session?.results || {};
  const rows = NEXT_RACE_DRIVER_IDS.map((id) => {
    const r = res[id] || {};
    const ms = extractLapMs(r.best);
    return { id, best: r.best || "", segment: r.segment || "", ms };
  });

  rows.sort((a, b) => a.ms - b.ms);
  const pole = rows.find((x) => x.ms !== Number.POSITIVE_INFINITY);
  const p10 = rows.filter((x) => x.ms !== Number.POSITIVE_INFINITY)[9]; // 10th quickest (0-index)

  return {
    poleText: pole ? `${getDriver(pole.id)?.name || pole.id} ${pole.best}` : "—",
    cutoffText: p10 ? `${getDriver(p10.id)?.name || p10.id} ${p10.best}` : "—",
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
      grid: Number.isFinite(r.grid) ? r.grid : null,
      points: Number.isFinite(r.points) ? r.points : null,
      fastestLap: r.fastestLap || "",
      fastestLapMs: extractLapMs(r.fastestLap),
    };
  });

  // Winner/podium based on pos
  const classified = rows.filter((x) => Number.isFinite(x.pos)).sort((a, b) => a.pos - b.pos);
  const winner = classified[0];
  const podium = classified.slice(0, 3);

  // Fastest lap across all drivers (if provided)
  const fl = rows.filter((x) => x.fastestLapMs !== Number.POSITIVE_INFINITY).sort((a, b) => a.fastestLapMs - b.fastestLapMs)[0];

  // DNF/DNS count
  const dnfs = rows.filter((x) => String(x.status).toUpperCase().includes("DNF") || String(x.status).toUpperCase().includes("DNS")).length;

  return {
    winnerText: winner ? `${getDriver(winner.id)?.name || winner.id}` : "—",
    podiumIds: podium.map((p) => p.id),
    fastestLapText: fl ? `${getDriver(fl.id)?.name || fl.id} ${fl.fastestLap}` : "—",
    dnfText: dnfs ? String(dnfs) : "0",
  };
}

// ---------- render tables ----------
function PracticeTable({ session }) {
  const res = session?.results || {};

  const rows = NEXT_RACE_DRIVER_IDS.map((id) => {
    const r = res[id] || {};
    const ms = extractLapMs(r.bestLap);
    return { id, bestLap: r.bestLap || "", laps: r.laps ?? "", ms };
  });

  rows.sort((a, b) => a.ms - b.ms);

  const leader = rows.find((x) => x.ms !== Number.POSITIVE_INFINITY);
  const leaderMs = leader ? leader.ms : null;

  return (
    <div className="max-h-80 overflow-auto pr-1 text-xs sm:text-sm">
      <table className="min-w-full border-separate border-spacing-y-1">
        <thead className="text-[11px] uppercase tracking-wide text-gray-300">
          <tr>
            <th className="px-2 py-1 text-left">Pos</th>
            <th className="px-2 py-1 text-left">Driver</th>
            <th className="px-2 py-1 text-left">Best Lap</th>
            <th className="px-2 py-1 text-left">Laps</th>
            <th className="px-2 py-1 text-left">Gap</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const gap =
              leaderMs != null &&
              row.ms !== Number.POSITIVE_INFINITY &&
              row.id !== leader?.id
                ? formatGapMs(row.ms - leaderMs)
                : "";

            return (
              <tr key={row.id} className="align-middle">
                <td className="px-2 py-1 text-gray-300">{row.ms === Number.POSITIVE_INFINITY ? "—" : i + 1}</td>
                <td className="px-2 py-1"><DriverPill driverId={row.id} /></td>
                <td className="px-2 py-1">
                  <div className="rounded-full border border-white/10 bg-black/50 px-2 py-1">{row.bestLap || "—"}</div>
                </td>
                <td className="px-2 py-1 text-gray-100">{row.laps !== "" ? row.laps : "—"}</td>
                <td className="px-2 py-1 text-sky-200/80">{gap || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function QualyTable({ session }) {
  const res = session?.results || {};
  const rows = NEXT_RACE_DRIVER_IDS.map((id) => {
    const r = res[id] || {};
    const ms = extractLapMs(r.best);
    return { id, best: r.best || "", segment: r.segment || "", ms };
  });

  rows.sort((a, b) => a.ms - b.ms);
  const leader = rows.find((x) => x.ms !== Number.POSITIVE_INFINITY);
  const leaderMs = leader ? leader.ms : null;

  return (
    <div className="max-h-80 overflow-auto pr-1 text-xs sm:text-sm">
      <table className="min-w-full border-separate border-spacing-y-1">
        <thead className="text-[11px] uppercase tracking-wide text-gray-300">
          <tr>
            <th className="px-2 py-1 text-left">Pos</th>
            <th className="px-2 py-1 text-left">Driver</th>
            <th className="px-2 py-1 text-left">Best</th>
            <th className="px-2 py-1 text-left">Segment</th>
            <th className="px-2 py-1 text-left">Gap</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const gap =
              leaderMs != null &&
              row.ms !== Number.POSITIVE_INFINITY &&
              row.id !== leader?.id
                ? formatGapMs(row.ms - leaderMs)
                : "";

            return (
              <tr key={row.id} className="align-middle">
                <td className="px-2 py-1 text-gray-300">{row.ms === Number.POSITIVE_INFINITY ? "—" : i + 1}</td>
                <td className="px-2 py-1"><DriverPill driverId={row.id} /></td>
                <td className="px-2 py-1">
                  <div className="rounded-full border border-white/10 bg-black/50 px-2 py-1">{row.best || "—"}</div>
                </td>
                <td className="px-2 py-1 text-gray-100">{row.segment || "—"}</td>
                <td className="px-2 py-1 text-sky-200/80">{gap || "—"}</td>
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
    const pos = Number.isFinite(r.pos) ? r.pos : null;
    return {
      id,
      pos,
      status: r.status || "",
      grid: Number.isFinite(r.grid) ? r.grid : null,
      points: Number.isFinite(r.points) ? r.points : null,
    };
  });

  // Sort: classified by pos, then the rest alphabetically by driver name
  rows.sort((a, b) => {
    const aC = Number.isFinite(a.pos);
    const bC = Number.isFinite(b.pos);
    if (aC && bC) return a.pos - b.pos;
    if (aC) return -1;
    if (bC) return 1;
    return (getDriver(a.id)?.name || a.id).localeCompare(getDriver(b.id)?.name || b.id);
  });

  return (
    <div className="max-h-80 overflow-auto pr-1 text-xs sm:text-sm">
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
              <td className="px-2 py-1 text-gray-300">{Number.isFinite(row.pos) ? row.pos : "—"}</td>
              <td className="px-2 py-1"><DriverPill driverId={row.id} /></td>
              <td className="px-2 py-1">
                <div className="rounded-full border border-white/10 bg-black/50 px-2 py-1">
                  {row.status || "—"}
                </div>
              </td>
              <td className="px-2 py-1 text-gray-100">{Number.isFinite(row.grid) ? row.grid : "—"}</td>
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

function PodiumTiles({ podiumIds }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="mb-3 grid gap-2 sm:grid-cols-3">
      {podiumIds.map((id, i) => (
        <div key={id} className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
          <div className="text-xs text-gray-300">{medals[i]} Podium</div>
          <div className="mt-1">
            <DriverPill driverId={id} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NextRacePage() {
  const sessions = nextRaceContent.sessions || [];

  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 -z-10 bg-black/70" />

      <div className="next-race-page relative z-10 mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-1 sm:pt-4 pb-10 lg:px-8">
        {/* KEEP: hero card + nav exactly as you asked */}
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

        <div className="mt-1 flex items-center justify-between gap-4">
          <PageNav />
          <div className="shrink-0" />
        </div>

        {/* Top row: race info + weather (weather matches your “polished” look) */}
        <section className="grid gap-6 lg:grid-cols-3 mt-2">
          <article className="card-green lg:col-span-2 rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur">
            <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-200/90">Race name</p>
                  <div className="mt-1 w-full rounded-full border border-white/10 bg-black/50 px-3 py-1 text-sm">
                    {nextRaceContent.raceName || "—"}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-200/90">Dates</p>
                  <div className="mt-1 w-full rounded-full border border-white/10 bg-black/50 px-3 py-1 text-sm">
                    {nextRaceContent.raceDates || "—"}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-200/90">Location</p>
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
border border-sky-400/50 bg-sky-500/15
px-3 py-1 text-xs text-sky-200
hover:bg-sky-500/25 hover:text-sky-100 transition
hover:shadow-[0_0_14px_rgba(56,189,248,0.6)]"
                    >
                      Check out the next race <span className="text-[10px] text-gray-300">↗</span>
                    </a>
                  </div>
                ) : null}
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
                    <div className="text-sm font-medium">{session.label || `Session ${idx + 1}`}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-gray-300">Time</span>
                      <div className="w-40 rounded-full border border-white/10 bg-black/50 px-2 py-1 text-right text-xs">
                        {session.time || "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* White weather card like you wanted */}
          <article className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Weather <span className="text-sky-700">Forecast</span>
            </h2>
            <p className="mt-1 text-xs text-gray-600">Forecast notes for the race weekend.</p>

            <div className="mt-3 h-40 w-full whitespace-pre-line rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 overflow-auto">
              {nextRaceContent.weather || "—"}
            </div>
            <div className="mt-3 h-[2px] w-full rounded-full bg-sky-600/70" />
          </article>
        </section>

        {/* Session results cards (THIS is the pro part) */}
        <section className="space-y-6">
          {sessions.map((session, idx) => {
            const type = session.type || "practice";

            // session header strip values
            let headerStrip = null;
            let podiumIds = [];

            if (type === "practice") {
              const sum = computePracticeSummary(session);
              headerStrip = (
                <div className="mb-3 grid gap-2 sm:grid-cols-3">
                  <StatChip label="Fastest" value={sum.fastestText} tone="sky" />
                  <StatChip label="Most Laps" value={sum.mostLapsText} tone="green" />
                  <StatChip label="Note" value={session.extraNote || session.trackNote || "—"} tone="amber" />
                </div>
              );
            }

            if (type === "qualifying") {
              const sum = computeQualySummary(session);
              headerStrip = (
                <div className="mb-3 grid gap-2 sm:grid-cols-3">
                  <StatChip label="Pole" value={sum.poleText} tone="sky" />
                  <StatChip label="P10 Cutoff" value={sum.cutoffText} tone="amber" />
                  <StatChip label="Note" value={session.extraNote || "—"} tone="green" />
                </div>
              );
            }

            if (type === "race") {
              const sum = computeRaceSummary(session);
              podiumIds = sum.podiumIds;
              headerStrip = (
                <div className="mb-3 grid gap-2 sm:grid-cols-4">
                  <StatChip label="Winner" value={sum.winnerText} tone="sky" />
                  <StatChip label="Fastest Lap" value={sum.fastestLapText} tone="green" />
                  <StatChip label="DNFs" value={sum.dnfText} tone="red" />
                  <StatChip label="Note" value={session.extraNote || "—"} tone="amber" />
                </div>
              );
            }

            return (
              <article
                key={session.id || idx}
                className="rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur"
              >
                <header className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">
                    <span className="text-sky-200">{session.label || `Session ${idx + 1}`}</span>
                  </h2>
                </header>

                {headerStrip}

                {type === "race" && podiumIds.length === 3 ? <PodiumTiles podiumIds={podiumIds} /> : null}

                {type === "practice" ? <PracticeTable session={session} /> : null}
                {type === "qualifying" ? <QualyTable session={session} /> : null}
                {type === "race" ? <RaceTable session={session} /> : null}
              </article>
            );
          })}
        </section>

        {/* Ad slot at bottom (mobile friendly, like you wanted earlier) */}
        <div className="mt-2">
          <AdBar />
        </div>
      </div>
    </div>
  );
}