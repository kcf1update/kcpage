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

  // Add next race below like this:
  /*
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
  */
];