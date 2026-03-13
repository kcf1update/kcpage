// src/content/nextRaceContent.js
import { DRIVERS, DRIVER_IDS } from "./drivers";

// Back compatibility (older code expects an array of names)
export const NEXT_RACE_DRIVERS = DRIVERS.map((d) => d.name);

// Tables use stable driver IDs
export const NEXT_RACE_DRIVER_IDS = DRIVER_IDS;

// =====================================================
// 1) BLANK TEMPLATES
// =====================================================

// Practice template
function makeLapResultsTemplate() {
  return Object.fromEntries(
    DRIVER_IDS.map((id) => [
      id,
      {
        lapTime: "", // "1:22.456"
        laps: "", // 22
        status: "", // "DNF" / "DNS" / "DSQ" or leave blank
      },
    ])
  );
}

// Qualifying template
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

// Race template
function makeRaceResultsTemplate() {
  return Object.fromEntries(
    DRIVER_IDS.map((id) => [
      id,
      {
        pos: "", // 1..22 (or leave blank)
        grid: "", // starting position
        points: "", // points scored
        status: "", // "1:32:10.123" or "+5.321s" or "DNF"
      },
    ])
  );
}

// =====================================================
// 2) PASTE PARSERS
// =====================================================

// PRACTICE paste format:
// DRIVER_ID, LAPTIME, LAPS, STATUS(optional)
function parseLapPaste(text) {
  const base = makeLapResultsTemplate();

  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
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

// QUALIFYING paste format:
// DRIVER_ID, Q1, Q2, Q3
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

// RACE paste format:
// DRIVER_ID, POS, STATUS(time/gap/DNF), GRID, POINTS
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

    const id = (parts[0] || "").toUpperCase();
    if (!id || !base[id]) continue;

    const rawPos = (parts[1] || "").toUpperCase();
    const rawStatus = parts[2] || "";
    const rawGrid = parts[3] || "";
    const rawPoints = parts[4] || "";

    const isDNF =
      rawPos === "DNF" || rawPos === "DNS" || String(rawStatus).toUpperCase() === "DNF";

    const pos = isDNF ? null : toIntOrNull(rawPos);
    const grid = toIntOrNull(rawGrid);
    const points = toIntOrNull(rawPoints);

    base[id] = {
      pos,
      status: isDNF ? rawPos : rawStatus,
      grid,
      points,
    };
  }

  return base;
}

// =====================================================
// 3) YOUR PASTE BOXES (EDIT THESE ONLY)
// =====================================================

const PASTE_P1 = `
NOR,1m33.296s,28
VER,1m34.541s,24
RUS,1m32.741s,28
PIA,1m33.472s,27
LEC,1m33.599s,27
HAM,1m34.129s,25
ALB,1m35.480s,30
SAI,1m35.679s,17
ALO,1m35.856s,18
STR,1m37.224s,20
OCO,1m34.877s,24
BEA,1m34.426s,27
HUL,1m34.639s,26
BOR,1m34.828s,25
GAS,1m34.676s,27
COL,1m34.947s,25
PER,1m39.200s,13
BOT,1m36.057s,24
LAW,1m34.773s,28
LIN,1m37.896s,6
HAD,1m34.856s,25
ANT,1m32.861s,29
`;

const PASTE_P2 = `
NOR,1m33.783s,1m33.086s,1m32.141s
VER,1m34.170s,	1m33.564s,	1m33.254s,,
RUS,1m33.030s,1m32.241s,1m31.520s
PIA,1m33.813s,	1m33.038s,	1m32.224s
LEC,1m33.194s,	1m32.602s,	1m32.528s
HAM,1m33.148s,1m33.042s,1m32.161s
ALB,1m35.305s,,
SAI,1m34.761s,,	 
ALO,1m35.581s,,
STR,1m36.151s,,
OCO,1m34.087s,	1m33.639s,
BEA,1m34.280s,	1m33.501s,	1m33.409s
HUL,1m33.997s,	1m33.635s,
BOR,1m34.291s,	1m33.774s,	 
GAS,1m33.970s,	1m33.405s,	1m32.888s
COL,1m34.592s,	1m34.327s,	
PER,No time Set 
BOT,1m37.378s,,
LAW,1m34.110s,	1m33.714s,
LIN,1m34.495s,	1m34.048s,
HAD,1m34.447s,	1m33.620s,	1m33.723s
ANT,1m33.455s,1m32.291s	,1m31.809s
`;

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

const PASTE_Q = `
NOR,,,
VER,,,
RUS,,,
PIA,,,
LEC,,,
HAM,,,
ALB,,,
SAI,,,
ALO,,,
STR,,,
OCO,,,
BEA,,,
HUL,,,
BOR,,,
GAS,,,
COL,,,
PER,,,
BOT,,,
LAW,,,
LIN,,,
HAD,,,
ANT,,,
`;

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
  raceName: "HEINEKEN CHINESE GRAND PRIX",
  raceDates: "Mar 13th–15th, 2026",
  location: "Shanghai, China",
  trackInfoUrl: "/img/tracks/Albertpark.jpg",

  weather: `Thr: - ☀️ Sunny 12°
Fri: —☀️ Sunny 15°
Sat: — ☀️ Sunny 17°
Sun: —⛅ Sunny Cloudy 23°`,

 sessions: [
  {
    id: "p1",
    type: "practice",
    label: "Practice 1",
    time: "Complete Results below",
    trackNote: "",
    extraNote: "Dry Track",
    results: parseLapPaste(PASTE_P1),
  },
  {
  id: "p2",
  type: "sprint_shootout",
  label: "Sprint Qualifying",
  time: "Complete results below",
  trackNote: "",
  extraNote: "Dry Track",
  results: parseQualifyingPaste(PASTE_P2),
},
  {
  id: "p3",
  type: "sprint_race",
  label: "Sprint Race",
  time: "12:00 am AST",
  trackNote: "",
  extraNote: "",
  results: parseRacePaste(PASTE_P3),
},
  {
    id: "q",
    type: "qualifying",
    label: "Qualifying",
    time: "4:00 am AST",
    trackNote: "",
    extraNote: "",
    results: parseQualifyingPaste(PASTE_Q),
  },
  {
    id: "race",
    type: "race",
    label: "Race",
    time: "4:00 am AST",
    trackNote: "",
    extraNote: "",
    results: parseRacePaste(PASTE_RACE),
  },
]
};