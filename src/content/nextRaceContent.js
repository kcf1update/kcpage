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
1	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m16.363s	27
2	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m16.566s	29
3	Charles Leclerc	MON	Scuderia Ferrari HP	1m16.883s	29
4	Max Verstappen	NED	Oracle Red Bull Racing	1m17.047s	29
5	Leonardo Fornaoli	ITA	McLaren Mastercard F1 Team	1m17.216s	22
6	Paul Aron	EST	Audi Revolut F1 Team	1m17.321s	24
7	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m17.472s	24
8	Dino Beganovic	SWE	Scuderia Ferrari HP	1m17.778s	30
9	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m17.804s	29
10	Franco Colapinto	ARG	BWT Alpine F1 Team	1m17.893s	28
11	Oliver Bearman	GBR	TGR Haas F1 Team	1m18.172s	25
12	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m18.209s	28
13	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m18.293s	27
14	Ayumu Iwasa	JAP	Oracle Red Bull Racing	1m18.298s	21
15	Fred Vesti	DEN	Mercedes AMG Petronas F1 Team	1m18.365s	28
16	Esteban Ocon	FRA	TGR Haas F1 Team	1m18.372s	27
17	Pierre Gasly	FRA	BWT Alpine F1 Team	1m18.508s	23
18	Valtteri Bottas	FIN	Cadillac F1 Team	1m18.914s	23
19	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m20.067s	23
20	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m20.318s	21
21	Colton Herta	USA	Cadillac F1 Team	1m20.697s	27
 	Luke Browning	GBR	Atlassian Williams F1 Team	 

`;

const PASTE_P2 = `
1	Lando Norris	GBR	McLaren Mastercard F1 Team	1m15.426s	30
2	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m15.435s	28
3	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m15.483s	24
4	Charles Leclerc	MON	Scuderia Ferrari HP	1m15.799s	29
5	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m16.015s	31
6	Max Verstappen	NED	Oracle Red Bull Racing	1m16.321s	33
7	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m16.411s	29
8	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m16.611s	27
9	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m16.631s	28
10	Isack Hadjar	FRA	Oracle Red Bull Racing	1m16.674s	30
11	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m16.934s	31
12	Ollie Bearman	GBR	TGR Haas F1 Team	1m16.945s	31
13	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m16.967s	8
14	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m17.020s	29
15	Franco Colapinto	ARG	BWT Alpine F1 Team	1m17.051s	30
16	Pierre Gasly	FRA	BWT Alpine F1 Team	1m17.260s	29
17	Esteban Ocon	FRA	TGR Haas F1 Team	1m17.538s	29
18	Valtteri Bottas	FIN	Cadillac F1 Team	1m18.225s	6
19	Alex Albon	THA	Atlassian Williams F1 Team	1m18.790s	29
20	Sergio Perez	MEX	Cadillac F1 Team	1m19.261s	34
21	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m19.286s	21
22	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m19.459s	20
`;

const PASTE_P3 = `
1	George Russell	GBR	Mercedes AMG Petronas F1 Team	1m15.679s	11
2	Oscar Piastri	AUS	McLaren Mastercard F1 Team	1m15.893s	12
3	Charles Leclerc	MON	Scuderia Ferrari HP	1m15.922s	17
4	Lando Norris	GBR	McLaren Mastercard F1 Team	1m15.925s	15
5	Lewis Hamilton	GBR	Scuderia Ferrari HP	1m16.381s	16
6	Max Verstappen	NED	Oracle Red Bull Racing	1m16.434s	12
7	Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	1m16.500s	12
8	Isack Hadjar	FRA	Oracle Red Bull Racing	1m16.684s	15
9	Nico Hulkenberg	GER	Audi Revolut F1 Team	1m16.961s	22
10	Arvid Lindblad	GBR	Visa Cash App Racing Bulls F1 Team	1m17.020s	16
11	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1m17.027s	13
12	Liam Lawson	NWZ	Visa Cash App Racing Bulls F1 Team	1m17.324s	15
13	Pierre Gasly	FRA	BWT Alpine F1 Team	1m17.583s	15
14	Franco Colapinto	ARG	BWT Alpine F1 Team	1m17.625s	14
15	Carlos Sainz	SPA	Atlassian Williams F1 Team	1m17.730s	19
16	Esteban Ocon	FRA	TGR Haas F1 Team	1m18.040s	15
17	Ollie Bearman	GBR	TGR Haas F1 Team	1m18.391s	13
18	Alex Albon	THA	Atlassian Williams F1 Team	1m18.412s	15
19	Sergio Perez	MEX	Cadillac F1 Team	1m18.691s	21
20	Fernando Alonso	SPA	Aston Martin Aramco F1 Team	1m19.496s	18
21	Valtteri Bottas	FIN	Cadillac F1 Team	1m19.962s	14
22	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1m20.103s	17
`;
const PASTE_SQ = `

	
`;
const PASTE_SPRINT = `

`;
const PASTE_Q = `
	1	63	

George Russell

Mercedes	1:15.717	1:15.228	1:14.679	13
2	44	

Lewis Hamilton

