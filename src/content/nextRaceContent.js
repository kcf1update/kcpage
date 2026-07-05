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
1	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m29.260s	31
2	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m29.473s	28
3	Charles Leclerc	MON	Scuderia Ferrari HP	1m29.859s	31
4	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m29.938s	30
5	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m30.147s	24
6	Max Verstappen	NED	Oracle Red Bull Racing	1m30.240s	26
7	Lando Norris	GBR	McLaren Mastercard F1 Team	1m30.288s	27
8	Isack Hadjar	FRA	Oracle Red Bull Racing	1m30.338s	27
9	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m30.743s	28
10	Liam Lawson	NZL	Visa Cash App Racing Bulls F1 Team	1m30.850s	27
11	Franco Colapinto	ARG	BWT Alpine F1 Team	1m30.966s	27
12	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m31.035s	28
13	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m31.339s	31
14	Ollie Bearman	GBR	TGR Haas F1 Team	1m31.373s	26
15	Carlos Sainz	ESP	Atlassian Williams F1 Team	1m31.684s	32
16	Esteban Ocon	FRA	TGR Haas F1 Team	1m31.684s	27
17	Alex Albon	THA	Atlassian Williams F1 Team	1m31.697s	30
18	Valtteri Bottas	FIN	Cadillac F1 Team	1m32.150s	21
19	Sergio Perez	MEX	Cadillac F1 Team	1m32.241s	23
20	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	1m32.957s	24
21	Pierre Gasly	FRA	BWT Alpine F1 Team	1m33.019s	24
22	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m33.130s	25

`;

const PASTE_P2 = `

`;

const PASTE_P3 = `

`;
const PASTE_SQ = `
1	44	

Lewis Hamilton

Ferrari	1:29.273	1:28.747	1:28.376	14
2	12	

Kimi Antonelli

Mercedes	1:29.746	1:28.846	1:28.387	15
3	3	

Max Verstappen

Red Bull Racing	1:29.689	1:29.242	1:28.697	12
4	16	

Charles Leclerc

Ferrari	1:29.380	1:28.922	1:28.703	14
5	63	

George Russell

Mercedes	1:29.675	1:29.246	1:28.733	15
6	1	

Lando Norris

McLaren	1:30.142	1:29.401	1:28.740	15
7	81	

Oscar Piastri

McLaren	1:29.583	1:29.120	1:28.772	12
8	6	

Isack Hadjar

Red Bull Racing	1:29.470	1:29.280	1:28.835	14
9	30	

Liam Lawson

Racing Bulls	1:29.850	1:29.067	1:28.927	12
10	41	

Arvid Lindblad

Racing Bulls	1:30.453	1:29.330	1:29.367	12
11	10	

Pierre Gasly

Alpine	1:30.444	1:29.482		9
12	5	

Gabriel Bortoleto

Audi	1:30.407	1:29.679		12
13	27	

Nico Hulkenberg

Audi	1:30.107	1:29.707		12
14	43	

Franco Colapinto

Alpine	1:30.894	1:29.983		9
15	55	

Carlos Sainz

Williams	1:31.073	1:30.197		12
16	23	

Alex Albon

Williams	1:30.779	1:30.650		13
17	87	

Ollie Bearman

Haas F1 Team	1:31.083			6
18	31	

Esteban Ocon

Haas F1 Team	1:31.714			6
19	11	

Sergio Perez

Cadillac	1:31.776			6
20	77	

Valtteri Bottas

Cadillac	1:32.020			6
21	14	

Fernando Alonso

Aston Martin	1:32.910			5
22	18	

Lance Stroll

