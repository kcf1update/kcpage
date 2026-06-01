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
// ---------- practice / qualifying tables ----------
function PracticeTable({ session }) {
  const res = session?.results || {};

  const rows = NEXT_RACE_DRIVER_IDS.map((id) => {
    const r = res[id] || {};
    return {
  id,
  pos: Number.isFinite(r.pos) ? r.pos : null,
  lapTime: r.lapTime || "",
  laps: r.laps || "",
  status: r.status || "",
};
  });

  rows.sort((a, b) => {
  const aHasPos = Number.isFinite(a.pos);
  const bHasPos = Number.isFinite(b.pos);

  if (aHasPos && bHasPos) return a.pos - b.pos;
  if (aHasPos) return -1;
  if (bHasPos) return 1;

  const aHasTime = Boolean(a.lapTime);
  const bHasTime = Boolean(b.lapTime);

  if (aHasTime && !bHasTime) return -1;
  if (!aHasTime && bHasTime) return 1;

  return (getDriverById(a.id)?.name || a.id).localeCompare(
    getDriverById(b.id)?.name || b.id
  );
});

  return (
    <div className="max-w-full overflow-x-hidden overflow-y-auto pr-0 text-xs sm:text-sm">
      <table className="w-full min-w-0 border-separate border-spacing-y-1 table-fixed">
        <thead className="text-[10px] uppercase tracking-wide text-gray-300 sm:text-[11px]">
          <tr>
            <th className="w-[48%] px-1 py-1 text-left sm:px-2">Driver</th>
            <th className="w-[28%] px-1 py-1 text-left sm:px-2">Lap Time</th>
            <th className="w-[12%] px-1 py-1 text-left sm:px-2">Laps</th>
            <th className="w-[12%] px-1 py-1 text-left sm:px-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="align-middle">
              <td className="min-w-0 px-1 py-1 sm:px-2">
                <DriverPill driverId={row.id} />
              </td>

              <td className="px-1 py-1 sm:px-2">
                <div className="truncate rounded-full border border-white/10 bg-black/50 px-2 py-1">
                  {row.lapTime || "—"}
                </div>
              </td>

              <td className="px-1 py-1 text-gray-100 sm:px-2">{row.laps || "—"}</td>

              <td className="px-1 py-1 text-gray-100 sm:px-2">
                {row.status || "—"}
              </td>
            </tr>
          ))}
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
  pos: Number.isFinite(r.pos) ? r.pos : null,
  q1: r.q1 || "",
  q2: r.q2 || "",
  q3: r.q3 || "",
};
  });

  rows.sort((a, b) => {
  const aHasPos = Number.isFinite(a.pos);
  const bHasPos = Number.isFinite(b.pos);

  if (aHasPos && bHasPos) return a.pos - b.pos;
  if (aHasPos) return -1;
  if (bHasPos) return 1;

  const aBest = a.q3 || a.q2 || a.q1;
  const bBest = b.q3 || b.q2 || b.q1;

  if (aBest && !bBest) return -1;
  if (!aBest && bBest) return 1;

  return (getDriverById(a.id)?.name || a.id).localeCompare(
    getDriverById(b.id)?.name || b.id
  );
});

  return (
    <div className="max-w-full overflow-x-hidden overflow-y-auto pr-0 text-xs sm:text-sm">
      <table className="w-full min-w-0 border-separate border-spacing-y-1 table-fixed">
        <thead className="text-[10px] uppercase tracking-wide text-gray-300 sm:text-[11px]">
          <tr>
            <th className="w-[43%] px-1 py-1 text-left sm:px-2">Driver</th>
            <th className="w-[19%] px-1 py-1 text-left sm:px-2">Q1</th>
            <th className="w-[19%] px-1 py-1 text-left sm:px-2">Q2</th>
            <th className="w-[19%] px-1 py-1 text-left sm:px-2">Q3</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="align-middle">
              <td className="min-w-0 px-1 py-1 sm:px-2">
                <DriverPill driverId={row.id} />
              </td>

              <td className="px-1 py-1 sm:px-2">
                <div className="truncate rounded-full border border-white/10 bg-black/50 px-2 py-1">
                  {row.q1 || "—"}
                </div>
              </td>

              <td className="px-1 py-1 sm:px-2">
                <div className="truncate rounded-full border border-white/10 bg-black/50 px-2 py-1">
                  {row.q2 || "—"}
                </div>
              </td>

              <td className="px-1 py-1 sm:px-2">
                <div className="truncate rounded-full border border-white/10 bg-black/50 px-2 py-1">
                  {row.q3 || "—"}
                </div>
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
function WeekendRecapCard({ recap }) {
  if (!recap?.enabled || !Array.isArray(recap.sections)) return null;

  return (
    <article className="min-w-0 max-w-full overflow-x-hidden rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur">
      <h2 className="text-lg font-semibold text-sky-200">
        {recap.title || "Weekend Recap"}
      </h2>

      <div className="mt-3 space-y-3">
        {recap.sections.map((section) => (
          <div
            key={section.heading}
            className="rounded-2xl border border-white/10 bg-black/30 p-3"
          >
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-100">
              {section.heading}
            </h3>

            <div className="mt-2 space-y-3">
              {(section.items || []).map((item) => (
                <div key={item.title} className="space-y-1">
                  <p className="font-semibold text-white">{item.title}</p>

                  {item.summary ? (
                    <p className="text-sm leading-relaxed text-gray-300">
                      {item.summary}
                    </p>
                  ) : null}

                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-100 hover:bg-sky-500/20"
                    >
                      Read article
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
function SessionCard({ session }) {
  if (!session) return null;

  const isPractice = session.type === "practice";
  const isQualifying =
    session.type === "qualifying" || session.type === "sprint_shootout";
  const isRace =
    session.type === "race" || session.type === "sprint_race";

  if (isRace) {
    return <RaceCard session={session} />;
  }

  return (
    <article className="min-w-0 max-w-full overflow-x-hidden rounded-3xl border border-white/10 bg-black/30 p-3 backdrop-blur sm:p-4">
      <header className="mb-3">
        <h2 className="text-lg font-semibold">
          <span className="text-sky-200">{session.label || "Session"}</span>
        </h2>

        {session.time ? (
          <p className="mt-1 text-sm text-gray-300">{session.time}</p>
        ) : null}

        {session.extraNote ? (
          <p className="mt-1 text-xs text-amber-100">{session.extraNote}</p>
        ) : null}
      </header>

      {isPractice ? <PracticeTable session={session} /> : null}

      {isQualifying ? <QualifyingTable session={session} /> : null}
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
  {previousRaceResults.map((race) => {
    const hasFullWeekend = Array.isArray(race.sessions) && race.sessions.length > 0;

    return (
      <div key={race.raceName} className="space-y-3">
        <div className="rounded-3xl border border-sky-300/40 bg-sky-900/80 p-4 shadow-lg shadow-black/30 backdrop-blur">
  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
        Previous Race
      </p>

      <h2 className="mt-1 text-2xl font-bold tracking-wide text-white">
        {race.raceName}
      </h2>
    </div>

    <p className="text-sm font-medium text-sky-100">
      {race.raceDates}
    </p>
  </div>

  <p className="mt-2 text-sm text-sky-100/90">
    {race.location}
  </p>
</div>

        {hasFullWeekend ? (
  <div className="space-y-3">
    <WeekendRecapCard recap={race.raceWeekendRecap} />

    {race.sessions.map((session) => (
      <SessionCard key={session.id} session={session} />
    ))}
  </div>
) : (
  <RaceCard session={race.session} />
)}
      </div>
    );
  })}
</section>

        <div className="mt-2">
          <AdBar />
        </div>
      </div>
    </div>
  );
}