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
1	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m45.387s
2	Max Verstappen	NED	Oracle Red Bull Racing	1m45.787s
3	Charles Leclerc	MON	Scuderia Ferrari HP	1m45.791s
4	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m45.824s
5	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m46.265s
6	Oscar Piastri 	AUS	McLaren Mastercard F1 Team	1m46.398s
7	Liam Lawson	NZL	Visa Cash App Racing Bulls F1 Team	1m46.440s
8	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m46.601s
9	Esteban Ocon	FRA	TGR Haas F1 Team	1m46.624s
10	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m46.688s
11	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m46.871s
12	Carlos Sainz	ESP	Atlassian Williams F1 Team	1m46.893s
13	Alex Albon	THA	Atlassian Williams F1 Team	1m46.939s
14	Lando Norris	GBR	McLaren Mastercard F1 Team	1m46.981s
15	Ollie Bearman	GBR	TGR Haas F1 Team	1m46.994s
16	Pierre Gasly	FRA	BWT Alpine F1 Team	1m47.043s
17	Sergio Perez	MEX	Cadillac F1 Team	1m47.253s
18	Franco Colapinto	ARG	BWT Alpine F1 Team	1m47.253s
19	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	1m47.835s
20	Isack Hadjar 	FRA	Oracle Red Bull Racing	1m47.873s
21	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m48.547s
22	Valtteri Bottas	FIN	Cadillac F1 Team	1m49.315s



 
`;

const PASTE_P2 = `
1	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m43.347s
2	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m43.899s
3	Max Verstappen	NED	Oracle Red Bull Racing	1m44.174s
4	Charles Leclerc	MON	Scuderia Ferrari HP	1m44.473s
5	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m44.665s
6	Lando Norris	GBR	McLaren Mastercard F1 Team	1m44.831s
7	Pierre Gasly	FRA	BWT Alpine F1 Team	1m44.843s
8	Oscar Piastri 	AUS	McLaren Mastercard F1 Team	1m44.857s
9	Isack Hadjar 	FRA	Oracle Red Bull Racing	1m44.868s
10	Esteban Ocon	FRA	TGR Haas F1 Team	1m45.290s
11	Franco Colapinto	ARG	BWT Alpine F1 Team	1m45.479s
12	Liam Lawson	NZL	Visa Cash App Racing Bulls F1 Team	1m45.681s
13	Sergio Perez	MEX	Cadillac F1 Team	1m45.760s
14	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m45.794s
15	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m45.854s
16	Alex Albon	THA	Atlassian Williams F1 Team	1m46.123s
17	Carlos Sainz	ESP	Atlassian Williams F1 Team	1m46.221s
18	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m46.391s
19	Valtteri Bottas	FIN	Cadillac F1 Team	1m46.737s
20	Ollie Bearman	GBR	TGR Haas F1 Team	1m46.801s
21	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m47.403s
22	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	1m47.889s




`;

const PASTE_P3 = `

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
  title: "",
  sections:
    WEEKEND_FORMAT === "regular"
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
      title:
        "Russell Tops Azerbaijan FP1 as Antonelli Stops on Track",
      summary: "George Russell topped the opening practice session for the Azerbaijan Grand Prix, ahead of Max Verstappen and Charles Leclerc. It was a strong start for Russell on Baku’s demanding street circuit, but a difficult hour for his Mercedes teammate Kimi Antonelli, whose car stopped with a hydraulic issue. Both McLaren drivers also spent extended time in the garage, losing valuable laps while the teams worked through their first setups of the weekend. With Antonelli and McLaren short on running, FP1 gave Russell an early advantage, though the order could change when practice resumes later today.",
      url: "https://www.the-race.com/formula-1/what-happened-in-f1-2026-azerbaijan-gp-first-practice/",
    },
  ],
},
 
  {
  heading: "Practice 2",
  items: [
    {
      title: "Russell Sweeps Thursday Practice as Lindblad Hits the Wall in Baku",
      summary: "George Russell ended the opening day of the Azerbaijan Grand Prix fastest in both practice sessions. His 1:43.347 in FP2 put him more than half a second ahead of Mercedes teammate Kimi Antonelli, who recovered from the hydraulic problem that cut short his FP1 running. Max Verstappen was third despite reporting a difficult ride in his Red Bull, followed by Charles Leclerc and Lewis Hamilton. The session was interrupted when Arvid Lindblad struck the wall in the narrow castle section, causing a red flag. Ollie Bearman later stopped with an engine problem. Lando Norris finished sixth and Oscar Piastri eighth for McLaren.",
      url: "https://www.the-race.com/formula-1/what-happened-in-second-azerbaijan-gp-f1-practice/",
    },
  ],
},
{
  heading: "Practice 3",
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
  ],
};
export const nextRaceContent = {
  raceName: "Qatar Airways Azerbaijan Grand Prix",
  raceDates: "Sep 24th  - Sep 26th, 2026",
  location: "Baku City, Azerbaijan",
  trackInfoUrl: "/img/tracks/bakucity.jpg",

  racePoster: {
    enabled: true,
    backgroundImage: "/img/news/raceposter/baku.jpg",
    downloadImage: "/img/news/raceposter/baku.jpg",
    buttonText: "Race Poster",
  },

 weather: [
  {
    day: "Thursday",
    date: "Sep 24th",
    icon: "☀️",
    temp: "28°C / 20°C",
    summary: "Current outlook: Sunny",
  },
  {
    day: "Friday",
    date: "Sep 25th",
    icon: "🌤️",
    temp: "27°C / 20°C",
    summary: "Current outlook: Mostly sunny",
  },
  {
    day: "Saturday",
    date: "Sep 26th",
    icon: "☀️",
    temp: "26°C / 18°C",
    summary: "Current outlook: Sunny",
  },
],


 sessions:
   WEEKEND_FORMAT !== "regular"
    ? [
        {
          id: "p1",
          type: "practice",
          label: "Practice 1",
          time: "Russell Fastest, full results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P1),
        },
        {
          id: "p2",
          type: "practice",
          label: "Practice 2",
          time: "Russell fastest again, full results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P2),
        },
        {
          id: "p3",
          type: "practice",
          label: "Practice 3",
          time: "5:30 AM ADT",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P3),
        },
        {
          id: "q",
          type: "qualifying",
          label: "Qualifying",
          time: "9:00 AM ADT"  ,
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_Q),
        },
        {
          id: "race",
          type: "race",
          label: "Race",
          time: "8:00 AM ADT",
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
          time: "",
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
      ],
};