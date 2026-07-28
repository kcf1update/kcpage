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
1	Charles Leclerc	MON	Scuderia Ferrari HP	1m19.075s	19
2	Max Verstappen	NED	Oracle Red Bull Racing	1m19.559s	25
3	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m19.618s	23
4	Isack Hadjar	FRA	Oracle Red Bull Racing	1m19.997s	25
5	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m20.066s	21
6	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m20.360s	30
7	Frederik Vesti	DEN	Mercedes AMG Petronas F1 Team	1m20.467s	24
8	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m20.623s	29
9	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m20.760s	28
10	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m20.866s	28
11	Lando Norris	GBR	McLaren Mastercard F1 Team	1m21.024s	26
12	Esteban Ocon	FRA	TGR Haas F1 Team	1m21.051s	24
13	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m21.550s	20
14	Pierre Gasly	FRA	BWT Alpine F1 Team	1m21.704s	29
15	Alex Albon	THA	Atlassian Williams F1 Team	1m21.819s	28
16	Leonardo Fornaroli	ITA	McLaren Mastercard F1 Team	1m21.890s	29
17	Ryo Hirakawa	JAP	TGR Haas F1 Team	1m22.001s	25
18	Sergio Perez	MEX	Cadillac F1 Team	1m22.089s	22
19	Paul Aron	EST	BWT Alpine F1 Team	1m22.168s	28
20	Colton Herta	USA 	Cadillac F1 Team	1m23.118s	28
21	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m23.471s	11
22	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m23.734s	23
`;

const PASTE_P2 = `
1	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m18.729s	25
2	Charles Leclerc	MON	Scuderia Ferrari HP	1m18.877s	29
3	Lando Norris	GBR	McLaren Mastercard F1 Team	1m19.228s	30
4	Max Verstappen	NED	Oracle Red Bull Racing	1m19.421s	26
5	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m19.662s	29
6	Isack Hadjar	FRA	Oracle Red Bull Racing	1m19.800s	19
7	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m20.041s	29
8	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m20.101s	28
9	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m20.125s	30
10	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m20.253s	28
11	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m20.474s	26
12	Esteban Ocon	FRA	TGR Haas F1 Team	1m20.557s	26
13	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m20.693s	30
14	Pierre Gasly	FRA	BWT Alpine F1 Team	1m20.816s	24
15	Ollie Bearman	GBR	TGR Haas F1 Team	1m20.950s	27
16	Alex Albon	THA	Atlassian Williams F1 Team	1m20.973s	33
17	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m21.426s	31
18	Valtteri Bottas	FIN	Cadillac F1 Team	1m21.442s	30
19	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m21.719s	24
20	Sergio Perez	MEX	Cadillac F1 Team	1m21.792s	27
21	Franco Colapinto	ARG	BWT Alpine F1 Team	1m22.531s	11
22	Lance Stroll	CAN	Aston Martin Aramco F1 Team	No time set	 

`;

const PASTE_P3 = `
1	Lando Norris	GBR	McLaren Mastercard F1 Team	1m17.939s	20
2	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m18.056s	22
3	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m18.068s	15
4	Charles Leclerc	MON	Scuderia Ferrari HP	1m18.291s	24
5	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m18.438s	21
6	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m18.541s	17
7	Max Verstappen	NED	Oracle Red Bull Racing	1m18.656s	13
8	Isack Hadjar	FRA	Oracle Red Bull Racing	1m18.943s	17
9	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m19.088s	22
10	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m19.160s	23
11	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m19.338s	22
12	Pierre Gasly	FRA	BWT Alpine F1 Team	1m19.723s	19
13	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m19.895s	5
14	Franco Colapinto	ARG	BWT Alpine F1 Team	1m20.055s	29
15	Esteban Ocon	FRA	TGR Haas F1 Team	1m20.295s	17
16	Ollie Bearman	GBR	TGR Haas F1 Team	1m20.312s	14
17	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m20.393s	17
18	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m20.933s	20
19	Valtteri Bottas	FIN	Cadillac F1 Team	1m21.299s	15
20	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m21.406s	16
21	Alex Albon	THA	Atlassian Williams F1 Team	1m21.513s	12
22	Sergio Perez	MEX	Cadillac F1 Team	No time set	1
`;
const PASTE_SQ = `


    
`;
const PASTE_SPRINT = `

`;
const PASTE_Q = `
 1	1	

Lando Norris

