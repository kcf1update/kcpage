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
1	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m34.077s	28
2	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m34.363s	27
3	Charles Leclerc	MON	Scuderia Ferrari HP	1m34.536s	27
4	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m34.620s	27
5	Max Verstappen	NED	Oracle Red Bull Racing	1m34.703s	25
6	Lando Norris	GBR	McLaren Mastercard F1 Team	1m34.947s	27
7	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m35.033s	28
8	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m35.148s	22
9	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m35.529s	26
10	Liam Lawson	NWZ	Oracle Red Bull Racing	1m35.539s	26
11	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m35.652s	27
12	Esteban Ocon	FRA	TGR Haas F1 Team	1m35.757s	25
13	Franco Colapinto	ARG	BWT Alpine F1 Team	1m35.834s	24
14	Pierre Gasly	FRA	BWT Alpine F1 Team	1m35.933s	23
15	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m36.473s	27
16	Ollie Bearman	GBR	TGR Haas F1 Team	1m36.757s	24
17	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m36.870s	30
18	Yuki Tsunoda	JAP	Visa Cash App Racing Bulls F1 Team	1m36.939s	16
19	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m37.254s	26
20	Alex Albon	THA	Atlassian Williams F1 Team	1m37.591s	25
21	Valtteri Bottas	FIN	Cadillac F1 Team	1m38.150s	26
22	Sergio Perez	MEX	Cadillac F1 Team	1m38.818s	25



 
`;

const PASTE_P2 = `
1	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m33.662s	23
2	Charles Leclerc	MON	Scuderia Ferrari HP	1m33.775s	25
3	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m33.811s	22
4	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m33.890s	15
5	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m33.999s	24
6	Max Verstappen	NED	Oracle Red Bull Racing	1m34.063s	21
7	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m34.200s	23
8	Yuki Tsunoda	JAP	Visa Cash App Racing Bulls F1 Team	1m34.758s	25
9	Esteban Ocon	FRA	TGR Haas F1 Team	1m34.867s	25
10	Liam Lawson	NWZ	Oracle Red Bull Racing	1m34.938s	20
11	Pierre Gasly	FRA	BWT Alpine F1 Team	1m34.959s	20
12	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m35.060s	21
13	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m35.170s	24
14	Ollie Bearman	GBR	TGR Haas F1 Team	1m35.203s	25
15	Franco Colapinto	ARG	BWT Alpine F1 Team	1m35.886s	21
16	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m36.291s	24
17	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m36.780s	16
18	Alex Albon	THA	Atlassian Williams F1 Team	1m36.936s	22
19	Sergio Perez	MEX	Cadillac F1 Team	1m37.195s	23
20	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m37.273s	20
21	Valtteri Bottas	FIN	Cadillac F1 Team	1m37.727s	23
22	Lando Norris	GBR	McLaren Mastercard F1 Team	No time set	2


`;

const PASTE_P3 = `
1	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m32.797s	13
2	Charles Leclerc	MON	Scuderia Ferrari HP	1m32.963s	13
3	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m32.986s	12
4	Lando Norris	GBR	McLaren Mastercard F1 Team	1m33.033s	13
5	Max Verstappen	NED	Oracle Red Bull Racing	1m33.172s	9
6	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m33.499s	11
7	Liam Lawson	NWZ	Oracle Red Bull Racing	1m33.902s	14
8	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m33.933s	14
9	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m34.284s	5
10	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m34.288s	15
11	Franco Colapinto	ARG	BWT Alpine F1 Team	1m34.346s	14
12	Esteban Ocon	FRA	TGR Haas F1 Team	1m34.430s	12
13	Ollie Bearman	GBR	TGR Haas F1 Team	1m34.481s	12
14	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m34.505s	7
15	Yuki Tsunoda	JAP	Visa Cash App Racing Bulls F1 Team	1m34.565s	12
16	Pierre Gasly	FRA	BWT Alpine F1 Team	1m34.971s	13
17	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m35.020s	17
18	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m35.464s	15
19	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m35.570s	12
20	Valtteri Bottas	FIN	Cadillac F1 Team	1m36.441s	13
21	Sergio Perez	MEX	Cadillac F1 Team	1m36.670s	13
22	Alex Albon	THA	Atlassian Williams F1 Team	No time set	2
 
`;
const PASTE_SQ = `

	
`;
const PASTE_SPRINT = `


`;
const PASTE_Q = `
1	1	

Lando Norris

McLaren	1:33.469	1:32.873	1:31.824	19
2	12	

Kimi Antonelli

