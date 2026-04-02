import { DRIVER_IDS } from "./drivers";

// =====================================================
// 1) BLANK TEMPLATES
// =====================================================

function makeRaceResultsTemplate() {
  return Object.fromEntries(
    DRIVER_IDS.map((id) => [
      id,
      {
        pos: "",
        grid: "",
        points: "",
        status: "",
      },
    ])
  );
}

// =====================================================
// 2) PASTE PARSER
// =====================================================

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
      rawPos === "DNF" ||
      rawPos === "DNS" ||
      String(rawStatus).toUpperCase() === "DNF" ||
      String(rawStatus).toUpperCase() === "DNS";

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

const PASTE_AUSTRALIA_RACE = `
NOR,5,+51.741s,6,10
VER,6,+54.617s,20,8
RUS,1,58 laps,1,25
PIA,DNS,DNS,5,0
LEC,3,+12.519s,4,15
HAM,4,+16.144s,7,12
ALB,12,+1 Lap,15,0
SAI,15,+2 Laps,21,0
ALO,DNF,0 laps,17,0
STR,17,+15 Laps,22,0
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
const PASTE_CHINA_RACE = `
NOR,DNS,DNS,6
VER,DNF,DNF,8
RUS,2,+5.515s,2,18
PIA,DNS,DNS,5
LEC,4,+28.894s,4,12
HAM,3,+25.267s,3,15
ALB,DNS,DNS,18
SAI,9,+1 Lap,17,2
ALO,DNF,DNF,19
STR,DNF,DNF,21
OCO,14,+1 Lap,13
BEA,5,+57.268s,10,10
HUL,11,+1 Lap,11
BOR,DNS,DNS,16
GAS,6,+59.647s,7,8
COL,10,+1 Lap,12,1
PER,15,+1 Lap,22
BOT,13,+1 Lap,20
LAW,7,+1m20.588s,14,6
LIN,12,+1 Lap,15
HAD,8,+1m27.247s,9,4
ANT,1,56 Laps,1,25
`;
const PASTE_JAPANESE_RACE = `
NOR,5,23.479s,5,10
VER,8,32.677s,11,4
RUS,4,15.754s,2,12
PIA,2,13.722s,3,18
LEC,3,15.270s,4,15
HAM,6,25.037s,6,8
ALB,20,2 laps,17
SAI,15,65.008s,16 
ALO,18,1 lap,21
STR,DNF,23 laps,22
OCO,10,51.216s,12,1
BEA,DNF,33 laps,18
HUL,11,52.280s,13
BOR,13,59.078s,9
GAS,7,32.340s,7,6
COL,16,65.773s,15	
PER,17,92.453s,19 
BOT,19,1 lap,20
LAW,9,50.180s,14,2
LIN,14,59.848s,10
HAD,12,56.154s,8
ANT,1,53,1,25
`;

// =====================================================
// 4) CONTENT
// =====================================================

export const previousRaceResults = [
  {
    raceName: "Australian Grand Prix",
    raceDates: "Mar 5th–8th, 2026",
    location: "Melbourne, Australia",
    session: {
      id: "race",
      type: "race",
      label: "Race",
      time: "Russell Wins, full results below.",
      extraNote: "Dry Track",
      results: parseRacePaste(PASTE_AUSTRALIA_RACE),
    },
  },

  {
  raceName: "Chinese Grand Prix",
  raceDates: "Mar 19th–22nd, 2026",
  location: "Shanghai, China",
  session: {
    id: "race",
    type: "race",
    label: "Race",
    time: "Winner name here, full results below.",
    extraNote: "Dry Track",
    results: parseRacePaste(PASTE_CHINA_RACE),
  },
},
{
raceName: "JAPANESE GRAND PRIX ",
  raceDates: "Mar 26th–29th, 2026",
  location: "Suzuka Circuit, Japan",
  session: {
    id: "race",
    type: "race",
    label: "Race",
    time: "Winner name here, full results below.",
    extraNote: "Dry Track",
    results: parseRacePaste(PASTE_JAPANESE_RACE),
  },
},
];