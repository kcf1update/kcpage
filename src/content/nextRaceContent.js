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

  const getRacePoints = (pos) => pointsByPosition[pos] ?? 0;

  const formatRaceStatus = (value) => {
    const clean = String(value || "").trim();

    if (!clean) return "";

    if (/^DNF$/i.test(clean)) {
      return "DNF";
    }

    if (/^\d+L$/i.test(clean)) {
      const laps = clean.replace(/L/i, "");
      return laps === "1" ? "1 lap down" : `${laps} laps down`;
    }

    if (/^\d+$/.test(clean)) {
      return `${clean} laps`;
    }

    if (/^\+?\d+\.\d+s$/i.test(clean)) {
      return clean.startsWith("+") ? clean : `+${clean}`;
    }

    return clean;
  };

  for (const line of lines) {
    const parts = line.split(/[,\t]+/).map((p) => p.trim());

    // Keeps your old manual format working: ANT,1,57,,25
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

      const pos = isDNF ? null : Number(rawPos);
      const grid = rawGrid ? Number(rawGrid) : null;
      const points = rawPoints ? Number(rawPoints) : getRacePoints(pos);

      base[manualId] = {
        pos,
        status: isDNF ? "DNF" : formatRaceStatus(rawStatus),
        grid,
        points,
      };

      continue;
    }

    // Copied table format from Crash/F1
    const id = getDriverIdFromLine(line);
    if (!id || !base[id]) continue;

    const posMatch = line.match(/^\s*(\d+|DNF)\b/i);
    const rawPos = posMatch ? posMatch[1].toUpperCase() : "";

    let status = "";

    const statusMatch =
      line.match(/\b\d+L\b/i) ||
      line.match(/\b\d+\.\d+s\b/i) ||
      line.match(/\bDNF\b/i) ||
      line.match(/\bDNS\b/i) ||
      line.match(/\bDSQ\b/i) ||
      line.match(/\b\d+\b$/);

    if (statusMatch) {
      status = statusMatch[0];
    }

    const isDNF = rawPos === "DNF" || /^(DNF|DNS|DSQ)$/i.test(status);
    const pos = isDNF ? null : Number(rawPos);

    base[id] = {
      pos,
      status: isDNF ? "DNF" : formatRaceStatus(status),
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
1	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m13.402s
2	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m13.554s
3	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m14.176s
4	Charles Leclerc	MON	Scuderia Ferrari HP	1m14.355s
5	Max Verstappen	NED	Oracle Red Bull Racing	1m14.366s
6	Lando Norris	GBR	McLaren Mastercard F1 Team	1m14.799s
7	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m14.963s
8	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m15.452s
9	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m15.698s
10	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	1m15.863s
11	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m16.214s
12	Isack Hadjar	FRA	Oracle Red Bull Racing	1m16.253s
13	Esteban Ocon	FRA	TGR Haas F1 Team	1m16.497s
14	Alex Albon	THA	Atlassian Williams F1 Team	1m16.642s
15	Carlos Sainz	ESP	Atlassian Williams F1 Team	1m16.660s
16	Pierre Gasly	FRA	BWT Alpine F1 Team	1m16.809s
17	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m16.978s
18	Liam Lawson	NZL	Visa Cash App Racing Bulls F1 Team	1m17.431s
19	Ollie Bearman	GBR	TGR Haas F1 Team	1m17.770s
20	Valtteri Bottas	FIN	Cadillac F1 Team	1m17.868s
21	Sergio Perez	MEX	Cadillac F1 Team	1m17.926s
22	Franco Colapinto	ARG	BWT Alpine F1 Team	No time set


`;

const PASTE_P2 = `

`;

const PASTE_P3 = `

`;
const PASTE_SQ = `
1	63	

George Russell

Mercedes	1:14.772	1:13.026	1:12.965	19
2	12	

Kimi Antonelli

Mercedes	1:14.010	1:13.551	1:13.033	16
3	1	

Lando Norris

McLaren	1:14.265	1:13.957	1:13.280	15
4	81	

Oscar Piastri

McLaren	1:14.665	1:13.858	1:13.299	15
5	44	

Lewis Hamilton

Ferrari	1:13.889	1:13.465	1:13.326	23
6	16	

Charles Leclerc

Ferrari	1:15.006	1:13.554	1:13.410	19
7	3	

Max Verstappen

Red Bull Racing	1:14.028	1:14.412	1:13.504	15
8	6	

Isack Hadjar

Red Bull Racing	1:14.541	1:14.239	1:13.605	17
9	41	

Arvid Lindblad

Racing Bulls	1:14.517	1:14.140	1:13.737	19
10	55	

Carlos Sainz

Williams	1:15.500	1:14.547	1:14.536	24
11	27	

Nico Hulkenberg

Audi	1:15.673	1:14.595		14
12	5	

Gabriel Bortoleto

Audi	1:15.801	1:14.627		14
13	43	

Franco Colapinto

Alpine	1:15.484	1:14.702		16
14	31	

Esteban Ocon

Haas F1 Team	1:15.760	1:14.928		17
15	87	

Ollie Bearman

Haas F1 Team	1:15.872	1:15.197		17
16	14	

Fernando Alonso

Aston Martin	1:15.760			7
17	11	

Sergio Perez

Cadillac	1:16.002			8
18	18	

Lance Stroll

Aston Martin	1:16.354			9
19	10	

Pierre Gasly

Alpine	1:16.642			8
20	77	

Valtteri Bottas

Cadillac	1:16.866			8

	
`;
const PASTE_SPRINT = `
1	George Russell	GBR	Mercedes AMG Petronas F1 Team	23
2	Lando Norris	GBR	McLaren Mastercard F1 Team	+1.272s
3	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	+1.843s
4	Oscar Piastri	AUS	McLaren Mastercard F1 Team	+9.797s
5	Charles Leclerc	MON	Scuderia Ferrari HP	+9.929s
6	Lewis Hamilton	GBR	Scuderia Ferrari HP	+10.545s
7	Max Verstappen	NED	Oracle Red Bull Racing	+15.935s
8	Arvid Lindblad	GBR	Racing Bulls	+29.710s
9	Franco Colapinto	ARG	BWT Alpine F1 Team	+31.621s
10	Carlos Sainz	ESP	Atlassian Williams F1 Team	+36.793s
11	Liam Lawson	NZD	Racing Bulls	+61.344s
12	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	+61.814s
13	Esteban Ocon	FRA	TGR Haas F1 Team	+64.209s
14	Sergio Perez	MEX	Cadillac F1 Team	+70.402
15	Nico Hulkenberg	GER	Audi Revolut F1 Team	+72.158s
16	Lance Stroll	CAN	Aston Martin Aramco F1 Team	+1 Lap
17	Valtteri Bottas	FIN	Cadillac F1 Team	+1 Lap
18	Ollie Bearman	GBR	TGR Haas F1 Team	+1 Lap
19	Alex Albon	THA	Atlassian Williams F1 Team	+1 Lap
20	Pierre Gasly	FRA	BWT Alpine F1 Team	+1 Lap
21	Isack Hadjar	FRA	Oracle Red Bull Racing	+3 Laps
DNF	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	+5 Laps
`;
const PASTE_Q = `
1	63	

George Russell

Mercedes	1:13.953	1:13.079	1:12.578	24
2	12	

Kimi Antonelli

Mercedes	1:13.380	1:13.076	1:12.646	24
3	1	

Lando Norris

McLaren	1:13.503	1:13.049	1:12.729	28
4	81	

Oscar Piastri

McLaren	1:13.559	1:13.285	1:12.781	29
5	44	

Lewis Hamilton

Ferrari	1:13.767	1:13.041	1:12.868	27
6	3	

Max Verstappen

Red Bull Racing	1:14.067	1:13.479	1:12.907	23
7	6	

Isack Hadjar

Red Bull Racing	1:13.654	1:12.975	1:12.935	22
8	16	

Charles Leclerc

Ferrari	1:13.825	1:13.496	1:12.976	29
9	41	

Arvid Lindblad

Racing Bulls	1:13.895	1:13.548	1:13.280	28
10	43	

Franco Colapinto

Alpine	1:14.466	1:13.857	1:13.697	27
11	27	

Nico Hulkenberg

Audi	1:14.562	1:13.886		21
12	30	

Liam Lawson

Racing Bulls	1:14.346	1:13.897		22
13	5	

Gabriel Bortoleto

Audi	1:14.775	1:14.071		22
14	10	

Pierre Gasly

Alpine	1:14.698	1:14.187		20
15	55	

Carlos Sainz

Williams	1:14.276	1:14.273		21
16	87	

Ollie Bearman

Haas F1 Team	1:14.449	1:14.416		22
17	31	

Esteban Ocon

Haas F1 Team	1:14.845			12
18	23	

Alex Albon

Williams	1:14.851			13
19	14	

Fernando Alonso

Aston Martin	1:15.196			11
20	11	

Sergio Perez

Cadillac	1:15.429			11
21	18	

Lance Stroll

Aston Martin	1:16.195			10
22	77	

Valtteri Bottas

Cadillac	1:16.272			10

`;

const PASTE_RACE = `
 
`;

// =====================================================
// 4) CONTENT
// =====================================================
// =======================================================
// Race weekend recap links
// Add session article links and KC summaries here
// This keeps race-weekend content with the rest of the race data
// =======================================================
// =======================================================
// Race weekend recap links
// Add session article links and KC summaries here
// This follows WEEKEND_FORMAT so sprint and standard weekends match automatically
// =======================================================
export const raceWeekendRecap = {
  enabled: true,
  title: "Canadian GP Weekend Recap",
  sections:
    WEEKEND_FORMAT === "sprint"
      ? [
          {
            heading: "Practice",
            items: [
              {
                title: "First practice report: Antonelli leads Mercedes 1-2 in red-flag interrupted session",
                summary:
                  "Kimi Antonelli set the pace in the only Canadian Grand Prix practice session, leading a strong Mercedes one-two ahead of George Russell. The session was messy and heavily interrupted, with red flags for Liam Lawson, Alex Albon’s groundhog strike, and a late Esteban Ocon crash.",
                url: "https://www.crash.net/f1/news/1095798/1/kimi-antonelli-tops-canada-f1-practice-after-alex-albon-strikes-groundhog",
              },
            ],
          },
          {
            heading: "Sprint Qualifying",
            items: [
              {
                title: "Sprint qualifying report: Russell edges Antonelli for pole as Alonso crash causes red flag",
                summary:
                  "George Russell grabbed sprint pole in Canada, narrowly beating Mercedes teammate Kimi Antonelli to give the team a front-row lockout. McLaren stayed close behind with Lando Norris and Oscar Piastri, while Fernando Alonso’s crash brought out a red flag and Max Verstappen could only manage seventh.",
                url: "https://www.planetf1.com/news/2026-canadian-grand-prix-sprint-qualifying-report",
              },
            ],
          },
          {
            heading: "Sprint Race",
            items: [
              {
                title: "Russell Wins Canadian Sprint After Antonelli Clash Clears Steward Review",
                summary:
                  "George Russell won the Canadian GP sprint after a tense early fight with Mercedes teammate Kimi Antonelli, who attacked around the outside at Turn 1 and then made another move into Turn 8 before running wide and losing ground. The stewards briefly checked the incidents but decided no formal investigation was needed, with Russell keeping the win while Antonelli was left frustrated by what he felt was hard defending.",
                url: "https://www.the-race.com/formula-1/canadian-gp-f1-stewards-antonelli-russell-no-investigation/",
              },
            ],
          },
          {
            heading: "Qualifying",
            items: [
              {
                title: "Mercedes Locks Out Canada Front Row as Hamilton Faces Stewards",
                summary:
                  "George Russell grabbed Canadian Grand Prix pole with a late Mercedes one-two over Kimi Antonelli, putting the team in control at the front after a tense day in Montreal. Behind them, Lewis Hamilton qualified fifth but could still face a grid penalty after being called to the stewards for allegedly impeding Pierre Gasly in Q1.",
                url: "https://www.crash.net/f1/news/1096003/1/george-russell-hails-epic-f1-canadian-gp-pole-lap-came-nowhere",
              },
            ],
          },
          {
            heading: "Race",
            items: [
              {
                title: "Race report coming soon",
                summary:
                  "Winner, podium, incidents, and championship impact will be added here after the race.",
                url: "",
              },
            ],
          },
        ]
      : [
          {
            heading: "Practice",
            items: [
              {
                title: "Practice report coming soon",
                summary:
                  "The key practice storylines will be added here once practice is complete.",
                url: "",
              },
            ],
          },
          {
            heading: "Qualifying",
            items: [
              {
                title: "Qualifying report coming soon",
                summary:
                  "Grid-setting updates and qualifying storylines will be added here after qualifying.",
                url: "",
              },
            ],
          },
          {
            heading: "Race",
            items: [
              {
                title: "Race report coming soon",
                summary:
                  "Winner, podium, incidents, and championship impact will be added here after the race.",
                url: "",
              },
            ],
          },
        ],
};
export const nextRaceContent = {
  raceName: "Canada Grand Prix",
  raceDates: "May 22nd to May 24th, 2026",
  location: "Circuit Gilles-Villenuve, Montreal",
  trackInfoUrl: "/img/tracks/shutterstockcanadiangp2.jpg",

  weather: [
  {
  day: "Friday",
  date: "May 22",
  icon: "☀️",
  temp: "19°C / 8°C",
  summary: "Sunny.",
},
  {
    day: "Saturday",
    date: "May 23",
    icon: "🌥️",
    temp: "21°C / 11°C",
    summary: "Partly cloudy and mild.",
  },
  {
    day: "Sunday",
    date: "May 24",
    icon: "🌦️",
    temp: "12°C / 11°C",
    summary: "Cool with a chance of light showers.",
  },
],

 sessions:
  WEEKEND_FORMAT === "sprint"
    ? [
        {
          id: "p1",
          type: "practice",
          label: "Practice 1",
          time: "Kimi fastest, full results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P1),
        },
        {
          id: "sq",
          type: "sprint_shootout",
          label: "Sprint Qualifying",
          time: "George on pole for sprint, full results below",
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_SQ),
        },
        {
          id: "sprint",
          type: "sprint_race",
          label: "Sprint Race",
          time: "Russell Wins Canadian Sprint ",
          trackNote: "",
          extraNote: "",
          results: parseRacePaste(PASTE_SPRINT),
        },
        {
          id: "q",
          type: "qualifying",
          label: "Qualifying",
          time: "5:00 PM AST ",
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
          time: "",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P1),
        },
        {
          id: "p2",
          type: "practice",
          label: "Practice 2",
          time: "",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P2),
        },
        {
          id: "p3",
          type: "practice",
          label: "Practice 3",
          time: "",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P3),
        },
        {
          id: "q",
          type: "qualifying",
          label: "Qualifying",
          time: "",
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_Q),
        },
        {
          id: "race",
          type: "race",
          label: "Race ",
          time: "",
          trackNote: "",
          extraNote: "",
          results: parseRacePaste(PASTE_RACE),
        },
      ],
};