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
1	Max Verstappen	NED	Oracle Red Bull Racing	1m47.070s	24
2	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m47.215s	22
3	Charles Leclerc	MON	Scuderia Ferrari HP	1m47.277s	22
4	Isack Hadjar	FRA	Oracle Red Bull Racing	1m47.322s	23
5	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m47.522s	21
6	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m47.603s	23
7	Lando Norris	GBR	McLaren Mastercard F1 Team	1m47.931s	19
8	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m47.959s	22
9	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m48.234s	24
10	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m48.406s	18
11	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m48.432s	24
12	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m48.962s	23
13	Ollie Bearman	GBR	TGR Haas F1 Team	1m49.010s	21
14	Alex Albon	THA	Atlassian Williams F1 Team	1m49.337s	24
15	Franco Colapinto	ARG	BWT Alpine F1 Team	1m49.403s	23
16	Esteban Ocon	FRA	TGR Haas F1 Team	1m49.449s	21
17	Pierre Gasly	FRA	BWT Alpine F1 Team	1m49.712s	23
18	Valtteri Bottas	FIN	Cadillac F1 Team	1m49.829s	21
19	Sergio Perez	MEX	Cadillac F1 Team	1m50.226s	22
20	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m50.862s	25
21	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m52.808s	19
22	Jak Crawford	USA	Aston Martin Aramco F1 Team	1m53.199s	22
`;

const PASTE_P2 = `
1	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m45.944s	17
2	Lando Norris	GBR	McLaren Mastercard F1 Team	1m46.134s	17
3	Max Verstappen	NED	Oracle Red Bull Racing	1m46.416s	20
4	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m46.691s	15
5	Isack Hadjar	FRA	Oracle Red Bull Racing	1m46.714s	19
6	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m46.926s	10
7	Franco Colapinto	ARG	BWT Alpine F1 Team	1m47.147s	19
8	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m47.229s	19
9	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m47.294s	19
10	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m47.434s	15
11	Charles Leclerc	MON	Scuderia Ferrari HP	1m47.468s	18
12	Ollie Bearman	GBR	TGR Haas F1 Team	1m47.792s	16
13	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m47.952s	17
14	Esteban Ocon	FRA	TGR Haas F1 Team	1m47.958s	19
15	Alex Albon	THA	Atlassian Williams F1 Team	1m48.019s	18
16	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m48.256s	18
17	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m48.333s	15
18	Pierre Gasly	FRA	BWT Alpine F1 Team	1m48.955s	15
19	Valtteri Bottas	FIN	Cadillac F1 Team	1m49.199s	18
20	Sergio Perez	MEX	Cadillac F1 Team	1m49.596s	19
21	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m51.131s	16
22	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m51.418s	19

