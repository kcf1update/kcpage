import React from "react";

import SiteHeader from "./components/SiteHeader";
import AdBar from "./AdBar.jsx";

import { previousRaceResults } from "./content/previousRaceResults";
import { NEXT_RACE_DRIVER_IDS } from "./content/nextRaceContent";
import { getDriverById } from "./content/drivers";

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

function StatChip({ label, value, tone = "sky" }) {
  const toneMap = {
    sky: "border-sky-400/40 bg-sky-500/10 text-sky-100",
    amber: "border-amber-400/40 bg-amber-500/10 text-amber-100",
    green: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
    red: "border-red-400/40 bg-red-500/10 text-red-100",
  };

  return (
    <div
      className={`flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-2 text-xs ${
        toneMap[tone] || toneMap.sky
      }`}
    >
      <span className="shrink-0 uppercase tracking-[0.18em] opacity-80">{label}</span>
      <span className="min-w-0 truncate font-semibold">{value || "—"}</span>
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

// ---------- race summary ----------
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

// ---------- race table ----------
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

// ---------- race card ----------
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

export default function PreviousResultsPage() {
  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden text-white">
      <div className="absolute inset-0 -z-10 bg-black/70" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4 overflow-x-hidden px-4 pb-10 pt-1 sm:pt-3 lg:px-8">
        <SiteHeader />

        <div className="mt-1 flex items-center justify-between gap-4">
         
          <div className="shrink-0" />
        </div>

        <section className="space-y-6">
          {previousRaceResults.map((race) => (
            <div key={race.raceName} className="space-y-3">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur">
                <h2 className="text-xl font-semibold text-sky-200">{race.raceName}</h2>
                <p className="mt-1 text-sm text-gray-300">
                  {race.raceDates} • {race.location}
                </p>
              </div>

              <RaceCard session={race.session} />
            </div>
          ))}
        </section>

        <div className="mt-2">
          <AdBar />
        </div>
      </div>
    </div>
  );
}