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

  const normalizeStatus = (status, pos) => {
    const s = String(status ?? "").trim();
    const p = String(pos ?? "").trim().toUpperCase();

    if (p === "DNF" || p === "DNS") return p;
    if (!s) return "";
    if (/^winner$/i.test(s)) return "Winner";
    if (/^\d+$/.test(s)) return "Winner";
    return s;
  };

  const getDriverIdFromName = (name) => {
    const n = String(name || "").toLowerCase();

    if (n.includes("norris")) return "NOR";
    if (n.includes("verstappen")) return "VER";
    if (n.includes("russell")) return "RUS";
    if (n.includes("piastri")) return "PIA";
    if (n.includes("leclerc")) return "LEC";
    if (n.includes("hamilton")) return "HAM";
    if (n.includes("albon")) return "ALB";
    if (n.includes("sainz")) return "SAI";
    if (n.includes("alonso")) return "ALO";
    if (n.includes("stroll")) return "STR";
    if (n.includes("ocon")) return "OCO";
    if (n.includes("bearman")) return "BEA";
    if (n.includes("hulkenberg") || n.includes("hülkenberg")) return "HUL";
    if (n.includes("bortoleto")) return "BOR";
    if (n.includes("gasly")) return "GAS";
    if (n.includes("colapinto")) return "COL";
    if (n.includes("perez") || n.includes("pérez")) return "PER";
    if (n.includes("bottas")) return "BOT";
    if (n.includes("lawson")) return "LAW";
    if (n.includes("lindblad")) return "LIN";
    if (n.includes("hadjar")) return "HAD";
    if (n.includes("antonelli")) return "ANT";

    return "";
  };

  const pointsByPosition = {
    1: 25,
    2: 18,
    3: 15,
    4: 12,
    5: 10,
    6: 8,
    7: 6,
    8: 4,
    9: 2,
    10: 1,
  };

  for (const line of lines) {
    // OLD FORMAT:
    // DRIVER_ID, POS, STATUS, GRID, POINTS
    if (line.includes(",")) {
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
        status: normalizeStatus(rawStatus, rawPos),
        grid,
        points,
      };

      continue;
    }

    // NEW COPY-PASTE FORMAT:
    // 1  Andrea Kimi Antonelli  ITA  Mercedes AMG Petronas F1 Team  57
    // 2  Lando Norris           GBR  McLaren Mastercard F1 Team      3.264s
    // DNF Liam Lawson           NZD  Racing Bulls
    const parts = line.split(/\t+/).map((p) => p.trim()).filter(Boolean);

    let rawPos = "";
    let driverName = "";
    let status = "";

    if (parts.length >= 5) {
      rawPos = parts[0];
      driverName = parts[1];
      status = parts[4];
    } else {
      // Fallback for rows where tabs/spaces paste unevenly.
      const match = line.match(/^(\d+|DNF|DNS)\s+(.+?)\s+(ITA|GBR|AUS|NED|MON|ARG|ESP|THA|BRA|FRA|MEX|CAN|FIN|NZD|GER)\s+(.+?)(?:\s+(\d+(?:\.\d+)?s|[12]L|\d+\s*Laps?|\d+))?$/i);

      if (!match) continue;

      rawPos = match[1];
      driverName = match[2];
      status = match[5] || rawPos;
    }

    const id = getDriverIdFromName(driverName);
    if (!id || !base[id]) continue;

    const upperPos = String(rawPos).toUpperCase();
    const isDNF = upperPos === "DNF" || upperPos === "DNS";

    const pos = isDNF ? null : toIntOrNull(rawPos);
    const cleanStatus = isDNF ? upperPos : normalizeStatus(status, rawPos);
    const points = pos && pointsByPosition[pos] ? pointsByPosition[pos] : 0;

    base[id] = {
      pos,
      status: cleanStatus,
      grid: "",
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
const PASTE_MIAMI_RACE = `
1	Andrea Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	57
2	Lando Norris	GBR	McLaren Mastercard F1 Team	3.264s
3	Oscar Piastri	AUS	McLaren Mastercard F1 Team	27.092s
4	George Russell	GBR	Mercedes AMG Petronas F1 Team	43.051s
5	Max Verstappen	NED	Oracle Red Bull Racing	43.946s
6	Lewis Hamilton	GBR	Scuderia Ferrari HP	53.753s
7	Franco Colapinto	ARG	BWT Alpine F1 Team	61.871s
8 Charles Leclerc	MON	Scuderia Ferrari HP	44.245s
9	Carlos Sainz	ESP	Atlassian Williams F1 Team	82.072s
10	Alex Albon	THA	Atlassian Williams F1 Team	90.972s
11	Oliver Bearman	GBR	TGR Haas F1 Team	1L
12	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1L
13	Esteban Ocon	FRA	TGR Haas F1 Team	1L
14	Arvid Lindblad	GBR	Racing Bulls	1L
15	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	1L
16	Sergio Perez	MEX	Cadillac F1 Team	1L
17	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1L
18	Valtteri Bottas	FIN	Cadillac F1 Team	2L
DNF	Liam Lawson	NZD	Racing Bulls	 
DNF	Pierre Gasly	FRA	BWT Alpine F1 Team	 
DNF	Nico Hulkenberg	GER	Audi Revolut F1 Team	 
DNF	Isack Hadjar	FRA	Oracle Red Bull Racing
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
{
raceName: "MIAMI GRAND PRIX ",
  raceDates: "May 01st–03rd, 2026",
  location: "Miami International Autodrome, US",
  session: {
    id: "race",
    type: "race",
    label: "Race",
    time: "Winner name here, full results below.",
    extraNote: "Dry Track",
    results: parseRacePaste(PASTE_MIAMI_RACE),
  },
},
];