`;

const PASTE_P3 = `
1	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m45.990s	13
2	Lando Norris	GBR	McLaren Mastercard F1 Team	1m46.129s	21
3	Max Verstappen	NED	Oracle Red Bull Racing	1m46.138s	14
4	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m46.357s	12
5	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m46.382s	17
6	Charles Leclerc	MON	Scuderia Ferrari HP	1m46.750s	17
7	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m46.785s	20
8	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m46.924s	20
9	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m47.049s	18
10	Isack Hadjar	FRA	Oracle Red Bull Racing	1m47.096s	19
11	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m47.176s	23
12	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m47.690s	23
13	Franco Colapinto	ARG	BWT Alpine F1 Team	1m47.904s	20
14	Ollie Bearman	GBR	TGR Haas F1 Team	1m47.920s	23
15	Pierre Gasly	FRA	BWT Alpine F1 Team	1m47.949s	21
16	Alex Albon	THA	Atlassian Williams F1 Team	1m47.990s	19
17	Valtteri Bottas	FIN	Cadillac F1 Team	1m48.644s	22
18	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m48.692s	20
19	Esteban Ocon	FRA	TGR Haas F1 Team	1m48.730s	22
20	Sergio Perez	MEX	Cadillac F1 Team	1m48.990s	21
21	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m50.155s	17
22	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m50.631s	15
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
  title: "MOET & CHANDRON BELGIAN GRAND PRIX",
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
            heading: "Sprint Qualifying",            items: [
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
        "Verstappen Leads Ferrari as Red Bull Sets the Pace in Belgian Grand Prix FP1",
      summary: `Max Verstappen set the fastest time in the opening practice session for the Belgian Grand Prix, giving Red Bull an encouraging start to the weekend at Spa. Verstappen recorded a best lap of 1m47.070s and finished 0.145 seconds ahead of Lewis Hamilton, with Charles Leclerc close behind in third.

Red Bull showed particularly strong pace through the middle sector, with Isack Hadjar also running near the front before finishing fourth. Ferrari remained firmly in contention as Hamilton and Leclerc split the two Red Bulls.

Oscar Piastri finished fifth for McLaren but reported a hydraulic pressure issue late in the session. He was able to return the car to the garage. Kimi Antonelli placed sixth ahead of Lando Norris and George Russell.

Aston Martin endured the most difficult opening session. Lance Stroll and rookie Jak Crawford finished at the bottom of the timesheets, both more than five seconds away from Verstappen's benchmark.

FP1 suggested Red Bull and Ferrari could be closely matched at the front, while McLaren and Mercedes still have work to do before the competitive sessions begin.`,
      url: "https://www.autosport.com/f1/news/f1-belgian-gp-verstappen-quickest-in-fp1-over-hamilton/10839409/",
    },
  ],
},
    {
  heading: "Practice 2",
  items: [
    {
      title: "Antonelli Leads Disrupted Belgian Grand Prix Second Practice",
      summary: `Kimi Antonelli put Mercedes on top in second practice for the Belgian Grand Prix, setting a fastest lap of 1:45.944. Lando Norris finished just 0.190 seconds behind in second, with Max Verstappen third and Lewis Hamilton fourth.

The session was interrupted twice. The first red flag was caused by gravel on the circuit, while the second followed a late crash for Pierre Gasly at Les Fagnes. Gasly lost control of the rear of his Alpine and struck the barrier, damaging the rear wing and right rear of the car. The session was not restarted, cutting short the teams’ planned long runs.

Isack Hadjar finished fifth ahead of Oscar Piastri, who missed the opening 20 minutes while McLaren repaired a suspected hydraulic problem. Franco Colapinto placed seventh, while George Russell struggled to eighth and finished more than a second behind Mercedes teammate Antonelli. Arvid Lindblad and Liam Lawson completed the top ten.`,
      url: "https://www.motorsport.com/f1/news/f1-belgian-gp-fp2-report-/10839494/",
    },
  ],
},
{
  heading: "Practice 3",
  items: [
    {
 title: "Antonelli Leads Final Practice as Hamilton Crashes at Spa",

summary:
  "Kimi Antonelli completed a sweep of Friday afternoon and Saturday practice by setting the fastest time in FP3 at Spa. The Mercedes driver posted a 1:45.990 to finish 0.139 seconds ahead of Lando Norris, with Max Verstappen only 0.148 seconds off the pace in third. George Russell placed fourth ahead of Lewis Hamilton, but the session ended dramatically when Hamilton ran through the gravel at Turn 13 and struck the barriers, causing significant damage to the rear of his Ferrari. Charles Leclerc finished sixth, followed by Oscar Piastri, Nico Hulkenberg, Gabriel Bortoleto and Isack Hadjar.",
      url: "https://www.planetf1.com/news/2026-belgian-grand-prix-fp3-results",
    },
  ],
},

          {
            heading: "Qualifying",
            items: [
              {
                title: "",
summary: "",
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
  raceName: "MOET & CHANDRON BELGIAN GRAND PRIX",
  raceDates: "July 17th - 19th, 2026",
  location: "Belgium, Spa-Francorchamps",
  trackInfoUrl: "/img/tracks/belgiumspa.jpg",

  racePoster: {
    enabled: true,
    backgroundImage: "/img/news/raceposter/belgiumspa.jpg",
    downloadImage: "/img/news/raceposter/belgiumspa.jpg",
    buttonText: "Race Poster",
  },

 weather: [
  {
    day: "Friday",
    date: "17th",
    icon: "🌦️",
    temp: "   24°C",
    summary: "Warm with clouds and a chance of showers.",
  },
  {
  day: "Saturday",
  date: "18th",
  icon: "⛈️",
  temp: "22°C",
  summary: "Mostly cloudy with a chance of thunderstorms during qualifying.",
},
{
  day: "Sunday",
  date: "19th",
  icon: "🌦️",
  temp: "20°C",
  summary: "A possible morning shower, followed by partly sunny conditions.",
},
],


 sessions:
   WEEKEND_FORMAT !== "sprint"
    ? [
        {
          id: "p1",
          type: "practice",
          label: "Practice 1",
          time: "Verstappen fastest, results below. ",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P1),
        },
        {
          id: "p2",
          type: "practice",
          label: "Practice 2",
          time: "Antonelli Fastest, results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P2),
        },
        {
          id: "p3",
          type: "practice",
          label: "Practice 3",
          time: "Antonelli Fastest agian, results below",
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
          label: "Race",
          time: "10:00 AM ADT",
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