Ferrari	1:15.625	1:15.418	1:14.743	14
3	12	

Kimi Antonelli

Mercedes	1:15.977	1:15.295	1:14.998	14
4	1	

Lando Norris

McLaren	1:16.287	1:15.361	1:15.001	14
5	3	

Max Verstappen

Red Bull Racing	1:16.352	1:15.484	1:15.021	12
6	6	

Isack Hadjar

Red Bull Racing	1:16.427	1:15.754	1:15.077	14
7	81	

Oscar Piastri

McLaren	1:16.138	1:15.518	1:15.090	15
8	30	

Liam Lawson

Racing Bulls	1:16.673	1:15.585	1:16.542	14
9	27	

Nico Hulkenberg

Audi	1:16.066	1:15.768	1:16.657	17
10	16	

Charles Leclerc

Ferrari	1:15.964	1:15.281	DNF	8
11	41	

Arvid Lindblad

Racing Bulls	1:16.425	1:15.840		8
12	5	

Gabriel Bortoleto

Audi	1:16.616	1:16.001		9
13	43	

Franco Colapinto

Alpine	1:16.590	1:16.191		12
14	10	

Pierre Gasly

Alpine	1:16.599	1:16.261		12
15	87	

Ollie Bearman

Haas F1 Team	1:16.571	1:16.389		15
16	55	

Carlos Sainz

Williams	1:16.881	1:17.827		15
17	31	

Esteban Ocon

Haas F1 Team	1:17.073			9
18	23	

Alex Albon

Williams	1:17.424			9
19	11	

Sergio Perez

Cadillac	1:17.545			6
20	77	

Valtteri Bottas

Cadillac	1:17.757			9
21	18	

Lance Stroll

Aston Martin	1:18.758			8
22	14	

Fernando Alonso

Aston Martin	1:18.815			8

