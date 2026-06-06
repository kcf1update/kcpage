// src/content/nextRaceContent.js
import { DRIVERS, DRIVER_IDS } from "./drivers";

// Back compatibility (older code expects an array of names)
export const NEXT_RACE_DRIVERS = DRIVERS.map((d) => d.name);

// Tables use stable driver IDs
export const NEXT_RACE_DRIVER_IDS = DRIVER_IDS;
// Change this one line depending on the weekend format:
// "normal" = Practice 1, Practice 2, Practice 3, Qualifying, Race
// "sprint" = Practice 1, Sprint Qualifying, Sprint Race, Qualifying, Race
const WEEKEND_FORMAT = "regular";
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

     const formatRaceStatus = (value, pos) => {
    const clean = String(value || "").trim();

    if (!clean) return "";

    if (/^(DNF|DNS|DSQ)$/i.test(clean)) {
      return clean.toUpperCase();
    }

    // Winner total race laps, example: 68
    if (Number(pos) === 1 && /^\d+$/.test(clean)) {
      return `${clean} laps`;
    }

    // Time gap, examples: +10.768, 10.768, +10.768s
    if (/^\+?\d+\.\d+s?$/i.test(clean)) {
      return clean.startsWith("+") ? clean.replace(/s$/i, "") : `+${clean.replace(/s$/i, "")}`;
    }

    // Lapped cars, examples: +1 lap, +2 laps, +1 Lap, +3 Laps
    if (/^\+\d+\s+laps?$/i.test(clean)) {
      const laps = clean.match(/\d+/)?.[0];
      return `+${laps} ${Number(laps) === 1 ? "lap" : "laps"}`;
    }

    // Short lapped format, examples: 1L, 2L
    if (/^\d+L$/i.test(clean)) {
      const laps = Number(clean.replace(/L/i, ""));
      return `+${laps} ${laps === 1 ? "lap" : "laps"}`;
    }

    // Fallback for total laps
    if (/^\d+$/.test(clean)) {
      return `${clean} laps`;
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
                status: isDNF ? rawPos : formatRaceStatus(rawStatus, pos),
        grid,
        points,
      };

      continue;
    }

       // Copied table format from Crash/F1
    const id = getDriverIdFromLine(line);
    if (!id || !base[id]) continue;

    const rawPos = parts[0] ? parts[0].toUpperCase() : "";

    const isDNF =
      rawPos === "DNF" ||
      rawPos === "DNS" ||
      rawPos === "DSQ";

    const pos = isDNF ? null : Number(rawPos);

    let rawStatus = "";

    if (isDNF) {
      rawStatus = rawPos;
    } else {
      // Crash table is tab-based. The final column is the race status:
      // 68, +10.768, +1 lap, +2 laps, etc.
      rawStatus = parts[parts.length - 1] || "";
    }

    base[id] = {
      pos,
      status: formatRaceStatus(rawStatus, pos),
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
1	Charles Leclerc	MON	Scuderia Ferrari HP	1m13.978s	31
2	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m14.204s	28
3	Max Verstappen	NED	Oracle Red Bull Racing	1m14.491s	26
4	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m14.537s	31
5	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m14.983s	29
6	Lando Norris	GBR	McLaren Mastercard F1 Team	1m15.291s	27
7	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m15.343s	27
8	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m15.565s	29
9	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m15.750s	31
10	Pierre Gasly	FRA	BWT Alpine F1 Team	1m15.828s	32
11	Alex Albon	THA	Atlassian Williams F1 Team	1m15.989s	33
12	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m16.041s	31
13	Isack Hadjar	FRA	Oracle Red Bull Racing	1m16.148s	14
14	Sergio Perez	MEX	Cadillac F1 Team	1m16.170s	28
15	Franco Colapinto	ARG	BWT Alpine F1 Team	1m16.189s	32
16	Ollie Bearman	GBR	TGR Haas F1 Team	1m16.292s	31
17	Esteban Ocon	FRA	TGR Haas F1 Team	1m16.333s	31
18	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m16.389s	34
19	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m16.431s	31
20	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m16.678s	21
21	Valtteri Bottas	FIN	Cadillac F1 Team	1m17.460s	27
22	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m17.556s	16

`;

const PASTE_P2 = `
1	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m13.026s	35
2	Charles Leclerc	MON	Scuderia Ferrari HP	1m13.137s	35
3	Max Verstappen	NED	Oracle Red Bull Racing	1m13.194s	34
4	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m13.405s	35
5	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m13.529s	34
6	Isack Hadjar	FRA	Oracle Red Bull Racing	1m14.087s	23
7	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m14.088s	30
8	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m14.094s	34
9	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m14.359s	34
10	Ollie Bearman	GBR	TGR Haas F1 Team	1m14.456s	36
11	Pierre Gasly	FRA	BWT Alpine F1 Team	1m14.497s	36
12	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m14.512s	34
13	Alex Albon	THA	Atlassian Williams F1 Team	1m14.600s	38
14	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m14.748s	36
15	Franco Colapinto	ARG	BWT Alpine F1 Team	1m14.758s	30
16	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m14.785s	35
17	Esteban Ocon	FRA	TGR Haas F1 Team	1m14.845s	34
18	Sergio Perez	MEX	Cadillac F1 Team	1m15.116s	31
19	Lando Norris	GBR	McLaren Mastercard F1 Team	1m15.274s	8
20	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m15.294s	30
21	Valtteri Bottas	FIN	Cadillac F1 Team	1m15.759s	28
22	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m16.174s	27
`;

const PASTE_P3 = `
1	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m12.720s	22
2	Charles Leclerc	MON	Scuderia Ferrari HP	1m13.047s	32
3	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m13.051s	30
4	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m13.483s	23
5	Max Verstappen	NED	Oracle Red Bull Racing	1m13.662s	23
6	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m13.698s	20
7	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m13.820s	27
8	Isack Hadjar	FRA	Oracle Red Bull Racing	1m13.877s	25
9	Lando Norris	GBR	McLaren Mastercard F1 Team	1m14.006s	24
10	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m14.050s	22
11	Esteban Ocon	FRA	TGR Haas F1 Team	1m14.278s	24
12	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m14.336s	26
13	Pierre Gasly	FRA	BWT Alpine F1 Team	1m14.480s	22
14	Ollie Bearman	GBR	TGR Haas F1 Team	1m14.487s	18
15	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m14.587s	27
16	Alex Albon	THA	Atlassian Williams F1 Team	1m14.801s	24
17	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m14.918s	24
18	Sergio Perez	MEX	Cadillac F1 Team	1m14.945s	19
19	Franco Colapinto	ARG	BWT Alpine F1 Team	1m15.179s	21
20	Valtteri Bottas	FIN	Cadillac F1 Team	1m15.451s	17
21	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m15.567s	26
22	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m15.921s	22
`;
const PASTE_SQ = `


	
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
  title: "Monaco Grand Prix Weekend Recap",
  sections:
    WEEKEND_FORMAT === "sprint"
      ? [
          {
            heading: "Practice",
            items: [
              {
                title: "",
                summary:
                  "",
                url: "",
              },
            ],
          },
          {
            heading: "Sprint Qualifying",
            items: [
              {
                title: "",
                summary:
                  "",
                url: "",
              },
            ],
          },
          {
            heading: "Sprint Race",
            items: [
              {
                title: "",
                summary:
                  "",
                url: "",
              },
            ],
          },
          {
            heading: "Qualifying",
            items: [
              {
                title: "",
                summary:
                  "",
                url: "",
              },
            ],
          },
          {
            heading: "Race",
            items: [
              {
                title: "",
                summary:
                  "",
                url: "",
              },
            ],
          },
        ]
      : [
          {
  heading: "Practice 1",
  items: [
    {
      title: "Leclerc puts Ferrari on top in Monaco FP1",
      summary:
        "Ferrari opened Monaco exactly the way it wanted, with Charles Leclerc fastest and Lewis Hamilton second in FP1. Max Verstappen was third, but the session was far from clean, with Isack Hadjar crashing at the Swimming Pool and Fernando Alonso dipping the barriers to trigger a second red flag.",
      url: "https://www.formula1.com/en/latest/article/fp1-leclerc-sets-the-pace-ahead-of-hamilton-and-verstappen-during-disrupted-first-practice-in-monaco.1yE6wEXZmEwE2WRfoLXVXz",
    },
  ],
},
{
  heading: "Practice 2",
  items: [
    {
      title: "Hamilton leads Ferrari 1-2 as Norris hits trouble in FP2",
      summary:
        "Ferrari stayed on top in FP2 as Hamilton led Leclerc for another 1-2, with Verstappen close behind in third. It was not a clean session, with several drivers skating close to the walls around Monaco. Norris had the biggest problem when his McLaren stopped near the Nouvelle Chicane, costing him valuable track time and bringing out a VSC. Hadjar recovered well from his FP1 crash to finish sixth, while late smoke from Perez’s Cadillac brought out a red flag before the session ended.",
      url: "https://www.formula1.com/en/latest/article/fp2-hamilton-leads-another-ferrari-1-2-during-second-practice-in-monaco.bCQgEBYyVg0K6KvGKPj6V",
    },
  ],
},
{
  heading: "Practice 3",
  items: [
    {
      title: "Antonelli Tops FP3 As Mercedes Fight Back Before Monaco Qualifying",
      summary:
        "Kimi Antonelli put Mercedes on top in FP3 at Monaco with a 1:12.720, beating Charles Leclerc by 0.327s as Mercedes hit back after Ferrari controlled Friday. Lewis Hamilton was third, just 0.004s behind Leclerc, with George Russell fourth and Max Verstappen fifth, leaving Mercedes, Ferrari and Red Bull all in the mix before qualifying. The session was red-flagged when Oliver Bearman crashed at Massenet, while McLaren had already been under pressure after breaking curfew overnight to fix Lando Norris’s Friday practice issues. Oscar Piastri and Norris both stayed inside the top nine, but traffic, tyre preparation and track position remain the big Monaco headaches heading into the most important qualifying session of the weekend.",
      url: "https://www.the-race.com/formula-1/antonelli-deposes-ferrari-in-final-monaco-gp-practice/",
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
  raceName: "Monaco Grand Prix",
  raceDates: "June 5th to June 7th, 2026",
  location: "Monte Carlo, Monaco.",
  trackInfoUrl: "/img/tracks/monaco.jpg",

  weather: [
  {
    day: "Friday",
    date: "June 5th",
    icon: "🌥️",
    temp: "21°C / 17°C",
    summary: "Partly cloudy and mild.",  },
  {
    day: "Saturday",
    date: "June 6th",
    icon: "🌥️",
    temp: "21°C / 18°C",
    summary: "Mostly cloudy with some sunny breaks.",
  },
  {
    day: "Sunday",
    date: "June 7th",
    icon: "🌤️",
    temp: "22°C / 19°C",
    summary: "Partly cloudy and warm.",
  },
],


 sessions:
  WEEKEND_FORMAT === "sprint"
    ? [
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
          id: "sq",
          type: "sprint_shootout",
          label: "Sprint Qualifying",
          time: "",
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_SQ),
        },
        {
          id: "sprint",
          type: "sprint_race",
          label: "Sprint Race",
          time: " ",
          trackNote: "",
          extraNote: "",
          results: parseRacePaste(PASTE_SPRINT),
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
          label: "Race Results",
          time: "",
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
          time: "Leclerc Fastest, results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P1),
          
        },
        {
          id: "p2",
          type: "practice",
          label: "Practice 2",
          time: "Hamilton Fastest, results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P2),
        },
        {
          id: "p3",
          type: "practice",
          label: "Practice 3",
          time: "Antonelli Fastest, results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P3),
        },
        {
          id: "q",
          type: "qualifying",
          label: "Qualifying",
          time: "11:00 AM ADT",
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_Q),
        },
        {
          id: "race",
          type: "race",
          label: "Race ",
          time: "10:00 AM ADT",
          trackNote: "",
          extraNote: "",
          results: parseRacePaste(PASTE_RACE),
        },
      ],
};