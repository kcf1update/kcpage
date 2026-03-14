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
NOR,4,4.433s,3,5,
VER,9,11.619s,8,,
RUS,1,19,1,8,
PIA,6,6.809s,5,3,
LEC,2,0.674s,6,7,
HAM,3,2.554s,4,6,
ALB,16,20.014s,18,,
SAI,12,15.753s,17,,
ALO,17,21.599s,19,,
STR,18,21.971s,20,,,
OCO,10,13.887s,12,,
BEA,8,11.271s,9,1,
HUL,20,7 laps,11,,,
BOR,13,15.858s,14,,
GAS,11,14.780s,7,,
COL,14,16.393s,16,,
PER,19,28.241s,22,,
BOT,21,7 laps,21,,
LAW,7,10.9s,13,2,
LIN,22,8 laps,15
HAD,15,16.430s,10,,
ANT,5,5.688s,2,4,
`;

const PASTE_Q = `
NOR,1m33.535s,	1m32.910s,	1m32.608s
VER,1m33.417s,	1m33.098s,	1m33.002s
RUS,1m33.262s,	1m32.523s,	1m32.286s
PIA,1m33.590s,	1m33.130s,	1m32.550s
LEC,1m33.175s,	1m32.486s,	1m32.428s
HAM,1m33.522s,	1m32.567s,	1m32.415s
ALB,1m34.772s,
SAI,1m34.317s,
ALO,1m35.203s,
STR,1m35.995s,
OCO,1m33.974s,	1m33.538s,	
BEA,1m33.687s,	1m33.197s,	1m33.292s
HUL,1m34.116s,	1m33.354s,
BOR,1m33.549s,	1m33.965s,	
GAS,1m33.788s,	1m33.003s,	1m32.873s
COL,1m33.634s,	1m33.357s,
PER,1m35.906s,
BOT,1m35.436s,
LAW,1m34.139s,	1m33.765s,	
LIN,1m33.906s,	1m33.784s,	 
HAD,1m33.632s,	1m33.352s,	1m33.121s
ANT,1m33.305s,	1m32.443s,	1m32.064s
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
  time: "Complete results below",
  trackNote: "",
  extraNote: "Dry Track",
  results: parseRacePaste(PASTE_P3),
},
  {
    id: "q",
    type: "qualifying",
    label: "Qualifying",
    time: "Complete results below",
    trackNote: "",
    extraNote: "Dry Track",
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