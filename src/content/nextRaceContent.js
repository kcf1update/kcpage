// src/content/nextRaceContent.js
import { DRIVERS, DRIVER_IDS } from "./drivers";

// Back compatibility (older code expects an array of names)
export const NEXT_RACE_DRIVERS = DRIVERS.map((d) => d.name);

// Tables use stable driver IDs
export const NEXT_RACE_DRIVER_IDS = DRIVER_IDS;
// Change this one line depending on the weekend format:
// "normal" = Practice 1, Practice 2, Practice 3, Qualifying, Race
// "sprint" = Practice 1, Sprint Qualifying, Sprint Race, Qualifying, Race
const WEEKEND_FORMAT = "sprint";
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
function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getDriverIdFromLine(line) {
  const normalizedLine = normalizeText(line);

  const match = DRIVERS.find((driver) => {
    const normalizedName = normalizeText(driver.name);
    return normalizedLine.includes(normalizedName);
  });

  return match ? match.id : null;
}

// PRACTICE paste format:
// Option 1: DRIVER_ID, LAPTIME, LAPS
// Option 2: copied table row from Crash/F1:
// 1 Kimi Antonelli ITA Mercedes AMG Petronas F1 Team 1m29.362s 18
function parseLapPaste(text) {
  const base = makeLapResultsTemplate();

  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const parts = line.split(/[\t,|]+/).map((p) => p.trim());

    // Keep your old manual format working: ANT,1:29.362,18
    const manualId = (parts[0] || "").toUpperCase();

    if (manualId && base[manualId]) {
      base[manualId] = {
        lapTime: parts[1] || "",
        laps: parts[2] || "",
        status: parts[3] || "",
      };
      continue;
    }

    // New copied-table format
    const id = getDriverIdFromLine(line);
    if (!id || !base[id]) continue;

    const timeMatch = line.match(/\b\d+m\d+\.\d+s\b|\b\d+:\d+\.\d+\b/);
    const lapTime = timeMatch ? timeMatch[0] : "";

    let laps = "";
    const afterTime = timeMatch ? line.slice(timeMatch.index + timeMatch[0].length) : "";
    const lapsMatch = afterTime.match(/\b\d+\b/);
    if (lapsMatch) laps = lapsMatch[0];

    base[id] = {
      lapTime,
      laps,
      status: lapTime ? "" : "No time",
    };
  }

  return base;
}

// QUALIFYING paste format:
// Option 1: DRIVER_ID, Q1, Q2, Q3
// Example: ANT,1m30.035s,1m29.048s,1m28.778s
//
// Option 2: copied table row from Crash/F1
// Example: 1 Kimi Antonelli ITA Mercedes AMG Petronas F1 Team 1m30.035s 1m29.048s 1m28.778s
function parseQualifyingPaste(text) {
  const base = makeQualifyingResultsTemplate();

  const rawLines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows = [];
  let currentRow = "";

  for (const line of rawLines) {
    // Skip headers / notes
    if (
      /^POS\.?/i.test(line) ||
      /^NO\.?/i.test(line) ||
      /^DRIVER/i.test(line) ||
      /^TEAM/i.test(line) ||
      /^Q1/i.test(line) ||
      /^Q2/i.test(line) ||
      /^Q3/i.test(line) ||
      /^LAPS/i.test(line) ||
      /^Note/i.test(line)
    ) {
      continue;
    }

    // F1 copy format often starts each driver block with:
    // 1 1
    // 2 12
    // NC 14
    const startsNewDriver = /^(\d+|NC)\s+\d+\b/i.test(line);

    if (startsNewDriver) {
      if (currentRow) rows.push(currentRow.trim());
      currentRow = line;
    } else {
      currentRow += " " + line;
    }
  }

  if (currentRow) rows.push(currentRow.trim());

  for (const row of rows) {
    // Keeps your old manual format working:
    // Example: ANT,1m30.035s,1m29.048s,1m28.778s
    const parts = row.split(/[,\t]+/).map((p) => p.trim());
    const manualId = (parts[0] || "").toUpperCase();

    if (manualId && base[manualId]) {
      base[manualId] = {
        q1: parts[1] || "",
        q2: parts[2] || "",
        q3: parts[3] || "",
      };
      continue;
    }

    // Rebuilt F1 row format:
    // 1 1 Lando Norris McLaren 1:28.723 1:29.366 1:27.869 15
    const id = getDriverIdFromLine(row);
    if (!id || !base[id]) continue;

    const times = row.match(/\b\d{1,2}:\d{2}\.\d{3}\b/g) || [];

    base[id] = {
      q1: times[0] || "",
      q2: times[1] || "",
      q3: times[2] || "",
    };
  }

  return base;
}

