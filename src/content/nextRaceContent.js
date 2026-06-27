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
1	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m07.796s	29
2	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m07.836s	30
3	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m07.913s	26
4	Max Verstappen	NED	Oracle Red Bull Racing	1m08.077s	17
5	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m08.461s	25
6	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m08.726s	18
7	Lando Norris	GBR	McLaren Mastercard F1 Team	1m08.873s	9
8	Franco Colapinto	ARG	BWT Alpine F1 Team	1m08.962s	27
9	Dino Beganovic	SWE	Scuderia Ferrari HP	1m09.054s	26
10	Ollie Bearman	GBR	TGR Haas F1 Team	1m09.071s	26
11	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m09.165s	30
12	Isack Hadjar	FRA	Oracle Red Bull Racing	1m09.481s	11
13	Valtteri Bottas	FIN	Cadillac F1 Team	1m09.521s	21
14	Pierre Gasly	FRA	BWT Alpine F1 Team	1m09.546s	28
15	Ayumu Iwasa	JAP	Visa Cash App Racing Bulls F1 Team	1m09.637s	19
16	Alex Albon	THA	Atlassian Williams F1 Team	1m09.644s	31
17	Paul Aron	EST	Audi Revolut F1 Team	1m09.646s	20
18	Luke Browning	GBR	Atlassian Williams F1 Team	1m09.979s	29
19	Ryo Hirakawa	JAP	TGR Haas F1 Team	1m10.493s	23
20	Jak Crawford	USA	Aston Martin Aramco F1 Team	1m11.202s	22
21	Sergio Perez	MEX	Cadillac F1 Team	1m11.283s	14
22	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m11.333s	21
`;

const PASTE_P2 = `
1	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m07.014s	32
2	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m07.251s	32
3	Lando Norris	GBR	McLaren Mastercard F1 Team	1m07.339s	32
4	Max Verstappen	NED	Oracle Red Bull Racing	1m07.564s	29
5	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m07.611s	33
6	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m07.637s	25
7	Isack Hadjar	FRA	Oracle Red Bull Racing	1m07.758s	28
8	Charles Leclerc	MON	Scuderia Ferrari HP	1m07.855s	35
9	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m08.235s	34
10	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m08.300s	30
11	Pierre Gasly	FRA	BWT Alpine F1 Team	1m08.376s	33
12	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m08.378s	29
13	Ollie Bearman	GBR	TGR Haas F1 Team	1m08.532s	33
14	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m08.559s	32
15	Esteban Ocon	FRA	TGR Haas F1 Team	1m08.830s	33
16	Franco Colapinto	ARG	BWT Alpine F1 Team	1m08.831s	30
17	Alex Albon	THA	Atlassian Williams F1 Team	1m08.838s	34
18	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m09.131s	30
19	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m10.544s	27
20	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m10.698s	32
21	Valtteri Bottas	FIN	Cadillac F1 Team	1m11.307s	6
22	Sergio Perez	MEX	Cadillac F1 Team	No time set	2
`;

const PASTE_P3 = `
1	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m07.096s	19
2	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m07.134s	17
3	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m07.211s	22
4	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m07.344s	17
5	Lando Norris	GBR	McLaren Mastercard F1 Team	1m07.360s	20
6	Max Verstappen	NED	Oracle Red Bull Racing	1m07.369s	16
7	Charles Leclerc	MON	Scuderia Ferrari HP	1m07.452s	24
8	Isack Hadjar	FRA	Oracle Red Bull Racing	1m07.912s	27
9	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m08.031s	21
10	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m08.109s	24
11	Pierre Gasly	FRA	BWT Alpine F1 Team	1m08.193s	16
12	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m08.303s	22
13	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m08.311s	22
14	Franco Colapinto	ARG	BWT Alpine F1 Team	1m08.394s	18
15	Ollie Bearman	GBR	TGR Haas F1 Team	1m08.529s	19
16	Esteban Ocon	FRA	TGR Haas F1 Team	1m08.707s	15
17	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m08.843s	27
18	Alex Albon	THA	Atlassian Williams F1 Team	1m08.992s	25
19	Sergio Perez	MEX	Cadillac F1 Team	1m09.532s	29
20	Valtteri Bottas	FIN	Cadillac F1 Team	1m09.740s	24
21	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m10.421s	21
22	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m10.567s	19
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
  title: "LENOVO AUSTRIAN GRAND PRIX",
  sections:
    WEEKEND_FORMAT === "Sprint"
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
      title: "Antonelli Leads Mercedes 1-2 As FP1 Gets Messy In Austria",
      summary:
        "Mercedes made the early statement in first practice for the Austrian Grand Prix, with Kimi Antonelli leading a Mercedes 1-2 ahead of George Russell. Oscar Piastri put McLaren third, but Lando Norris lost track time with a hydraulic issue, while Max Verstappen also had a disrupted session after software problems affected Red Bull’s running. The session ended with a red flag after Sergio Perez stopped his Cadillac at Turn 3, giving FP1 a messy finish despite Mercedes looking settled at the front.",
      url: "https://www.crash.net/f1/news/1099399/1/kimi-antonelli-heads-mercedes-1-2-red-bull-lando-norris-hit-trouble-f1-austrian",
    },
  ],
},
{
  heading: "Practice 2",
  items: [
    {
      title: "Antonelli tops FP2 as Mercedes keep control in Austria",
      summary:
        "Kimi Antonelli completed a perfect opening day at the Austrian Grand Prix by topping FP2 after also leading FP1 earlier on Friday. Oscar Piastri kept McLaren close in second, but Mercedes still looked like the team with the cleanest pace over the first day at the Red Bull Ring.George Russell had a more difficult session on the other side of the Mercedes garage, finishing well off Antonelli’s benchmark. That gap gives Mercedes something to sort through overnight, while McLaren will take some encouragement from Piastri’s pace after Lando Norris’ earlier hydraulic issue disrupted his FP1 running.",

      url: "https://racingnews365.com/kimi-antonelli-opening-day-perfection-as-george-russell-suffers-major-deficit",
    },
  ],
},
{
  heading: "Practice 3",
  items: [
    {
      title: "Russell Leads Mercedes 1-2 As Ferrari Close In During FP3",
summary: "George Russell topped final practice for the Austrian Grand Prix with a late 1m07.096s, edging Mercedes team-mate Kimi Antonelli by just 0.038s. Lewis Hamilton put Ferrari third and only 0.115s off the pace, while Oscar Piastri, Lando Norris and Max Verstappen all stayed within three tenths before qualifying.",
      url: "https://www.the-race.com/formula-1/what-happened-in-final-f1-practice-at-austrian-gp/",
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
  raceName: "LENOVO AUSTRIAN GRAND PRIX",
  raceDates: "June 26 - 27, 2026",
  location: "Spielberg, Styria, Austria.",
  trackInfoUrl: "/img/tracks/redbullring.jpg",

  racePoster: {
    enabled: true,
    backgroundImage: "/img/news/raceposter/austriangrandprix.jpg",
    downloadImage: "/img/news/raceposter/austriangrandprix.jpg",
    buttonText: "Race Poster",
  },

 weather: [
    {
      day: "Friday",
      date: "June 26th",
      icon: "☀️",
      temp: "33°C / 15°C",
      summary: "Very warm with plenty of sunshine. Extreme high temperature warning in effect for the Murtal region.",
    },
    {
      day: "Saturday",
      date: "June 27th",
      icon: "☀️",
      temp: "33°C / 17°C",
      summary: "Sunny and hot. Heat stress could be a factor for fans, teams, tyres and cooling.",
    },
    {
      day: "Sunday",
      date: "June 28th",
      icon: "🌤️",
      temp: "34°C / 16°C",
      summary: "Partly sunny and very hot for race day. The race is expected to run in demanding conditions.",
    },
  ],



 sessions:
  WEEKEND_FORMAT === "regular"
    ? [
        {
          id: "p1",
          type: "practice",
          label: "Practice 1",
          time: "Antonelli fastest, Results below. I apologize results will not look correct for FP1 because of substitute drivers",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P1),
        },
        {
          id: "p2",
          type: "practice",
          label: "Practice 2",
          time: "Kimi Antonelli fastest again! Results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P2),
        },
        {
          id: "p3",
          type: "practice",
          label: "Practice 3",
          time: "Russell fastest this time! Results below",
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