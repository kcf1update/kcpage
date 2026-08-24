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
1	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m12.949s	35
2	Lando Norris	GBR	McLaren Mastercard F1 Team	1m13.070s	30
3	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m13.074s	36
4	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m13.139s	34
5	Charles Leclerc	MON	Scuderia Ferrari HP	1m13.238s	38
6	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m13.608s	35
7	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m13.784s	34
8	Pierre Gasly	FRA	BWT Alpine F1 Team	1m13.911s	28
9	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m13.992s	29
10	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m14.285s	36
11	Max Verstappen	NED	Oracle Red Bull Racing	1m14.325s	25
12	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	1m14.511s	25
13	Franco Colapinto	ARG	BWT Alpine F1 Team	1m14.826s	31
14	Liam Lawson	NZL	Oracle Red Bull Racing	1m14.861s	29
15	Ollie Bearman	GBR	TGR Haas F1 Team	1m14.874s	32
16	Esteban Ocon	FRA	TGR Haas F1 Team	1m14.897s	31
17	Yuki Tsunoda	JAP	Visa Cash App Racing Bulls F1 Team	1m15.110s	34
18	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m15.199s	24
19	Alex Albon	THA	Atlassian Williams F1 Team	1m15.357s	33
20	Valtteri Bottas	FIN	Cadillac F1 Team	1m15.580s	27
21	Sergio Perez	MEX	Cadillac F1 Team	1m15.700s	27
22	Carlos Sainz	ESP	Atlassian Williams F1 Team	1m16.345s	32

 
`;

const PASTE_P2 = `


`;

const PASTE_P3 = `

`;
const PASTE_SQ = `
1	63	

George Russell

Mercedes	1:13.278	1:12.235	1:11.567	17
2	1	

Lando Norris

McLaren	1:13.071	1:12.189	1:11.608	15
3	16	

Charles Leclerc

Ferrari	1:13.011	1:12.190	1:11.622	16
4	81	

Oscar Piastri

McLaren	1:13.126	1:12.026	1:11.666	15
5	12	

Kimi Antonelli

Mercedes	1:13.668	1:12.511	1:11.794	15
6	3	

Max Verstappen

Red Bull Racing	1:13.585	1:12.771	1:12.094	15
7	44	

Lewis Hamilton

Ferrari	1:13.151	1:12.445	1:12.191	15
8	10	

Pierre Gasly

Alpine	1:13.977	1:12.720	1:12.578	12
9	5	

Gabriel Bortoleto

Audi	1:13.730	1:12.786	1:12.583	12
10	41	

Arvid Lindblad

Racing Bulls	1:14.057	1:12.785	1:12.737	15
11	30	

Liam Lawson

Red Bull Racing	1:13.420	1:13.136		13
12	22	

Yuki Tsunoda

Racing Bulls	1:14.490	1:13.145		11
13	43	

Franco Colapinto

Alpine	1:14.618	1:13.439		9
14	27	

Nico Hulkenberg

Audi	1:14.284	1:13.616		13
15	31	

Esteban Ocon

Haas F1 Team	1:14.503	1:13.893		12
16	23	

Alex Albon

Williams	1:14.596	1:14.294		12
17	87	

Ollie Bearman

Haas F1 Team	1:14.728			6
18	55	

Carlos Sainz

Williams	1:14.738			7
19	18	

Lance Stroll

Aston Martin	1:15.391			5
20	77	

Valtteri Bottas

Cadillac	1:15.472			7
21	11	

Sergio Perez

Cadillac	1:15.545			7
22	14	

Fernando Alonso

Aston Martin	1:16.014			5


	
`;
const PASTE_SPRINT = `
1	George Russell	GBR	Mercedes AMG Petronas F1 Team	24 laps
2	Charles Leclerc	MON	Scuderia Ferrari HP	+1.3s
3	Lando Norris	GBR	McLaren Mastercard F1 Team	+5.196s
4	Andrea Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	+5.5s
5	Oscar Piastri	AUS	McLaren Mastercard F1 Team	+10.185s
6	Max Verstappen	NED	Oracle Red Bull Racing	+10.529s
7	Lewis Hamilton	GBR	Scuderia Ferrari HP	+12.188s
8	Pierre Gasly	FRA	BWT Alpine F1 Team	+42.510s
9	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	+44.437s
10	Arvid Lindblad	GBR	Racing Bulls	+44.971s
11	Liam Lawson	NZD	Oracle Red Bull Racing	+47.471s
12	Franco Colapinto	ARG	BWT Alpine F1 Team	+54.466s
13	Yuki Tsunoda	JAP	Racing Bulls	+56.483s
14	Esteban Ocon	FRA	TGR Haas F1 Team	+66.098s
15	Ollie Bearman	GBR	TGR Haas F1 Team	+66.588s
16	Alex Albon	THA	Atlassian Williams F1 Team	+74.632s
17	Lance Stroll	CAN	Aston Martin Aramco F1 Team	+74.650s
18	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	+75.284s
19	Valtteri Bottas	FIN	Cadillac F1 Team	1 lap
20	Carlos Sainz	ESP	Atlassian Williams F1 Team	1 lap
21	Sergio Perez	MEX	Cadillac F1 Team	3 laps
22	Nico Hulkenberg	GER	Audi Revolut F1 Team	17 laps