// RACE paste format:
// Option 1: DRIVER_ID, POS, STATUS(time/gap/DNF), GRID, POINTS
// Example: ANT,1,53,,25
//
// Option 2: copied table row from Crash/F1
// Example:
// 1 Andrea Kimi Antonelli ITA Mercedes AMG Petronas F1 Team 53
// 2 Oscar Piastri AUS McLaren Mastercard F1 Team 13.722s
function parseRacePaste(text) {
  const base = makeRaceResultsTemplate();

  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const toIntOrNull = (value) => {
    const s = String(value ?? "").trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const getRacePoints = (pos) => {
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

    return pointsByPosition[pos] ?? 0;
  };

  for (const line of lines) {
    const parts = line.split(/[\t,|]+/).map((p) => p.trim());

    // Keeps your old manual format working: ANT,1,53,,25
    const manualId = (parts[0] || "").toUpperCase();

    if (manualId && base[manualId]) {
      const rawPos = (parts[1] || "").toUpperCase();
      const rawStatus = parts[2] || "";
      const rawGrid = parts[3] || "";
      const rawPoints = parts[4] || "";

      const isDNF =
        rawPos === "DNF" ||
        rawPos === "DNS" ||
        rawPos === "DSQ" ||
        String(rawStatus).toUpperCase() === "DNF";

      const pos = isDNF ? null : toIntOrNull(rawPos);
      const grid = toIntOrNull(rawGrid);
      const points = toIntOrNull(rawPoints);

      base[manualId] = {
        pos,
        status: isDNF ? rawPos : rawStatus,
        grid,
        points,
      };

      continue;
    }

    // New copied-table format from Crash/F1
    const id = getDriverIdFromLine(line);
    if (!id || !base[id]) continue;

    const posMatch = line.match(/^\s*(\d+)\b/);
    const pos = posMatch ? Number(posMatch[1]) : null;

    const statusMatch =
      line.match(/\+\d+(?:\.\d+)?s\b/) ||
      line.match(/\b\d+(?:\.\d+)?s\b/) ||
      line.match(/\b\d+\s+lap(?:s)?\b/i) ||
      line.match(/\bDNF\b|\bDNS\b|\bDSQ\b/i);

    let status = "";

    if (statusMatch) {
      status = statusMatch[0];
    }

    base[id] = {
      pos,
      status,
      grid: null,
      points: Number.isFinite(pos) ? getRacePoints(pos) : null,
    };
  }

  return base;
}

// =====================================================
// 3) YOUR PASTE BOXES (EDIT THESE ONLY)
// =====================================================

const PASTE_P1 = `
Charles Leclerc	MON	Scuderia Ferrari HP	1m29.310s
2	Max Verstappen	NED	Oracle Red Bull Racing	1m29.607s
3	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m29.758s
4	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m29.777s
5	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m30.079s
6	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m30.100s
7	Lando Norris	GBR	McLaren Mastercard F1 Team	1m30.208s
8	Pierre Gasly	FRA	BWT Alpine F1 Team	1m30.587s
9	Isack Hajdar	FRA	Oracle Red Bull Racing	1m30.873s
10	Carlos Sainz	ESP	Atlassian Williams F1 Team	1m30.930s
11	Franco Colapinto	ARG	BWT Alpine F1 Team	1m31.015s
12	Alex Albon	THA	Atlassian Williams F1 Team	1m31.024s
13	Oliver Bearman	GBR	TGR Haas F1 Team	1m31.091s
14	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m31.111s
15	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m31.595s
16	Esteban Ocon	FRA	TGR Haas F1 Team	1m31.635s
17	Liam Lawson	NZL	Visa Cash App Racing Bulls F1 Team	1m31.648s
18	Sergio Perez	MEX	Cadillac F1 Team	1m32.047s
19	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	1m32.593s
20	Valtteri Bottas	FIN	Cadillac F1 Team	1m32.762s
21	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m32.862s
22	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m32.959s

`;

const PASTE_P2 = `

`;

const PASTE_P3 = `

`;
const PASTE_SQ = `
1	1	

Lando Norris

McLaren	1:28.723	1:29.366	1:27.869	15
2	12	

Kimi Antonelli

Mercedes	1:29.312	1:29.209	1:28.091	14
3	81	

Oscar Piastri

McLaren	1:29.169	1:28.506	1:28.108	11
4	16	

Charles Leclerc

Ferrari	1:28.733	1:28.333	1:28.239	15
5	3	

Max Verstappen

Red Bull Racing	1:29.801	1:29.093	1:28.461	12
6	63	

George Russell

Mercedes	1:29.659	1:28.903	1:28.493	15
7	44	

Lewis Hamilton

Ferrari	1:29.255	1:28.841	1:28.618	15
8	43	

Franco Colapinto

Alpine	1:30.386	1:29.527	1:29.320	15
9	6	

Isack Hadjar

Red Bull Racing	1:30.352	1:29.750	1:29.422	15
10	10	

Pierre Gasly

Alpine	1:29.984	1:29.973	1:29.474	15
11	5	

Gabriel Bortoleto

Audi	1:30.561	1:29.994		12
12	27	

Nico Hulkenberg

Audi	1:30.270	1:30.019		12
13	87	

Oliver Bearman

Haas F1 Team	1:30.614	1:30.116		9
14	23	

Alex Albon

Williams	1:30.988	1:30.216		12
15	55	

Carlos Sainz

Williams	1:30.987	1:30.224		12
16	41	

Arvid Lindblad

Racing Bulls	1:30.872	1:30.573		9
17	30	

Liam Lawson

Racing Bulls	1:31.043			5
18	31	

Esteban Ocon

Haas F1 Team	1:31.245			6
19	11	

Sergio Perez

Cadillac	1:31.255			3
20	77	

Valtteri Bottas

Cadillac	1:31.826			6
NC	14	

Fernando Alonso

Aston Martin	1:41.311			6
	
`;
const PASTE_SPRINT = `

`;
const PASTE_Q = `

`;

const PASTE_RACE = `

`;

// =====================================================
// 4) CONTENT
// =====================================================

export const nextRaceContent = {
  raceName: "Miami Grand Prix ",
  raceDates: "May 01st to May 3rd",
  location: "Miami International Autodrome, US",
  trackInfoUrl: "/img/tracks/shutterstockmiami.jpg",

 weather:  "Thu: 28°C Mostly Sunny 🌤️, Fri: 28°C Mostly Sunny🌤️, Sat: 30°C Humid amd Breezy☀️, Sun: 29°C Scattered Showers🌦️",

 sessions:
  WEEKEND_FORMAT === "sprint"
    ? [
        {
          id: "p1",
          type: "practice",
          label: "Practice 1",
          time: "Complete results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P1),
        },
        {
          id: "sq",
          type: "sprint_shootout",
          label: "Sprint Qualifying",
          time: "Complete results below",
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_SQ),
        },
        {
          id: "sprint",
          type: "sprint_race",
          label: "Sprint Race",
          time: "1:00 PM AST",
          trackNote: "",
          extraNote: "",
          results: parseRacePaste(PASTE_SPRINT),
        },
        {
          id: "q",
          type: "qualifying",
          label: "Qualifying",
          time: "5:00 PM AST",
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_Q),
        },
        {
          id: "race",
          type: "race",
          label: "Race Results",
          time: "5:00 PM AST",
          trackNote: "",
          extraNote: "",
          results: parseRacePaste(PASTE_RACE),
        },
      ]
    : [
        {
          id: "p1",
          type: "practice",
          label: "Practice 1",
          time: "1:30 PM AST",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P1),
        },
        {
          id: "p2",
          type: "practice",
          label: "Practice 2",
          time: "5:00 PM AST",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P2),
        },
        {
          id: "p3",
          type: "practice",
          label: "Practice 3",
          time: "1:30 PM AST",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P3),
        },
        {
          id: "q",
          type: "qualifying",
          label: "Qualifying",
          time: "5:00 PM AST",
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_Q),
        },
        {
          id: "race",
          type: "race",
          label: "Race Results",
          time: "5:00 PM AST",
          trackNote: "",
          extraNote: "",
          results: parseRacePaste(PASTE_RACE),
        },
      ],
};