Aston Martin	1:32.988			5

	
`;
const PASTE_SPRINT = `
1	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	17
2	Lewis Hamilton	GBR	Scuderia Ferrari HP	+2.745s
3	Lando Norris	GBR	McLaren Mastercard F1 Team	+9.783s
4	George Russell	GBR	Mercedes AMG Petronas F1 Team	+10.639s
5	Charles Leclerc	MON	Scuderia Ferrari HP	+12.620s
6	Max Verstappen	NED	Oracle Red Bull Racing	+16.550s
7	Oscar Piastri	AUS	McLaren Mastercard F1 Team	+17.551s
8	Liam Lawson	NZD	Racing Bulls	+30.233s
9	Isack Hadjar	FRA	Oracle Red Bull Racing	+30.953s
10	Arvid Lindblad	GBR	Racing Bulls	+35.110s
11	Pierre Gasly	FRA	BWT Alpine F1 Team	+40.273s
12	Franco Colapinto	ARG	BWT Alpine F1 Team	+41.026s
13	Nico Hulkenberg	GER	Audi Revolut F1 Team	+41.680s
14	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	+42.499s
15	Ollie Bearman	GBR	TGR Haas F1 Team	+45.784s
16	Esteban Ocon	FRA	TGR Haas F1 Team	+69.810s
17	Carlos Sainz	ESP	Atlassian Williams F1 Team	+50.379s
18	Alex Albon	THA	Atlassian Williams F1 Team	+50.757s
19	Valtteri Bottas	FIN	Cadillac F1 Team	+75.117s
20	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	+91.872s
21	Lance Stroll	CAN	Aston Martin Aramco F1 Team	+ 1 Lap
22	Sergio Perez	MEX	Cadillac F1 Team	+1 Lap
`;
const PASTE_Q = `
1	12	

Kimi Antonelli

Mercedes	1:29.719	1:28.493	1:28.111	19
2	16	

Charles Leclerc

Ferrari	1:29.534	1:28.626	1:28.286	18
3	44	

Lewis Hamilton

Ferrari	1:29.644	1:28.864	1:28.458	17
4	63	

George Russell

Mercedes	1:29.985	1:28.920	1:28.481	17
5	6	

Isack Hadjar

Red Bull Racing	1:29.276	1:29.069	1:28.746	18
6	1	

Lando Norris

McLaren	1:30.186	1:29.383	1:28.877	17
7	3	

Max Verstappen

Red Bull Racing	1:29.549	1:29.113	1:28.893	18
8	81	

Oscar Piastri

McLaren	1:29.971	1:29.218	1:29.032	18
9	41	

Arvid Lindblad

Racing Bulls	1:29.661	1:29.324	1:29.305	17
10	30	

Liam Lawson

Racing Bulls	1:29.300	1:29.429	1:29.716	20
11	5	

Gabriel Bortoleto

Audi	1:30.269	1:29.461		10
12	10	

Pierre Gasly

Alpine	1:30.345	1:30.063		12
13	27	

Nico Hulkenberg

Audi	1:29.539	1:30.076		15
14	87	

Ollie Bearman

Haas F1 Team	1:30.570	1:30.501		15
15	55	

Carlos Sainz

Williams	1:30.562	1:30.623		15
16	23	

Alex Albon

Williams	1:30.638	1:31.341		14
17	31	

Esteban Ocon

Haas F1 Team	1:30.680			9
18	77	

Valtteri Bottas

Cadillac	1:31.227			8
19	43	

Franco Colapinto

Alpine	1:31.321			5
20	11	

Sergio Perez

Cadillac	1:31.451			9
21	18	

Lance Stroll

Aston Martin	1:32.863			9
22	14	

Fernando Alonso

Aston Martin	1:33.025			9