Mercedes	1:33.267	1:32.591	1:31.835	20
3	3	

Max Verstappen

Red Bull Racing	1:33.381	1:32.431	1:31.964	18
4	44	

Lewis Hamilton

Ferrari	1:33.531	1:32.710	1:32.013	21
5	16	

Charles Leclerc

Ferrari	1:33.532	1:32.755	1:32.019	21
6	63	

George Russell

Mercedes	1:33.211	1:32.850	1:32.149	22
7	81	

Oscar Piastri

McLaren	1:33.829	1:33.204	1:32.294	22
8	30	

Liam Lawson

Red Bull Racing	1:33.310	1:32.780	1:32.316	18
9	43	

Franco Colapinto

Alpine	1:33.963	1:33.038	1:32.903	17
10	41	

Arvid Lindblad

Racing Bulls	1:34.340	1:33.204	1:33.041	21
11	27	

Nico Hulkenberg

Audi	1:34.417	1:33.223		13
12	5	

Gabriel Bortoleto

Audi	1:33.986	1:33.388		12
13	31	

Esteban Ocon

Haas F1 Team	1:34.667	1:33.667		11
14	10	

Pierre Gasly

Alpine	1:34.246	1:33.753		11
15	22	

Yuki Tsunoda

Racing Bulls	1:34.311	1:34.084		15
16	23	

Alex Albon

Williams	1:35.307	1:35.532		14
17	55	

Carlos Sainz

Williams	1:35.312			9
18	14	

Fernando Alonso

Aston Martin	1:35.388			9
19	11	

Sergio Perez

Cadillac	1:35.913			9
20	77	

Valtteri Bottas

