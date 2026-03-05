// src/PointsPage.jsx
import React, { useMemo } from "react";

import AdBar from "./AdBar.jsx";
import TopCard from "./components/TopCard";
import PageNav from "./components/PageNav";

import { DRIVERS } from "./content/drivers";
import {
  pointsDrivers,
  pointsTeams, // your team color list lives here
  constructorPointsOverride,
} from "./content/pointsContent";

import { nextRaceContent } from "./content/nextRaceContent";

// ---------------- helpers ----------------
function safeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function teamKey(name) {
  return String(name || "").trim() || "Unknown";
}

function flagSrc(countryCode) {
  const cc = String(countryCode || "").toLowerCase().trim();
  return cc ? `/flags/${cc}.png` : "";
}

function buildManualPointsMap(pointsDriversAny) {
  // supports:
  //  - array of { id, points } / { driverId, points } / { code, pts } etc
  //  - object map { NOR: 25, VER: 18 }
  const out = {};

  if (Array.isArray(pointsDriversAny)) {
    for (const p of pointsDriversAny) {
      const id = (p?.driverId ?? p?.id ?? p?.key ?? p?.code ?? "").toString().toUpperCase();
      if (!id) continue;
      out[id] = safeNum(p?.points ?? p?.pts ?? p?.value);
    }
    return out;
  }

  if (pointsDriversAny && typeof pointsDriversAny === "object") {
    for (const [k, v] of Object.entries(pointsDriversAny)) {
      out[String(k).toUpperCase()] = safeNum(v);
    }
    return out;
  }

  return out;
}

function buildRacePointsMapFromNextRace(content) {
  // Pull points ONLY from the Race session in nextRaceContent
  // Expected shape: session.results = { NOR: { points: 25, ... }, ... }
  const out = {};

  const sessions = Array.isArray(content?.sessions) ? content.sessions : [];
  const raceSession =
    sessions.find((s) => s?.type === "race" || s?.id === "race") || null;

  const results = raceSession?.results && typeof raceSession.results === "object"
    ? raceSession.results
    : {};

  for (const [driverId, row] of Object.entries(results)) {
    const id = String(driverId || "").toUpperCase();
    if (!id) continue;
    out[id] = safeNum(row?.points);
  }

  return out;
}