McLaren	1:18.277	1:17.456	1:17.207	16
2	44	

Lewis Hamilton

Ferrari	1:18.730	1:17.803	1:17.219	15
3	16	

Charles Leclerc

Ferrari	1:18.984	1:17.626	1:17.445	20
4	12	

Kimi Antonelli

Mercedes	1:18.726	1:18.393	1:17.479	20
5	81	

Oscar Piastri

McLaren	1:18.891	1:17.928	1:17.684	15
6	3	

Max Verstappen

Red Bull Racing	1:18.656	1:18.249	1:17.725	18
7	63	

George Russell

Mercedes	1:18.856	1:18.445	1:17.760	20
8	6	

Isack Hadjar

Red Bull Racing	1:18.754	1:17.872	1:17.856	14
9	41	

Arvid Lindblad

Racing Bulls	1:19.233	1:18.360	1:18.281	18
10	27	

Nico Hulkenberg

Audi	1:18.796	1:18.639	1:18.686	18
11	30	

Liam Lawson

Racing Bulls	1:19.161	1:18.765		12
12	10	

Pierre Gasly

Alpine	1:19.741	1:18.844		12
13	43	

Franco Colapinto

Alpine	1:19.771	1:19.027		12
14	5	

Gabriel Bortoleto

Audi	1:19.069	1:19.105		11
15	31	

Esteban Ocon

Haas F1 Team	1:20.010	1:19.734		12
16	14	

Fernando Alonso

Aston Martin	1:20.126	1:19.808		15
17	87	

Oliver Bearman

Haas F1 Team	1:20.233			6
18	55	

Carlos Sainz

Williams	1:20.621			9
19	23	

Alexander Albon

Williams	1:20.658			9
20	18	

Lance Stroll

Aston Martin	1:20.659			8
21	77	

Valtteri Bottas

Cadillac	1:20.886			10
22	11	

Sergio Perez

Cadillac	1:21.322			9

