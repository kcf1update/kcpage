// src/content/nextRaceContent.js
import { DRIVERS, DRIVER_IDS } from "./drivers";

// Back compatibility (older code expects an array of names)
export const NEXT_RACE_DRIVERS = DRIVERS.map((d) => d.name);

// Tables use stable driver IDs
export const NEXT_RACE_DRIVER_IDS = DRIVER_IDS;

// =====================================================
// 1) BLANK TEMPLATES (22 drivers)
// =====================================================

// Practice / Qualy template (22 drivers)
function makeLapResultsTemplate() {
  return Object.fromEntries(
    DRIVER_IDS.map((id) => [
      id,
      {
        lapTime: "", // "1:22.456" (Practice/Qualy)
        laps: "",    // 22
        status: "",  // "DNF" / "DNS" / "DSQ" or leave blank
      },
    ])
  );
}

// Race template (22 drivers)
function makeRaceResultsTemplate() {
  return Object.fromEntries(
    DRIVER_IDS.map((id) => [
      id,
      {
        pos: "",      // 1..22 (or leave blank)
        grid: "",     // starting position
        points: "",   // points scored
        status: "",   // "1:32:10.123" or "+5.321s" or "DNF"
      },
    ])
  );
}

// =====================================================
// 2) PASTE PARSERS
// =====================================================

// PRACTICE / QUALY paste format (one driver per line):
// DRIVER_ID, LAPTIME, LAPS, STATUS(optional)
// Examples:
// NOR,1:21.234,18
// VER,1:21.455,20
// LAW,,0,DNF
function parseLapPaste(text) {
  const base = makeLapResultsTemplate();

  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    // allow comma, tab, or pipe separators
    const parts = line.split(/[\t,|]+/).map((p) => p.trim());

    const id = (parts[0] || "").toUpperCase();
    if (!id || !base[id]) continue;

    const lapTime = parts[1] || "";
    const laps = parts[2] || "";
    const status = parts[3] || "";

    base[id] = { lapTime, laps, status };
  }

  return base;
}

// RACE paste format (one driver per line):
// POS, DRIVER_ID, GRID, POINTS, STATUS(optional)
// Examples:
// 1,NOR,1,25,1:42:06.304
// 2,VER,2,18,+0.895s
// NC,LAW,10,0,DNF
// RACE paste format (one driver per line):
// DRIVER_ID, POS, STATUS(time/gap/DNF), GRID, POINTS
// Example:
// NOR,1,1:42:06.304,2,25
// VER,2,+0.895s,1,18
// LAW,DNF,DNF,19,0
function parseRacePaste(text) {
  const base = makeRaceResultsTemplate();

  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const toIntOrNull = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return null;                 // <- key fix: "" stays null, not 0
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  for (const line of lines) {
    const parts = line.split(/[\t,|]+/).map((p) => p.trim());

    // Format: DRIVER_ID, POS, STATUS(time/gap/DNF), GRID, POINTS
    const id = (parts[0] || "").toUpperCase();
    if (!id || !base[id]) continue;

    const rawPos = (parts[1] || "").toUpperCase();  // "1" .. "22" or "DNF" or blank
    const rawStatus = parts[2] || "";               // time/gap or "DNF"
    const rawGrid = parts[3] || "";
    const rawPoints = parts[4] || "";

    const isDNF =
      rawPos === "DNF" || String(rawStatus).toUpperCase() === "DNF";

    const pos = isDNF ? null : toIntOrNull(rawPos);
    const grid = toIntOrNull(rawGrid);
    const points = toIntOrNull(rawPoints);

    base[id] = {
      pos,
      status: isDNF ? "DNF" : rawStatus,
      grid,
      points,
    };
  }

  return base;
}
// =====================================================
// 3) YOUR PASTE BOXES (EDIT THESE ONLY)
// =====================================================