`;

const PASTE_RACE = `
1	Charles Leclerc	MON	Scuderia Ferrari HP	52 Laps
2	George Russell	GBR	Mercedes AMG Petronas F1 Team	+0.427s
3	Lewis Hamilton	GBR	Scuderia Ferrari HP	+0.772s
4	Lando Norris	GBR	McLaren Mastercard F1 Team	+1.149s
5	Isack Hadjar	FRA	Oracle Red Bull Racing	+1.598s
6	Liam Lawson	NZD	Racing Bulls	+2.023s
7	Arvid Lindblad	GBR	Racing Bulls	+2.214s
8	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	+2.413s
9	Franco Colapinto	ARG	BWT Alpine F1 Team	+3.229s
10	Pierre Gasly	FRA	BWT Alpine F1 Team	+3.445s
11	Oscar Piastri	AUS	McLaren Mastercard F1 Team	+4.014s
12	Carlos Sainz	ESP	Atlassian Williams F1 Team	+4.391s
13	Ollie Bearman	GBR	TGR Haas F1 Team	+5.245s
14	Esteban Ocon	FRA	TGR Haas F1 Team	+5.512s
15	Sergio Perez	MEX	Cadillac F1 Team	+7.403s
16	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	+8.005s
17	Valtteri Bottas	FIN	Cadillac F1 Team	+8.162s
18	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	+1 Lap
19	Lance Stroll	CAN	Aston Martin Aramco F1 Team	+1 Lap
20	Max Verstappen	NED	Oracle Red Bull Racing	+6 Laps
DNF	Alex Albon	THA	Atlassian Williams F1 Team	+9 Laps
DNF	Nico Hulkenberg	GER	Audi Revolut F1 Team	+16 Laps

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
    WEEKEND_FORMAT === "sprint"
      ? [
          {
            heading: "Practice",
            items: [
              {
                title: "Hamilton Tops Silverstone Practice As Sprint Weekend Begins",
                summary:
                  "Lewis Hamilton opened the British Grand Prix weekend fastest in the only practice session at Silverstone before Sprint Qualifying. With this being a Sprint weekend, teams had just one hour to gather data, check balance, and make decisions before the competitive sessions begin. Mercedes looks sharp early, but the real test comes quickly with Sprint Qualifying later today.",
                url: "https://www.marca.com/motor/formula1/gp-gran-bretana/2026/07/03/hamilton-sonar-silverstone-viene.html",
              },
            ],
          },
          {
            heading: "Sprint Qualifying",
            items: [
              {
                title: "Hamilton Grabs Sprint Pole As FIA Investigations Follow Silverstone Sprint Qualifying",
                summary:
                  "Lewis Hamilton lit up Silverstone by taking pole for Saturday’s 17-lap British Grand Prix Sprint, edging Kimi Antonelli by just 0.011s. Max Verstappen starts third, with Charles Leclerc, George Russell, and Lando Norris close behind, setting up a strong front-end fight for the Sprint. Away from the headline lap, the FIA also summoned Alex Albon and Arvid Lindblad over alleged breaches tied to driving unnecessarily slowly during Sprint Qualifying, adding another layer of drama after the session.",
                url: "https://www.planetf1.com/news/f1-starting-grid-2026-british-grand-prix-sprint",
              },
            ],
          },
          {
            heading: "Sprint Race",
            items: [
              {
                title: "Antonelli Beats Hamilton to Win Silverstone Sprint",
                summary:
                  "Kimi Antonelli delivered a major statement at Silverstone, winning the British Grand Prix Sprint after beating Lewis Hamilton in a key fight at the front. Hamilton kept the pressure on in front of the home crowd, but Antonelli had enough pace and control to take the sprint victory, while Lando Norris completed the top three for McLaren. The result gives Antonelli another important boost in the title fight before full qualifying later today.",
                url: "https://racingnews365.com/kimi-antonelli-wins-lewis-hamilton-british-sprint-duel-to-boost-title-chances",
              },
            ],
          },
          {
            heading: "Qualifying",
            items: [
              {
                title: "Antonelli Takes Silverstone Pole As Ferrari Lock Out The Chase",
                summary:
                  "Kimi Antonelli delivered a major statement in British Grand Prix qualifying, taking pole at Silverstone with a 1:28.111 after Ferrari had looked dangerous through the weekend. Charles Leclerc qualified second, Lewis Hamilton third, and George Russell recovered from a Q1 front-wing crash to take fourth. McLaren were left with work to do, with Lando Norris sixth and Oscar Piastri eighth, setting up a very interesting race on Sunday.",
                url: "https://www.crash.net/f1/news/1100234/1/kimi-antonelli-storms-silverstone-pole-ferrari-pace-falters-f1-british-gp",
              },
            ],
          },
          {
            heading: "Race",
            items: [
              {
                title: "Leclerc Wins British Grand Prix After Late Safety Car Drama",
                summary:
                  "Charles Leclerc won the British Grand Prix at Silverstone after a dramatic race that turned on Kimi Antonelli’s late Mercedes problem and Max Verstappen’s off at Stowe. Leclerc grabbed the lead at the start, controlled the race, and looked set for a comfortable Ferrari one-two before the late Safety Car changed the finish. George Russell stayed out under the Safety Car and took second, while Lewis Hamilton completed the podium in third for Ferrari. Lando Norris finished fourth, with Isack Hadjar, Liam Lawson, Arvid Lindblad, Gabriel Bortoleto, Franco Colapinto, and Pierre Gasly rounding out the points after Antonelli’s penalty dropped him out of the top ten. For Leclerc, it was more than just a win — after several difficult weekends, his emotional team radio said everything about the relief inside the Ferrari garage.",
                url: "https://www.formulapassion.it/f1/f1-news/prima-calmiamoci-vasseur-poi-leclerc-esplode-momenti-duri-non-durano-per-sempre-silverstone-ferrari",
              },
            ],
          },
        ]
      : [
          {
  heading: "Practice 1",
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
  heading: "Practice 2",
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
  heading: "Practice 3",
  items: [
    {
      title: "",
summary: "",
      url: "",
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
  raceName: "PIRELLI BRITSIH GRAND PRIX",
  raceDates: "July 3rd to 5th, 2026",
  location: "Great Britain.",
  trackInfoUrl: "/img/tracks/silverstonetrack.jpg",

  racePoster: {
    enabled: true,
    backgroundImage: "/img/news/raceposter/silverstone.jpg",
    downloadImage: "/img/news/raceposter/silverstone.jpg",
    buttonText: "Race Poster",
  },

 weather: [
    {
    day: "Friday",
    date: "July 3rd",
    icon: "🌤️",
    temp: "26°C / 12°C",
    summary: "Nice and warm with partial sunshine for the opening day at Silverstone.",
  },
  {
    day: "Saturday",
    date: "July 4th",
    icon: "☀️",
    temp: "26°C / 14°C",
    summary: "Mostly sunny and very warm, with a breeze possible later in the afternoon.",
  },
  {
    day: "Sunday",
    date: "July 5th",
    icon: "☁️",
    temp: "26°C / 13°C",
    summary: "Warm but cloudier for race day, with conditions still looking mostly dry.",
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
          time: "Hamilton Tops Silverstone Practice As Sprint Weekend Begins, reults below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P1),
        },
        {
          id: "sq",
          type: "sprint_shootout",
          label: "Sprint Qualifying",
          time: "Hamilton on pole! Results below",
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_SQ),
        },
        {
          id: "sprint",
          type: "sprint_race",
          label: "Sprint Race",
          time: "Kimi wins, thrilling race! Results below",
          trackNote: "",
          extraNote: "",
          results: parseRacePaste(PASTE_SPRINT),
        },
        {
          id: "q",
          type: "qualifying",
          label: "Qualifying",
          time: "Antonelli on pole! Results belowS",
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_Q),
        },
        {
          id: "race",
          type: "race",
          label: "Race Results",
          time: "Charles Leclerc wins the race! Results below",
          trackNote: "",
          extraNote: "",
          results: parseRacePaste(PASTE_RACE),
        },
      ],
};