`;

const PASTE_RACE = `
1	Lando Norris	GBR	McLaren Mastercard F1 Team	70 Laps
2	Max Verstappen	NED	Oracle Red Bull Racing	+15.0s
3	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	+18.7s
4	Charles Leclerc	MON	Scuderia Ferrari HP	+23.8s
5	Lewis Hamilton	GBR	Scuderia Ferrari HP	+24.5s
6	Isack Hadjar	FRA	Oracle Red Bull Racing	+55.4s
7	George Russell	GBR	Mercedes AMG Petronas F1 Team	+57.5s
8	Liam Lawson	NZD	Racing Bulls	+1 Lap
9	Nico Hulkenberg	GER	Audi Revolut F1 Team	+1 Lap
10	Arvid Lindblad	GBR	Racing Bulls	+1 Lap
11	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	+1 Lap
12	Pierre Gasly	FRA	BWT Alpine F1 Team	+1 Lap
13	Lance Stroll	CAN	Aston Martin Aramco F1 Team	+1 Lap
14	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	+1 Lap
15	Franco Colapinto	ARG	BWT Alpine F1 Team	+2 Laps
16	Esteban Ocon	FRA	TGR Haas F1 Team	+2 Laps
17	Alex Albon	THA	Atlassian Williams F1 Team	+2 Laps
18	Carlos Sainz	ESP	Atlassian Williams F1 Team	+2 Laps
19	Ollie Bearman	GBR	TGR Haas F1 Team	+2 Laps
DNF	Oscar Piastri	AUS	McLaren Mastercard F1 Team	 
DNF	Sergio Perez	MEX	Cadillac F1 Team	 
DNF	Valtteri Bottas	FIN	Cadillac F1 Team	 

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
        "Leclerc Fastest as Trouble Hits Ferrari and Aston Martin",
      summary: "Charles Leclerc topped FP1 with a 1:19.075, finishing 0.484s ahead of Max Verstappen, with Lewis Hamilton third. The session was interrupted when Lance Stroll suffered a left-rear suspension failure, while Leclerc later stopped with a mechanical issue. Five substitute drivers also took part in the opening session.",
      url: "https://www.grandprix247.com/formula-1-news/hungarian-grand-prix-fp1-charles-leclerc-fastest-from-max-verstappen-aston-martin-updated-car-breaks-on-debut",
    },
  ],
},
{
  heading: "Practice 2",
  items: [
   {
      title: "Hamilton Leads Ferrari 1-2 as Mercedes Struggle in FP2",
      summary: "Lewis Hamilton topped FP2 in Hungary with a 1:18.729, leading Charles Leclerc by 0.148 seconds as Ferrari completed a strong Friday. Lando Norris finished third ahead of Max Verstappen, while Mercedes struggled for pace and balance. Franco Colapinto returned to the Alpine after sitting out FP1.",
      url: "https://www.formula1.com/en/latest/article/fp2-hamilton-beats-leclerc-to-top-spot-in-tricky-second-practice-for-hungarian-grand-prix.7qr57bgnk0ba1rXSyrijLw",
    },
  ],
},
{
  heading: "Practice 3",
  items: [
   {
 title: "Norris Leads Tight FP3 as Hamilton and Antonelli Close In",

summary:
  "Lando Norris topped final practice in Hungary with a 1:17.939, just 0.117 seconds ahead of Lewis Hamilton and 0.129 clear of Kimi Antonelli. Charles Leclerc placed fourth, Oscar Piastri fifth and Max Verstappen seventh, leaving the front of the field tightly packed before qualifying.",
      url: "https://www.espn.co.uk/f1/story/_/id/49431226/mclarens-lando-norris-fastest-final-practice-ferrari-mercedes-mix-hungarian-grand-prix-formula-1-hungaroring",
    },
  ],
},

          {
            heading: "Qualifying",
            items: [
              {
                title: "Norris Ends Mercedes Pole Streak in Hungary",
summary:
  "Lando Norris produced a superb final qualifying lap to take pole position for the Hungarian Grand Prix, beating Lewis Hamilton by just 0.012 seconds with a 1:17.207. The result marked the first Grand Prix pole of the 2026 season for a non-Mercedes driver. Charles Leclerc qualified third, Kimi Antonelli fourth and Oscar Piastri fifth, setting up a tightly matched front of the grid for Sunday’s race.",
                url: "https://www.the-race.com/formula-1/norris-snatches-pole-from-hamilton-in-f1-hungarian-gp-qualifying/",
              },
            ],
          },
          {
            heading: "Race",
            items: [
               {
                title: "Norris Claims First 2026 Win After Piastri Drama in Hungary",

 summary:
        "Lando Norris claimed his first victory of the 2026 season after a tense Hungarian Grand Prix. Oscar Piastri led early, but Norris moved ahead during the second pit-stop sequence. Piastri later retired with a gearbox problem, promoting Max Verstappen to second and Kimi Antonelli to third.",
                url: "https://www.planetf1.com/news/hungarian-grand-prix-2026-race-report",
              },
            ],
          },
        ],
};
export const nextRaceContent = {
  raceName: "AWS HUNGARIAN GRAND PRIX",
  raceDates: "July 24th - 26th, 2026",
  location: "Hungaroring circuit",
  trackInfoUrl: "/img/tracks/hungaroring.jpg",

  racePoster: {
    enabled: true,
    backgroundImage: "/img/news/raceposter/Hungariangrandprix.jpg",
    downloadImage: "/img/news/raceposter/Hungariangrandprix.jpg",
    buttonText: "Race Poster",
  },
 weather: [
    {
    day: "Friday",
    date: "24th",
    icon: "🌤️",
    temp: "24°C",
    summary: "Partly sunny and mild, with no rain currently forecast.",
  },
  {
    day: "Saturday",
    date: "25th",
    icon: "🌤️",
    temp: "28°C",
    summary: "Warm and mostly sunny, with light winds and dry conditions expected.",
  },
  {
    day: "Sunday",
    date: "26th",
    icon: "⛈️",
    temp: "31°C",
    summary: "Hot with a risk of thunderstorms and showers during race day but may come only after the race is complete.",
  },
  ],



 sessions:
  WEEKEND_FORMAT !== "regular"
    ? [
         {
          id: "p1",
          type: "practice",
          label: "Practice 1",
          time: "Leclerc fastest, results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P1),
        },
        {
          id: "p2",
          type: "practice",
          label: "Practice 2",
          time: "Hamilton fastest, results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P2),
        },
        {
          id: "p3",
          type: "practice",
          label: "Practice 3",
          time: "Lando Fastest! Results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P3),
        },
        {
          id: "q",
          type: "qualifying",
          label: "Qualifying",
          time: "Norris on Pole, Results below",
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_Q),
        },
        {
          id: "race",
          type: "race",
          label: "Race",
          time: "Norris Wins! Results below",
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