`;

const PASTE_RACE = `
1	Lewis Hamilton	GBR	Scuderia Ferrari HP	66
2	George Russell	GBR	Mercedes AMG Petronas F1 Team	+19.561s
3	Lando Norris	GBR	McLaren Mastercard F1 Team	+23.719s
4	Max Verstappen	NED	Oracle Red Bull Racing	+40.497s
5	Oscar Piastri	AUS	McLaren Mastercard F1 Team	+58.661s
6	Isack Hadjar	FRA	Oracle Red Bull Racing	+1 Lap
7	Pierre Gasly	FRA	BWT Alpine F1 Team	+1 Lap
8	Franco Colapinto	ARG	BWT Alpine F1 Team	+1 Lap
9	Liam Lawson	NZD	Racing Bulls	+1 Lap
10	Arvid Lindblad	GBR	Racing Bulls	+1 Lap
11	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	+2 Laps
12	Carlos Sainz	ESP	Atlassian Williams F1 Team	+2 Laps
13	Esteban Ocon	FRA	TGR Haas F1 Team	+2 Laps
14	Sergio Perez	MEX	Cadillac F1 Team	+3 Laps
15	Charles Leclerc	MON	Scuderia Ferrari HP	+4 Laps
16	Andrea Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	+5 Laps
17	Ollie Bearman	GBR	TGR Haas F1 Team	+6 Laps
DNF	Alex Albon	THA	Atlassian Williams F1 Team	+11 Laps
DNF	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	+29 Laps
DNF	Nico Hulkenberg	GER	Audi Revolut F1 Team	+37 Laps
DNF	Valtteri Bottas	FIN	Cadillac F1 Team	+51 Laps
DNF	Lance Stroll	CAN	Aston Martin Aramco F1 Team	+61 Laps


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
      title: "Russell Leads FP1 as Barcelona Weekend Gets Underway",
      summary:
        "George Russell set the pace in first practice at Barcelona, putting Mercedes on top with a 1:16.363 as the high-speed Circuit de Barcelona-Catalunya appeared to suit his car and driving style. Oscar Piastri was second for McLaren, two tenths back, with Charles Leclerc third for Ferrari and Max Verstappen fourth for Red Bull. FP1 also featured several rookie and stand-in drivers, with Leonardo Fornaroli impressing in Lando Norris’s McLaren, Paul Aron strong for Audi, and Dino Beganovic also inside the top 10 for Ferrari. Colton Herta completed his first F1 race-weekend session for Cadillac, while Williams reserve Luke Browning missed out after an electrical issue on Alex Albon’s car.",
      url: "https://www.the-race.com/formula-1/russell-sets-pace-in-spain-fp1-as-two-rookies-impress/",
    },
  ],
},
{
  heading: "Practice 2",
  items: [
    {
      title: "Norris Puts McLaren on Top in FP2",
      summary:
        "Lando Norris put McLaren fastest in FP2 at Barcelona, edging George Russell by just 0.009s after missing FP1 for rookie running. Oscar Piastri completed a strong McLaren session in third, only 0.057s off Norris, while Charles Leclerc and Kimi Antonelli rounded out the top five. The session also showed plenty of balance and tyre issues, with Verstappen struggling for grip, Hamilton reporting a rear-end problem on his Ferrari, and Liam Lawson briefly stopping at pit exit to trigger a Virtual Safety Car.",
      url: "https://www.the-race.com/formula-1/mclaren-leads-mercedes-f1-2026-barcelona-gp-fp2/",
    },
  ],
},
{
  heading: "Practice 3",
  items: [
    {
      title: "",
        summary:
        "George Russell led final practice in Barcelona with a 1:15.679, putting Mercedes back on top before qualifying. Oscar Piastri finished second, Charles Leclerc third, with Lando Norris, Lewis Hamilton and Max Verstappen completing the top six. The session was disrupted by a red flag after Valtteri Bottas suffered a Cadillac failure, while Kimi Antonelli was left frustrated by traffic and ended the session seventh.",
      url: "https://www.formula1.com/en/latest/article/russell-fastest-in-free-practice-3-ahead-of-piastri-and-leclerc-in-barcelona.5DnruoMHBsHXrKsBoXAS0H",
    },
  ],
},

          {
            heading: "Qualifying",
            items: [
              {
                title: "Russell Takes Barcelona Pole After Dramatic Qualifying",
                summary:
                  "George Russell bounced back in style at Barcelona, taking pole with a 1:14.679 after topping Q2 and delivering when it mattered in Q3. Lewis Hamilton nearly stole the spotlight by splitting the Mercedes drivers for second, while Kimi Antonelli had to settle for third ahead of Lando Norris, who missed the top three by just 0.003s. Charles Leclerc’s difficult weekend continued with a heavy Turn 4 crash that brought out a red flag and left him 10th on the grid.",
                url: "https://racingnews365.com/george-russell-survives-late-lewis-hamilton-scare-for-bounce-back-barcelona-pole",
              },
            ],
          },
          {
            heading: "Race",
            items: [
              {
                title: "Hamilton Wins For Ferrari As Antonelli’s Late DNF Shakes Up Barcelona",
                summary:
                  "Lewis Hamilton claimed his first Grand Prix victory for Ferrari at the Barcelona-Catalunya Grand Prix, beating George Russell by 19.561 seconds after Ferrari’s aggressive three-stop strategy and a perfectly timed Virtual Safety Car stop turned the race in his favour. Lando Norris completed an all-British podium in third, with Max Verstappen fourth, Oscar Piastri fifth, Isack Hadjar sixth, and Alpine scoring heavily with Pierre Gasly seventh and Franco Colapinto eighth. Racing Bulls also put both cars in the points with Liam Lawson ninth and Arvid Lindblad tenth. The biggest championship moment came late on when Kimi Antonelli, who had just passed Russell for second, slowed and retired on Lap 62 with what Mercedes later called an electrical shutdown. Charles Leclerc also retired late, while Aston Martin had a brutal home race for Fernando Alonso, who started from the pit lane after power unit changes and later stopped with a battery issue. Lance Stroll retired early with a gearbox problem, Nico Hulkenberg lost a likely points chance after gravel thrown up by Lawson triggered an emergency shutdown on his Audi, and both Williams cars were placed under post-race investigation for possible start-procedure breaches. Hamilton’s win ended Mercedes’ unbeaten run in 2026 and cut into Antonelli’s championship lead, turning Barcelona into one of the most important races of the season so far.",
                url: "https://www.motorsport.com/f1/news/f1-barcelona-gp-race-report/10830256/",
              },
            ],
          },
        ],
};
export const nextRaceContent = {
  raceName: "FORMULA 1 MSC CRUISES GARN PREMIO DE BARCELONA-CATALUNYA GRAND PRIX",
  raceDates: "June 12th to June 14th, 2026",
  location: "Barcelona, Spain.",
  trackInfoUrl: "/img/tracks/Barcelona.jpg",

  weather: [
  {
    day: "Friday",
    date: "June 12th",
    icon: "☀️",
    temp: "26°C / 20°C",
    summary: "Sunny and warm.",
  },
  {
    day: "Saturday",
    date: "June 13th",
    icon: "☀️",
    temp: "28°C / 22°C",
    summary: "Sunny and hot.",
  },
  {
    day: "Sunday",
    date: "June 14th",
    icon: "🌤️",
    temp: "28°C / 22°C",
    summary: "Mostly sunny with some cloud.",
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
          time: "Russell Fastest, Results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P1),
          
        },
        {
          id: "p2",
          type: "practice",
          label: "Practice 2",
          time: "Lando Fastest, Results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P2),
        },
        {
          id: "p3",
          type: "practice",
          label: "Practice 3",
          time: "Russell Fastest, Results below",
          trackNote: "",
          extraNote: "",
          results: parseLapPaste(PASTE_P3),
        },
        {
          id: "q",
          type: "qualifying",
          label: "Qualifying",
          time: "Russell on pole, Results below",
          trackNote: "",
          extraNote: "",
          results: parseQualifyingPaste(PASTE_Q),
        },
        {
          id: "race",
          type: "race",
          label: "Race ",
          time: "Ferrari Wins with Hamilton, Results below",
          trackNote: "",
          extraNote: "",
          results: parseRacePaste(PASTE_RACE),
        },
      ],
};