Cadillac	1:38.011			8


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
        "Russell Leads Mercedes 1-2 as Madring Makes Dramatic F1 Debut",
      summary: "George Russell set the early standard at Madrid’s new Madring circuit, leading teammate Kimi Antonelli in a commanding Mercedes 1-2 during the venue’s first-ever Formula 1 practice session. Russell’s 1:34.077 put him 0.286 seconds clear of the championship leader, with Charles Leclerc third for Ferrari. Lewis Hamilton claimed fourth despite setting his quickest lap on medium tyres and repeatedly encountering traffic, suggesting Ferrari may have more speed to come. Max Verstappen completed the top five, followed by Lando Norris, Arvid Lindblad, Oscar Piastri, Nico Hülkenberg and Liam Lawson. Drivers pushed the limits while learning the fast and unforgiving circuit, producing several lock-ups and tense near-misses—including Hamilton narrowly avoiding Carlos Sainz through the banked La Monumental corner. Despite fears that the Madring could be a “car killer,” the session ran without a crash or red flag, although Fernando Alonso stopped on track moments before the chequered flag. Madrid’s opening hour delivered speed, traffic chaos and plenty of uncertainty heading into FP2. (Crash.net, RacingNews365)",
      url: "https://www.planetf1.com/news/spanish-grand-prix-2026-fp1-report",
    },
  ],
},
    {
  heading: "Practice 2",
  items: [
    {
      title: "Antonelli Takes Charge as Lindblad Crash Brings Madring’s First Red Flag",
      summary: "Kimi Antonelli put Mercedes back on top in FP2 at the Madring, edging Charles Leclerc by just 0.113 seconds as Ferrari closed the gap to the early pacesetters. Lewis Hamilton finished only 0.149 seconds behind Antonelli in third, setting up what could be a close fight between Mercedes and Ferrari. Arvid Lindblad was the surprise of the session, running an impressive fourth before losing the rear of his Racing Bulls at Turn 13 and hitting the barriers. Lindblad was unharmed, but the crash triggered Madrid’s first Formula 1 red flag and cost the drivers nearly 15 minutes of running. George Russell finished fifth after the interruption prevented him from completing a representative soft-tyre lap, followed by Max Verstappen, Oscar Piastri, Yuki Tsunoda, Esteban Ocon and Liam Lawson. Lando Norris suffered the biggest setback of the session, completing only two slow laps after a gearbox problem left his McLaren stuck in false neutral. With the red flag disrupting the qualifying simulations, the true competitive order remains uncertain heading into Saturday.",
      url: "https://www.formula1.com/en/latest/article/fp2-antonelli-sets-the-pace-ahead-of-leclerc-during-fp2-at-the-spanish-grand-prix.4QbCYEtf6FjwrEiUIGrWmf",
    },
  ],
},
{
  heading: "Practice 3",
  items: [
 {
  title: "Antonelli Leads Dramatic Final Practice as Hamilton and Bearman Crash at Madring",
  summary:
    "Kimi Antonelli completed a strong practice programme at Madring by setting the fastest time in a heavily disrupted final session. The Mercedes driver moved to the top in the closing minutes, beating Charles Leclerc by 0.166 seconds and Oscar Piastri by 0.189 seconds. Lando Norris finished fourth, followed by Max Verstappen, George Russell, Liam Lawson and Nico Hulkenberg. Lewis Hamilton was ninth, with Gabriel Bortoleto completing the top 10. " +
    "Hamilton caused the session's biggest interruption when he locked up and crashed into the barriers at the final corner while running fourth. His front wing broke and became trapped beneath the car, causing a puncture as he attempted to return to the pits. Barrier repairs left several drivers with limited time to complete their qualifying simulations. " +
    "Alex Albon also clipped the barriers at Turn 21 and did not return while Williams worked on his damaged car. FP3 ended under another red flag after Oliver Bearman crashed at Turn 11. The interrupted running leaves the teams with plenty of uncertainty ahead of qualifying.",
  url: "https://www.skysports.com/f1/news/12433/13584715/spanish-gp-lewis-hamilton-crashes-as-kimi-antonelli-tops-final-practice-from-charles-leclerc-in-madrid",
},
  ],
},

          {
            heading: "Qualifying",
            items: [
              {
                title: "Norris Claims First Madring Pole by 0.011 Seconds as Antonelli Shines",
summary:
   "Lando Norris produced a brilliant final lap to claim the first Formula 1 pole position at Madring. His time of 1:31.824 put him just 0.011 seconds ahead of Kimi Antonelli, with Max Verstappen qualifying third. Lewis Hamilton secured fourth ahead of Charles Leclerc and George Russell." +

  "\n\nOnly 21 drivers took part after Haas was unable to repair Oliver Bearman’s car following his heavy FP3 crash. Track-limit violations affected several drivers in Q1, while Russell brushed the wall at Turn 21. Both home favourites were eliminated, with Carlos Sainz qualifying 17th and Fernando Alonso 18th." +

  "\n\nVerstappen set the pace during Q2 as the track temperature reached 53°C. Nico Hulkenberg, Gabriel Bortoleto, Esteban Ocon, Pierre Gasly, Yuki Tsunoda and Alex Albon were eliminated. Oscar Piastri narrowly advanced to Q3 in ninth place." +

  "\n\nHamilton held provisional pole after the first Q3 runs before Antonelli moved ahead. Norris then delivered his best lap when it mattered. Piastri qualified seventh, followed by strong performances from Liam Lawson in eighth, Franco Colapinto in ninth and Arvid Lindblad in 10th." +

  "\n\nFormulaPassion also praised the organizers for completing the new 5.4-kilometre, 22-corner circuit and making the event easily accessible from central Madrid. With close walls, fast corners and the steeply banked La Monumental section, Madring has already established itself as one of the season’s most demanding circuits.",
                url: "https://www.the-race.com/formula-1/f1-spanish-grand-prix-qualifying-norris-beats-antonelli-pole/",
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
  raceName: "TAG HEUER GRAN PREMIO DE ESPANA",
  raceDates: "Sep 11th  - Sep 13th, 2026",
  location: "Madrid, Spain",
  trackInfoUrl: "/img/tracks/spaintrack.jpg",

  racePoster: {
    enabled: true,
    backgroundImage: "/img/news/raceposter/spainposter.jpg",
    downloadImage: "/img/news/raceposter/spainposter.jpg",
    buttonText: "Race Poster",
  },

 weather: [
  {
    day: "Friday",
    date: "Sep 11th",
    icon: "☀️",
    temp: "30°C / 13°C",
    summary: "Current outlook: Sunny",
  },
  {
    day: "Saturday",
    date: "Sep 12th",
    icon: "☀️",
    temp: "31°C / 16°C",
    summary: "Current outlook: Sunny",
  },
  {
    day: "Sunday",
    date: "Sep 13th",
    icon: "☀️",
    temp: "32°C / 16°C",
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
          time: "George Russell fastest, Full results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P1),
        },
        {
          id: "p2",
          type: "practice",
          label: "Practice 2",
          time: "Antonelli Fastest, Full results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P2),
        },
        {
          id: "p3",
          type: "practice",
          label: "Practice 3",
          time: "Antonelli fastest again, Full results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P3),
        },
        {
          id: "q",
          type: "qualifying",
          label: "Qualifying",
          time: "Norris on Pole!, Results below"  ,
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