// Practice/Qualy: DRIVER_ID, LAPTIME, LAPS, STATUS(optional)
const PASTE_P1 = `
NOR,1:24.391,7
VER,1:20.789,27

,
RUS,1:21.371,26


PIA,1:21.342,21


LEC,1:20.267,33
HAM,1:20.736,30


ALB,1:23.130,24


SAI,1:22.323,30


ALO,No laps,,,
STR,1:50.334,3


OCO,1:22.161,28

BEA,1:22.682,25


HUL,1:21.969,21


BOR,1:21.696,23


GAS,1:24.035,27


COL,1:23.325,26


PER,1:24.620,14


BOT,1:24.022,24


LAW,1:22.613,28


LIN,1:21.313,22


HAD,1:21.087,24


ANT,1:21.376,24


`;
// Practice/Qualy: DRIVER_ID, LAPTIME, LAPS, STATUS(optional)
const PASTE_P2 = `
NOR,1:20.794,29
VER,1:20.366,13
RUS,1:20.049,28
PIA,1:19.729,26
LEC,1:20.291,30
HAM,1:20.050,32
ALB,1:21.847,32
SAI,1:22.253,10
ALO,1:24.662,18
STR,1:25.816,13
OCO,1:21.179,29
BEA,1:21.326,31
HUL,1:21.351,34
BOR,1:21.668,28
GAS,1:22.167,16
COL,1:22.619,27
PER,No Laps,0
BOT,1:23.660,28
LAW,1:21.358,29
LIN,1:20.922,30
HAD,1:20.941,28
ANT,1:19.943,31
`;
// Practice/Qualy: DRIVER_ID, LAPTIME, LAPS, STATUS(optional)
const PASTE_P3 = `
NOR,,,,
VER,,,,
RUS,,,,
PIA,,,,
LEC,,,,
HAM,,,,
ALB,,,,
SAI,,,,
ALO,,,,
STR,,,,
OCO,,,,
BEA,,,,
HUL,,,,
BOR,,,,
GAS,,,,
COL,,,,
PER,,,,
BOT,,,,
LAW,,,,
LIN,,,,
HAD,,,,
ANT,,,,
`;
// Practice/Qualy: DRIVER_ID, LAPTIME, LAPS, STATUS(optional)
const PASTE_Q = `
NOR,,,,
VER,,,,
RUS,,,,
PIA,,,,
LEC,,,,
HAM,,,,
ALB,,,,
SAI,,,,
ALO,,,,
STR,,,,
OCO,,,,
BEA,,,,
HUL,,,,
BOR,,,,
GAS,,,,
COL,,,,
PER,,,,
BOT,,,,
LAW,,,,
LIN,,,,
HAD,,,,
ANT,,,,
`;

// Race: DRIVER_ID, POS, STATUS(time/gap/DNF), GRID, POINTS
const PASTE_RACE = `
NOR,,,,
VER,,,, 
RUS,,,, 
PIA,,,, 
LEC,,,,
HAM,,,, 
ALB,,,,
SAI,,,, 
ALO,,,,
STR,,,, 
OCO,,,, 
BEA,,,, 
HUL,,,, 
BOR,,,, 
GAS,,,, 
COL,,,, 
PER,,,, 
BOT,,,, 
LAW,,,, 
LIN,,,, 
HAD,,,, 
ANT,,,, 
`;

// =====================================================
// 4) CONTENT
// =====================================================

export const nextRaceContent = {
  raceName: "Australian Grand Prix",
  raceDates: "Mar 5th–8th, 2026",
  location: "Melbourne, Australia",
  trackInfoUrl: "/img/tracks/Albertpark.jpg",

  weather: `Thr: - ☀️ Sunny 22°
  Fri: —☀️ Sunny 22°
Sat: — ⛅ Partly Cloudy 19°
Sun: —☀️ Sunny 23° `,

  sessions: [
    {
      id: "p1",
      type: "practice",
      label: "Practice 1",
      time: "Complete full results below",
      trackNote: "Green Track",
      extraNote: "Dry Track",
      results: parseLapPaste(PASTE_P1),
    },
    {
      id: "p2",
      type: "practice",
      label: "Practise 2",
      time: "Complete full results below",
      trackNote: "—",
      extraNote: "Dry Track",
      results: parseLapPaste(PASTE_P2),
    },
    {
      id: "p3",
      type: "practice",
      label: "Practice 3",
      time: "Fri 9:30 PM AST",
      trackNote: "—",
      extraNote: "—",
      results: parseLapPaste(PASTE_P3),
    },
    {
      id: "q",
      type: "qualifying",
      label: "Qualifying",
      time: "Sat 1:00 AM AST",
      trackNote: "—",
      extraNote: "—",
      results: parseLapPaste(PASTE_Q),
    },
    {
      id: "race",
      type: "race",
      label: "Race",
      time: "Sun 12:00 AM AST",
      extraNote: "—",
      results: parseRacePaste(PASTE_RACE),
    },
  ],
};