export default function PointsPage() {
  const { driverRows, teamRows, top3 } = useMemo(() => {
    const driversBase = Array.isArray(DRIVERS) ? DRIVERS : [];

    // 1) manual/base points (optional)
    const manualMap = buildManualPointsMap(pointsDrivers);

    // 2) race centre points (from nextRaceContent race session)
    const raceMap = buildRacePointsMapFromNextRace(nextRaceContent);

    // 3) total per driver = manual + race
    const driverRowsBuilt = driversBase.map((d) => {
      const id = (d?.id ?? "").toString().toUpperCase();
      const name = d?.name ?? "Unknown Driver";
      const team = teamKey(d?.team);
      const countryCode = d?.countryCode ?? "";

      const totalPoints = safeNum(manualMap[id]) + safeNum(raceMap[id]);

      return {
        id: id || name,
        name,
        team,
        countryCode,
        flag: flagSrc(countryCode),
        points: totalPoints,
      };
    });

    // sort by points desc, then name
    driverRowsBuilt.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.name.localeCompare(b.name);
    });

    const top3Built = driverRowsBuilt.slice(0, 3);

    // ---------------- TEAM COLORS ----------------
    // pointsTeams can be either:
    //  A) your existing "team list" objects: { id, name, color }
    //  B) or previously used as "points list" (older)
    // We'll treat it as a team color registry if it has name+color.
    const teamColorByName = new Map();

    if (Array.isArray(pointsTeams)) {
      for (const t of pointsTeams) {
        const name = teamKey(t?.name ?? t?.team ?? t?.constructor);
        const color = t?.color || "";
        if (name) teamColorByName.set(name, color);
      }
    } else if (pointsTeams && typeof pointsTeams === "object") {
      // map style { "McLaren": "#FF8700" }
      for (const [k, v] of Object.entries(pointsTeams)) {
        teamColorByName.set(teamKey(k), String(v || ""));
      }
    }

    // ---------------- TEAM POINTS ----------------
    // If pointsTeams is a points-table instead of a registry, we still compute from drivers
    // (the whole point is "auto from Race Centre")
    const sum = new Map();
    for (const r of driverRowsBuilt) {
      const k = teamKey(r.team);
      sum.set(k, safeNum(sum.get(k)) + safeNum(r.points));
    }

    let teamRowsBuilt = Array.from(sum.entries()).map(([team, points]) => ({
      team,
      points,
      color: teamColorByName.get(team) || "",
    }));

    // apply constructorPointsOverride if present (object map { teamName: points })
    if (constructorPointsOverride && typeof constructorPointsOverride === "object") {
      const overrides = constructorPointsOverride;
      teamRowsBuilt = teamRowsBuilt.map((t) => ({
        ...t,
        points: overrides[t.team] != null ? safeNum(overrides[t.team]) : t.points,
      }));
      for (const [k, v] of Object.entries(overrides)) {
        const tk = teamKey(k);
        if (!teamRowsBuilt.some((x) => x.team === tk)) {
          teamRowsBuilt.push({
            team: tk,
            points: safeNum(v),
            color: teamColorByName.get(tk) || "",
          });
        }
      }
    }

    teamRowsBuilt.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.team.localeCompare(b.team);
    });

    return {
      driverRows: driverRowsBuilt,
      teamRows: teamRowsBuilt,
      top3: top3Built,
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#545454]">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-3 sm:gap-4 px-4 pt-3 pb-8 sm:pt-4 sm:pb-10">
        {/* TOP CARD */}
        <TopCard>
          <TopCard.Header
            title="Driver & Team Points"
            subtitle="Driver points include Race Centre “Race” points automatically."
            logoSrc="/img/kcs-f1-car.png"
            logoClassName="h-16 sm:h-18 md:h-20 lg:h-24 w-auto"
            titleClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.05] break-words"
          />
        </TopCard>

        {/* NAV */}
        <div className="flex items-center">
          <PageNav />
          <div className="shrink-0" />
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Top 3 */}
            <section className="rounded-3xl bg-[#2f2f2f] text-white border border-white/10 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
              <div className="text-lg font-extrabold">Top 3 Drivers</div>
              <div className="text-xs text-white/70 mt-1">Current championship leaders</div>

              <ol className="mt-4 space-y-2 text-sm">
                {top3.map((d, idx) => (
                  <li key={d.id} className="flex items-start gap-2">
                    <span className="text-yellow-300 font-bold">
                      {idx === 0 ? "1st:" : idx === 1 ? "2nd:" : "3rd:"}
                    </span>

                    <span className="inline-flex items-center gap-2 font-semibold">
                      {d.flag ? (
                        <img
                          src={d.flag}
                          alt=""
                          className="h-4 w-6 rounded-sm object-cover border border-white/10"
                          loading="lazy"
                        />
                      ) : null}
                      {d.name}
                    </span>

                    <span className="text-white/70">({d.team})</span>
                    <span className="ml-auto text-white/70">({d.points})</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Ads */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-1 gap-4">
                <AdBar />
                <AdBar />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Driver Standings */}
            <section className="rounded-3xl bg-[#2f2f2f] text-white border border-white/10 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
              <div className="text-lg font-extrabold">Driver Standings</div>
              <div className="text-xs text-white/70 mt-1">
                Driver points include Race Centre “Race” points automatically.
              </div>

              <div className="mt-4 grid grid-cols-12 text-[11px] text-white/70 px-2">
                <div className="col-span-1">POS</div>
                <div className="col-span-5">DRIVER</div>
                <div className="col-span-4">TEAM</div>
                <div className="col-span-2 text-right">POINTS</div>
              </div>

              <div className="mt-2 max-h-[420px] overflow-y-auto pr-2">
                {driverRows.map((d, i) => (
                  <div
                    key={d.id}
                    className="grid grid-cols-12 items-center gap-2 px-2 py-2 rounded-xl hover:bg-white/5"
                  >
                    <div className="col-span-1 text-white/70">{i + 1}</div>

                    <div className="col-span-5">
                      <span className="inline-flex items-center gap-2 rounded-full bg-black/25 border border-white/10 px-3 py-1 text-[12px] font-semibold">
                        {d.flag ? (
                          <img
                            src={d.flag}
                            alt=""
                            className="h-4 w-6 rounded-sm object-cover border border-white/10"
                            loading="lazy"
                          />
                        ) : null}
                        {d.name}
                      </span>
                    </div>

                    <div className="col-span-4 text-[12px] text-white/80">
                      {d.team}
                    </div>

                    <div className="col-span-2 text-right">
                      <span className="inline-flex min-w-[42px] justify-center rounded-full bg-black/35 border border-white/10 px-3 py-1 text-[12px] font-semibold">
                        {d.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Constructor Standings */}
            <section className="rounded-3xl bg-[#2f2f2f] text-white border border-white/10 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
              <div className="text-lg font-extrabold">Constructor Standings</div>
              <div className="text-xs text-white/70 mt-1">
                Team points auto-sum from driver totals (including Race Centre points).
              </div>

              <div className="mt-4 space-y-3">
                {teamRows.map((t, i) => (
                  <div key={t.team} className="flex items-center gap-3">
                    <div className="w-6 text-white/70 text-[12px]">{i + 1}</div>

                    <div className="flex-1">
                      <div className="rounded-full bg-black/25 border border-white/10 px-4 py-2 text-[12px] font-semibold inline-flex items-center gap-2 w-full">
                        {/* team color dot (no logos) */}
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full border border-white/20"
                          style={{ backgroundColor: t.color || "rgba(255,255,255,0.25)" }}
                          aria-hidden="true"
                        />
                        {t.team}
                      </div>
                    </div>

                    <div className="w-10 text-right text-[12px] font-semibold">
                      {t.points}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Mobile ads */}
            <div className="lg:hidden">
              <AdBar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}