`;
const PASTE_Q = `
1	1	

Lando Norris

McLaren	1:12.695	1:11.628	1:11.163	21
2	63	

George Russell

Mercedes	1:12.924	1:11.959	1:11.265	20
3	12	

Kimi Antonelli

Mercedes	1:13.022	1:11.915	1:11.296	21
4	81	

Oscar Piastri

McLaren	1:12.610	1:11.641	1:11.305	21
5	44	

Lewis Hamilton

Ferrari	1:12.673	1:11.970	1:11.494	25
6	16	

Charles Leclerc

Ferrari	1:13.064	1:11.910	1:11.558	23
7	3	

Max Verstappen

Red Bull Racing	1:13.290	1:11.874	1:11.618	22
8	30	

Liam Lawson

Red Bull Racing	1:13.392	1:12.301	1:11.733	25
9	5	

Gabriel Bortoleto

Audi	1:13.142	1:12.433	1:12.079	22
10	41	

Arvid Lindblad

Racing Bulls	1:13.074	1:12.525	1:12.185	22
11	10	

Pierre Gasly

Alpine	1:13.115	1:12.616		14
12	22	

Yuki Tsunoda

Racing Bulls	1:13.085	1:12.627		15
13	27	

Nico Hulkenberg

Audi	1:13.188	1:12.797		19
14	43	

Franco Colapinto

Alpine	1:13.322	1:12.800		13
15	31	

Esteban Ocon

Haas F1 Team	1:13.544	1:13.137		17
16	23	

Alex Albon

Williams	1:13.552	1:13.182		16
17	55	

Carlos Sainz

Williams	1:13.574			10
18	14	

Fernando Alonso

Aston Martin	1:13.650			10
19	18	

Lance Stroll

Aston Martin	1:13.818			10
20	87	

Ollie Bearman

Haas F1 Team	1:13.826			11
21	77	

Valtteri Bottas

Cadillac	1:14.371			10
22	11	

Sergio Perez

Cadillac	1:14.600			10


