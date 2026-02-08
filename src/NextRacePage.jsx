import React from "react";
import { Link } from "react-router-dom";

import AdBar from "./AdBar.jsx";
import TopCard from "./components/TopCard";
import PageNav from "./components/PageNav";
import PageHero from "./components/PageHero";

import { nextRaceContent, NEXT_RACE_DRIVERS } from "./content/nextRaceContent";

export default function NextRacePage() {
  // Convenience: sessions in the order you defined in the content file
  const sessions = nextRaceContent.sessions || [];

  return (
    <div className="relative min-h-screen text-white">
      {/* Gray background overlay to match kcpage */}
      <div className="absolute inset-0 -z-10 bg-black/70" />

      {/* HERO */}
      <PageHero img="hero-worldwide4.png" alt="Next Race" />

      {/* Foreground content */}
      <div className="next-race-page relative z-10 mx-auto flex max-w-7xl flex-col gap-4 px-4 pt-1 sm:pt-4 pb-8 lg:px-8">
        {/* Nav row */}
        <div className="mt-1 flex items-center justify-between gap-4">
          <PageNav />
          <div className="shrink-0">{/* language selector hidden for launch */}</div>
        </div>

        {/* Top card */}
        <TopCard>
          <TopCard.Header
            title="Next Race Information"
            subtitle="Weekend schedule, weather, and session results."
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
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-300">Race name</p>
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
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-300">Location</p>
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
            <p className="mt-1 text-xs text-gray-300">Forecast notes for the race weekend.</p>

            <div className="mt-3 h-40 w-full whitespace-pre-line rounded-2xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-gray-100 overflow-auto">
              {nextRaceContent.weather || "—"}
            </div>
          </article>
        </section>

        {/* Results per session */}
        <section className="space-y-6">
          {sessions.map((session, idx) => (
            <article
              key={session.id || idx}
              className="card-green rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur"
            >
              <header className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{session.label || `Session ${idx + 1}`}</h2>
                <p className="text-[11px] text-gray-300">
                  
                </p>
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
                    {NEXT_RACE_DRIVERS.map((driver, driverIdx) => (
                      <tr key={driver} className="align-middle">
                        <td className="px-2 py-1">
                          <span className="inline-flex rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium">
                            {driver}
                          </span>
                        </td>
                        <td className="px-2 py-1">
                          <div className="w-full rounded-full border border-white/10 bg-black/50 px-2 py-1 text-xs">
                            {Array.isArray(session?.results)
                              ? session.results[driverIdx] || ""
                              : session?.results?.[driver] || ""}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
