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
NOR,1m31.798s	20,
VER,1m32.457s	27,
RUS,1m31.666s 27,
PIA,1m31.865s	23,
LEC,1m31.955s	25,
HAM,1m32.040s	23,
ALB,1m33.697s	22,
SAI,1m33.383s	26,
ALO,1m36.362s	11,
STR,1m35.294s	22,
OCO,1m32.601s	23,
BEA,1m32.900s	27,
HUL,1m32.798s	26,
BOR,1m32.759s	27,
GAS,1m32.978s	25,
COL,1m33.361s	24,
PER,1m34.221s 18,
BOT,1m34.490s	24,
LAW,1m32.529s	27,
LIN,1m32.665s	29,
HAD,1m32.803s	27,
ANT,1m31.692s	26,
`;

const PASTE_P2 = `
NOR,1m30.649s	17,
VER,1m31.509s	29,
RUS,1m30.338s	29,
PIA,1m30.133s	29,
LEC,1m30.846s	28,
HAM,1m30.980s	27,
SAI,1m31.608s	30,	 
ALO,1m33.596s	24,
STR,1m33.951s	21,
OCO,1m31.532s	29,
BEA,1m31.498s	27,
HUL,1m31.441s	27,
BOR,1m31.933s	11, 
GAS,1m31.734s	29,
COL,1m32.438s	28,	
PER,1m33.689s	14, 
BOT,1m32.615s	28,
LAW,1m31.590s	31,
LIN,No time set	1,
HAD,1m31.759s	29,
ANT,1m30.225s	27,
`;

const PASTE_P3 = `
NOR,1m30.600s	13,,
VER,1m30.910s	22,,
RUS,1m29.616s	18,,
PIA,1m30.364s	19,,
LEC,1m30.229s	20,,
HAM,1m30.383s	23,,
ALB,1m31.733s	20,,
SAI,1m31.829s	26,,
ALO,1m33.529s	14,,
STR,1m33.485s	19,,
OCO,1m31.326s	22,,
BEA,1m31.558s	18,,
HUL,1m30.358s	21,,
BOR1m31.000s	21,,,
GAS,1m31.082s	20,,
COL,1m31.759s	25,,
PER,1m32.540s	18,,
BOT,1m32.503s	20,,
LAW,1m31.097s	21,,
LIN,1m31.288s	17,,
HAD,1m31.094s	21,,
ANT,1m29.362s	18,,
`;

const PASTE_Q = `
NOR,1m30.401s	1m29.795s	1m29.409s,,
VER,1m30.519s	1m30.262s,,
RUS,1m29.967s	1m29.686s	1m29.076s,,
PIA,1m30.200s	1m29.451s	1m29.132s,,
LEC,1m29.915s	1m29.303s	1m29.405s,,
HAM,1m30.309s	1m.29.589s	1m29.567s,,
ALB,1m31.088s	,,
SAI,1m30.927s	1m31.033s	,, 
ALO,1m32.646s,,
STR,1m32.920s	,,
OCO,1m30.915s	1m30.309s,,
BEA,1m31.090s,,
HUL,1m30.358s	1m30.387s	,,
BOR,1m30.359s	1m29.990s	1m30.274s,,
GAS,1m30.584s	1m29.874s	1m29.691s,,
COL,1m30.931s	1m30.627s,,	
PER,1m32.206s,, 
BOT,1m32.330s,,
LAW,1m30.657s	1m30.495s	,,
LIN,1m30.781s	1m30.109s	1m30.319s,,
HAD,1m30.662s	1m30.104s	1m29.978s,,
ANT,1m30.035s,	1m29.048s,	1m28.778s
`;

const PASTE_RACE = `
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

// =====================================================
// 4) CONTENT
// =====================================================

export const nextRaceContent = {
  raceName: "FORMULA 1 ARAMCO JAPANESE GRAND PRIX ",
  raceDates: "Mar 26th–29th, 2026",
  location: "Suzuka Circuit, Japan",
  trackInfoUrl: "/img/tracks/japanesetrack.jpg",

  weather: `Thr: - 🌧️ Rain 15°
Fri: —☁️ Cloudy 17°
Sat: — ⛅ Sunny Cloudy 22°
Sun: —⛅  Cloudy 22°`,

 sessions: [
  {
    id: "p1",
    type: "practice",
    label: "Practice 1   Note: Jack Crawfrod is in for Fernando Alonso",
    time: "complete results below",
    trackNote: "",
    extraNote: "",
    results: parseLapPaste(PASTE_P1),
  },
  {
  id: "p2",
  type: "practice",
  label: "Practice 2",
  time: "complete results below",
  trackNote: "",
  extraNote: "",
  results: parseLapPaste(PASTE_P2),
},
{
  id: "p3",
  type: "practice",
  label: "Practice 3",
  time: "complete results below",
  trackNote: "",
  extraNote: "",
  results: parseLapPaste(PASTE_P3),
},
  {
    id: "q",
    type: "qualifying",
    label: "Qualifying",
    time: "complete results below",
    trackNote: "",
    extraNote: "",
    results: parseQualifyingPaste(PASTE_Q),
  },
  {
    id: "race",
    type: "race",
    label: "Race",
    time: "2:00 AM AST",
    trackNote: "",
    extraNote: "",
    results: parseRacePaste(PASTE_RACE),
  },
]
};