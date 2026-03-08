// src/content/nextRaceContent.js
import { DRIVERS, DRIVER_IDS } from "./drivers";

// Back compatibility (older code expects an array of names)
export const NEXT_RACE_DRIVERS = DRIVERS.map((d) => d.name);

// Tables use stable driver IDs
export const NEXT_RACE_DRIVER_IDS = DRIVER_IDS;

// =====================================================
// 1) BLANK TEMPLATES (22 drivers)
// =====================================================

// Practice template (22 drivers)
function makeLapResultsTemplate() {
  return Object.fromEntries(
    DRIVER_IDS.map((id) => [
      id,
      {
        lapTime: "", // "1:22.456" (Practice)
        laps: "",    // 22
        status: "",  // "DNF" / "DNS" / "DSQ" or leave blank
      },
    ])
  );
}

// Qualifying template (22 drivers)
function makeQualifyingResultsTemplate() {
  return Object.fromEntries(
    DRIVER_IDS.map((id) => [
      id,
      {
        q1: "", // "1m20.123s"
        q2: "", // "1m19.654s"
        q3: "", // "1m18.518s"
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

// PRACTICE paste format (one driver per line):
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

// QUALIFYING paste format (one driver per line):
// DRIVER_ID, Q1, Q2, Q3
// Examples:
// RUS,1m19.507s,1m18.934s,1m18.518s
// GAS,1m20.400s,1m19.950s,
// ALO,1m20.901s,,
function parseQualifyingPaste(text) {
  const base = makeQualifyingResultsTemplate();

  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const parts = line.split(/[\t,|]+/).map((p) => p.trim());

    const id = (parts[0] || "").toUpperCase();
    if (!id || !base[id]) continue;

    const q1 = parts[1] || "";
    const q2 = parts[2] || "";
    const q3 = parts[3] || "";

    base[id] = { q1, q2, q3 };
  }

  return base;
}

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
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  for (const line of lines) {
    const parts = line.split(/[\t,|]+/).map((p) => p.trim());

    // Format: DRIVER_ID, POS, STATUS(time/gap/DNF), GRID, POINTS
    const id = (parts[0] || "").toUpperCase();
    if (!id || !base[id]) continue;

    const rawPos = (parts[1] || "").toUpperCase();
    const rawStatus = parts[2] || "";
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

// Practice: DRIVER_ID, LAPTIME, LAPS, STATUS(optional)
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

// Practice: DRIVER_ID, LAPTIME, LAPS, STATUS(optional)
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

// Practice: DRIVER_ID, LAPTIME, LAPS, STATUS(optional)
const PASTE_P3 = `
NOR,1:20.443,22
VER,1:20.197,15
RUS,1:19.053,23
PIA,1:20.087,17
LEC,1:19.827,20
HAM,1:19.669,22
ALB,1:21.664,17
SAI,No Time,1
ALO,1:22.720,20
STR,No Laps,0
OCO,1:20.983,19
BEA,1:20.778,18
HUL,1:21.067,22
BOR,1:20.459,19
GAS,1:21.071,26
COL,1:21.413,22
PER,1:24.397,21
BOT,1:23.514,12
LAW,1:20.890,13
LIN,1:20.838,15
HAD,1:20.137,15
ANT,1:20.324,18
`;

// Qualifying: DRIVER_ID, Q1, Q2, Q3
const PASTE_Q = `
NOR,1m20.010s,1m19.882s,1m19.475s
VER,No time set,,
RUS,1m19.507s,1m18.934s,1m18.518s
PIA,1m19.664s,1m19.525s,1m19.380s
LEC,1m20.226s,1m19.357s,1m19.327s
HAM,1m19.811s,1m19.921s,1m19.478s
ALB,1m21.051s,1m20.941s,
SAI,No time set,,
ALO,1m21.969s,,
STR,No time set,,
OCO,1m20.759s,1m20.491s,,
BEA,1m21.247s,1m20.311s,
HUL,1m21.024s,1m20.303s,
BOR,1m20.495s,	1m20.221s,	No time set
GAS,1m21.138s,1m20.501s,
COL,1m21.200s,1m21.270s,
PER,1m22.605s	,,
BOT,1m23.244s,,
LAW,1m20.491s,1m20.144s	,1m19.994s
LIN,1m20.409s,1m19.971s,1m21.247s
HAD,1m20.023s,1m19.653s,1m19.303s
ANT,1m20.120s,1m19.435s,1m18.811s
`;

// Race: DRIVER_ID, POS, STATUS(time/gap/DNF), GRID, POINTS
const PASTE_RACE = `
NOR,5,+51.741s,6,10
VER,6,+54.617s,20,8
RUS,1,58 laps,1,25
PIA,DNS,DNS,5,0
LEC,3,+12.519s,4,15
HAM,4,+16.144s,7,12
ALB,12,+1 Lap,15,0
SAI,15,+2 Laps,21,0
ALO,DNF,0 laps,17,0
STR,17,+15 Laps,22,0,
OCO,11,+1 Lap,13,0
BEA,7,+1 Lap,12,6
HUL,DNS,DNS,11,0
BOR,9,+1 Lap,10,2
GAS,10,+1 Lap,14,1
COL,14,+2 Laps,16,0
PER,16,+3 Laps,18,0
BOT,DNF,DNF,19,0
LAW,13,+1 Lap,8,0
LIN,8,+1 Lap,9,4
HAD,DNF,DNF,3,0
ANT,2,+2.974s,2,18
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
      label: "Practice 2",
      time: "Complete full results below",
      trackNote: "—",
      extraNote: "Dry Track",
      results: parseLapPaste(PASTE_P2),
    },
    {
      id: "p3",
      type: "practice",
      label: "Practice 3",
      time: "Complete full results below",
      trackNote: "—",
      extraNote: "Dry Track",
      results: parseLapPaste(PASTE_P3),
    },
    {
      id: "q",
      type: "qualifying",
      label: "Qualifying",
      time: "Complete full results below",
      trackNote: "—",
      extraNote: "Dry Track",
      results: parseQualifyingPaste(PASTE_Q),
    },
    {
      id: "race",
      type: "race",
      label: "Race",
      time: "Russell Wins, full results below.",
      extraNote: "Dry Track",
      results: parseRacePaste(PASTE_RACE),
    },
  ],
};