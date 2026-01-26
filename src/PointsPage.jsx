import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import { getTranslations } from "./translations";
import AdBar from "./AdBar.jsx";
import TopCard from "./components/TopCard";
import PageNav from "./components/PageNav";
import PageHero from "./components/PageHero";

// ✅ File-driven content (edit file + redeploy)
import {
  pointsTeams,
  pointsDrivers,
  constructorPointsOverride,
} from "./content/pointsContent";

export default function PointsPage() {
  const uiText = getTranslations();

  // Drivers with points (from content file)
  const driversWithPoints = useMemo(
    () => pointsDrivers.map((d) => ({ ...d, points: Number(d.points) || 0 })),
    []
  );

  // Sum constructor points from driver points (+ optional overrides)
  const teamPoints = useMemo(() => {
    const map = {};
    for (const d of driversWithPoints) {
      if (!map[d.teamId]) map[d.teamId] = 0;
      map[d.teamId] += d.points;
    }

    if (constructorPointsOverride && typeof constructorPointsOverride === "object") {
      for (const [teamId, pts] of Object.entries(constructorPointsOverride)) {
        if (typeof pts === "number") map[teamId] = pts;
      }
    }

    return map;
  }, [driversWithPoints]);

  // Sort drivers by points
  const sortedDrivers = useMemo(
    () => [...driversWithPoints].sort((a, b) => b.points - a.points),
    [driversWithPoints]
  );

  // Teams with points, sorted
  const teamsWithPoints = useMemo(
    () =>
      pointsTeams
        .map((t) => ({ ...t, points: teamPoints[t.id] ?? 0 }))
        .sort((a, b) => b.points - a.points),
    [teamPoints]
  );

  // Top 3 drivers
  const podium = sortedDrivers.slice(0, 3);

  return (
    <div className="relative min-h-screen bg-[#545454] text-white">
      <PageHero img="hero-worldwide4.png" alt="F1 Points" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-1 sm:pt-4 pb-8 lg:px-8">
        {/* Nav row (standard on all pages) */}
        <div className="mt-1 flex items-center justify-between gap-4">
          <PageNav />
          <div className="shrink-0">{/* language selector hidden for launch */}</div>
        </div>

        <TopCard>
          <TopCard.Header
            title={uiText.pointsPageTitle}
            subtitle={uiText.pointsPageSubtitle}
            logoSrc="/img/kcs-f1-car.png"
            right={
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-red-600 bg-red-600 px-4 py-1 text-xs sm:text-sm text-white shadow-[0_0_18px_rgba(239,68,68,0.55)] hover:bg-red-700 transition"
              >
                <span className="text-lg leading-none">←</span>
                <span>{uiText.navBackHome}</span>
              </Link>
            }
          />
        </TopCard>

        {/* Podium row */}
        <section className="mt-6 grid gap-4 md:grid-cols-12">
          <article className="md:col-span-3 rounded-3xl bg-black/60 p-4 text-sm text-gray-200 backdrop-blur card-green">
            <h2 className="text-xl font-semibold">{uiText.pointsTopThreeTitle}</h2>
            <p className="mt-1 text-sm text-gray-300">{uiText.pointsTopThreeSubtitle}</p>

            <ol className="mt-3 space-y-1 text-xs">
              <li>
                <span className="font-semibold text-amber-300">1st:</span>{" "}
                {podium[0]?.name ?? "—"}{" "}
                <span className="text-gray-400">({podium[0]?.teamName ?? "—"})</span>{" "}
                <span className="text-gray-300">({podium[0]?.points ?? 0})</span>
              </li>
              <li>
                <span className="font-semibold text-amber-300">2nd:</span>{" "}
                {podium[1]?.name ?? "—"}{" "}
                <span className="text-gray-400">({podium[1]?.teamName ?? "—"})</span>{" "}
                <span className="text-gray-300">({podium[1]?.points ?? 0})</span>
              </li>
              <li>
                <span className="font-semibold text-amber-300">3rd:</span>{" "}
                {podium[2]?.name ?? "—"}{" "}
                <span className="text-gray-400">({podium[2]?.teamName ?? "—"})</span>{" "}
                <span className="text-gray-300">({podium[2]?.points ?? 0})</span>
              </li>
            </ol>
          </article>

          <div className="md:col-span-4">
            <AdBar />
          </div>
          <div className="md:col-span-5">
            <AdBar />
          </div>
        </section>

        {/* Standings */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Driver standings */}
          <article className="rounded-3xl bg-black/40 p-4 backdrop-blur card-green">
            <header className="mb-3">
              <h2 className="text-xl font-semibold">{uiText.pointsDriversTitle}</h2>
              <p className="text-xs text-gray-300">Full grid (including Cadillac).</p>
            </header>

            <div className="max-h-[480px] overflow-auto pr-1 text-sm">
              <table className="min-w-full border-separate border-spacing-y-1">
                <thead className="text-xs uppercase tracking-wide text-gray-300">
                  <tr>
                    <th className="px-2 py-1 text-left">Pos</th>
                    <th className="px-2 py-1 text-left">Driver</th>
                    <th className="px-2 py-1 text-left">Team</th>
                    <th className="px-2 py-1 text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDrivers.map((driver, index) => {
                    const isFuture = !!driver.isFuture;
                    return (
                      <tr key={driver.id} className="align-middle">
                        <td className="px-2 py-1 text-xs text-gray-300">{index + 1}</td>

                        <td className="px-2 py-1">
                          <div
                            className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-2 py-1 ${
                              isFuture ? "bg-white/5 text-gray-400" : "bg-white/10"
                            }`}
                          >
                            <span className="text-base leading-none">{driver.countryFlag}</span>
                            <span className="text-xs font-medium leading-tight">{driver.name}</span>
                            {isFuture && (
                              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                                2026
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-2 py-1 text-xs text-gray-200">{driver.teamName}</td>

                        <td className="px-2 py-1 text-right">
                          <span className="inline-flex w-16 justify-end rounded-full border border-white/10 bg-black/50 px-2 py-1 text-xs">
                            {driver.points}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>

          {/* Constructor standings */}
          <article className="rounded-3xl bg-black/40 p-4 backdrop-blur card-green">
            <header className="mb-3">
              <h2 className="text-xl font-semibold">{uiText.pointsConstructorsTitle}</h2>
              <p className="text-xs text-gray-300">
                Team points auto-sum from their drivers. Cadillac is shown as a future 2026 entry.
              </p>
            </header>

            <div className="max-h-[480px] overflow-auto pr-1 text-sm">
              <table className="min-w-full border-separate border-spacing-y-1">
                <thead className="text-xs uppercase tracking-wide text-gray-300">
                  <tr>
                    <th className="px-2 py-1 text-left">Pos</th>
                    <th className="px-2 py-1 text-left">Constructor</th>
                    <th className="px-2 py-1 text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {teamsWithPoints.map((team, index) => (
                    <tr key={team.id} className="align-middle">
                      <td className="px-2 py-1 text-xs text-gray-300">{index + 1}</td>

                      <td className="px-2 py-1">
                        <div
                          className={`flex items-center gap-2 rounded-full border px-2 py-1 ${
                            team.isFuture
                              ? "border-gray-500/60 bg-white/5 text-gray-400"
                              : "border-white/20 bg-white/10"
                          }`}
                          style={{ borderLeft: `4px solid ${team.color}` }}
                        >
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
                          <span className="text-xs font-medium leading-tight">{team.name}</span>
                          {team.isFuture && (
                            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                              2026
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-2 py-1 text-right">
                        <span className="text-sm font-semibold">{team.points}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        {/* Rules section (unchanged) */}
        <section className="rounded-3xl p-4 text-sm leading-relaxed backdrop-blur card-aston">
          <h2 className="text-lg font-semibold">How points are awarded</h2>
          <p className="mt-1 text-xs text-gray-300">
            This section is intentionally compact so it doesn’t dominate the page.
          </p>

          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">Grand Prix (main race)</h3>
              <p className="mt-1 text-xs text-gray-200">Points for the top 10 drivers:</p>
              <p className="mt-1 text-xs">
                <span className="font-medium">1st–10th:</span> 25, 18, 15, 12, 10, 8, 6, 4, 2, 1
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Sprint race</h3>
              <p className="mt-1 text-xs text-gray-200">Points for the top 8 drivers:</p>
              <p className="mt-1 text-xs">
                <span className="font-medium">1st-8th:</span> 8, 7, 6, 5, 4, 3, 2, 1
              </p>
              <p className="mt-1 text-xs text-gray-200">
                <span className="font-medium">Constructors:</span> each constructor’s total is
                simply the sum of their drivers’ points from all races and sprints.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