`;

const PASTE_RACE = `
1	Lando Norris	GBR	McLaren Mastercard F1 Team	72
2	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	+11.5s
3	George Russell	GBR	Mercedes AMG Petronas F1 Team	+15.9s
4	Lewis Hamilton	GBR	Scuderia Ferrari HP	+16.7s
5	Charles Leclerc	MON	Scuderia Ferrari HP	+17.2s
6	Oscar Piastri	AUS	McLaren Mastercard F1 Team	+32.3s
7	Liam Lawson	NZL	Oracle Red Bull Racing	+79.9s
8	Nico Hulkenberg	GER	Audi Revolut F1 Team	+1 Lap
9	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	+1 Lap
10	Pierre Gasly	FRA	BWT Alpine F1 Team	+1 Lap
11	Yuki Tsunoda	JAP	Visa Cash App Racing Bulls F1 Team	+1 Lap
12	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	+1 Lap
13	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	+1 Lap
14	Franco Colapinto	ARG	BWT Alpine F1 Team	+2 Laps
15	Sergio Perez	MEX	Cadillac F1 Team	+2 Laps
16	Carlos Sainz	ESP	Atlassian Williams F1 Team	+2 Laps
17	Alex Albon	THA	Atlassian Williams F1 Team	+6 Laps
DNF	Valtteri Bottas	FIN	Cadillac F1 Team	DNF
DNF	Esteban Ocon	FRA	TGR Haas F1 Team	DNF
DNF	Lance Stroll	CAN	Aston Martin Aramco F1 Team	DNF
DNF	Ollie Bearman	GBR	TGR Haas F1 Team	DNF
DNF	Max Verstappen	NED	Oracle Red Bull Racing	DNF

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
    WEEKEND_FORMAT === "sprint"
      ? [
          {
            heading: "Practice",
            items: [
              {
                title: "Antonelli Leads Sole Practice as Verstappen Struggles",
                summary:
                  "Kimi Antonelli topped the only practice session at Zandvoort, finishing 0.121 seconds ahead of Lando Norris, with George Russell third. Lewis Hamilton and Charles Leclerc completed the top five, while downshift problems left Max Verstappen in 11th.",
                url: "https://www.crash.net/f1/news/1102635/1/kimi-antonelli-edges-lando-norris-crucial-zandvoort-practice",
              },
            ],
          },
          {
            heading: "Sprint Qualifying",            items: [
              {
                title: "Russell Takes Sprint Pole at Zandvoort",
                summary:
                  "George Russell claimed pole position for the Dutch Grand Prix Sprint with a lap of 1:11.567, beating Lando Norris by just 0.041 seconds. Charles Leclerc qualified third ahead of Oscar Piastri, while championship leader Kimi Antonelli finished fifth and Max Verstappen took sixth in front of his home crowd. Source: Reuters",
                url: "https://www.the-race.com/formula-1/dutch-gp-f1-sprint-qualifying-2026-russell-pole/",
              },
            ],
          },
          {
            heading: "Sprint Race",
            items: [
              {
                title: "Russell Controls the Dutch Grand Prix Sprint",
                summary:
                  "George Russell led every lap at Zandvoort to claim his third Sprint victory of the season. Charles Leclerc passed Lando Norris for second, while Max Verstappen finished sixth. | George Russell leidde elke ronde op Zandvoort en behaalde zijn derde sprintzege van het seizoen. Charles Leclerc passeerde Lando Norris voor de tweede plaats, terwijl Max Verstappen als zesde finishte.",
                url: "https://www.formula1.com/en/latest/article/russell-surges-to-victory-in-zandvoort-sprint-ahead-of-leclerc-and-norris.3evWfVZ0yONnfGGp3t8qyK",
              },
            ],
          },
          {
            heading: "Qualifying",
            items: [
              {
                title: "Norris Snatches Dutch Grand Prix Pole From Russell",
                summary:
                  "Lando Norris produced a 1:11.163 on his final lap to take pole from George Russell as rain began falling at Zandvoort. Kimi Antonelli qualified third, with Oscar Piastri fourth and Max Verstappen seventh. Formula 1",
                url: "https://www.formula1.com/en/latest/article/norris-denies-russell-pole-position-in-gripping-conclusion-to-qualifying-for-dutch-grand-prix.2DoHZDC14R5tY7ygGaHCz",
              },
            ],
          },
          {
            heading: "Race",
            items: [
              {
                title: "Norris Wins as Mercedes Team Orders Shape Dutch Grand Prix Podium",
                summary:
                  "Lando Norris fought past Kimi Antonelli to win the Dutch Grand Prix after Max Verstappen’s opening-lap crash brought out a red flag. Mercedes later ordered George Russell to let Antonelli through for second, leaving Russell third ahead of Lewis Hamilton. The Race",
                url: "https://www.the-race.com/formula-1/our-verdict-on-norris-win-and-mercedes-team-orders/",
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
        "",
      summary: "",
      url: "",
    },
  ],
},
    {
  heading: "Practice 2",
  items: [
    {
      title: "",
      summary: "",
      url: "",
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
  raceName: "HEINEKEN DUTCH GRAND PRIX",
  raceDates: "Aug 21st - 23rd, 2026",
  location: "Circuit Zandvoort",
  trackInfoUrl: "/img/tracks/zandvoort.jpg",

  racePoster: {
    enabled: true,
    backgroundImage: "/img/news/raceposter/dutchgp.jpg",
    downloadImage: "/img/news/raceposter/dutchgp.jpg",
    buttonText: "Race Poster",
  },

 weather: [
 {
  day: "Friday",
  date: "Aug 21st",
  icon: "⛅",
  temp: "19°C / 14°C",
  summary: "Partly cloudy",
},
{
  day: "Saturday",
  date: "Aug 22nd",
  icon: "🌤️",
  temp: "19°C / 14°C",
  summary: "Partly sunny",
},
{
  day: "Sunday",
  date: "Aug 23rd",
  icon: "🌤️",
  temp: "19°C / 14°C",
  summary: "Partly sunny",
},

],


 sessions:
   WEEKEND_FORMAT !== "sprint"
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
          label: "Race",
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
          time: "Antonelli Fastest, full results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P1),
        },
        {
          id: "sq",
          type: "sprint_shootout",
          label: "Sprint Qualifying",
          time: "Russell on the pole! Full results below",
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_SQ),
        },
        {
          id: "sprint",
          type: "sprint_race",
          label: "Sprint Race",
          time: "Russell wins Sprint! Results below",
          trackNote: "",
          extraNote: "",
          results: parseRacePaste(PASTE_SPRINT),
        },
        {
          id: "q",
          type: "qualifying",
          label: "Qualifying",
          time: "Lando on Pole, Full results below",
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_Q),
        },
        {
          id: "race",
          type: "race",
          label: "Race Results",
          time: "Norris wins, Full results below",
          trackNote: "",
          extraNote: "",
          results: parseRacePaste(PASTE_RACE),
        },
      ],
};