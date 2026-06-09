import { DRIVER_IDS } from "./drivers";

// =====================================================
// 1) BLANK TEMPLATES
// =====================================================

function makeRaceResultsTemplate() {
  return Object.fromEntries(
    DRIVER_IDS.map((id) => [
      id,
      {
        pos: "",
        grid: "",
        points: "",
        status: "",
      },
    ])
  );
}
function makeLapResultsTemplate() {
  return Object.fromEntries(
    DRIVER_IDS.map((id) => [
      id,
      {
        pos: null,
        lapTime: "",
        laps: "",
        status: "",
      },
    ])
  );
}

function makeQualifyingResultsTemplate() {
  return Object.fromEntries(
    DRIVER_IDS.map((id) => [
      id,
      {
        pos: null,
        q1: "",
        q2: "",
        q3: "",
      },
    ])
  );
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getDriverIdFromLine(line) {
  const normalizedLine = normalizeText(line);

  const driverMap = {
    norris: "NOR",
    verstappen: "VER",
    russell: "RUS",
    piastri: "PIA",
    leclerc: "LEC",
    hamilton: "HAM",
    albon: "ALB",
    sainz: "SAI",
    alonso: "ALO",
    stroll: "STR",
    ocon: "OCO",
    bearman: "BEA",
    hulkenberg: "HUL",
    hülkenberg: "HUL",
    bortoleto: "BOR",
    gasly: "GAS",
    colapinto: "COL",
    perez: "PER",
    pérez: "PER",
    bottas: "BOT",
    lawson: "LAW",
    lindblad: "LIN",
    hadjar: "HAD",
    antonelli: "ANT",
  };

  for (const [name, id] of Object.entries(driverMap)) {
    if (normalizedLine.includes(normalizeText(name))) {
      return id;
    }
  }

  return null;
}

function parseLapPaste(text) {
  const base = makeLapResultsTemplate();

  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const id = getDriverIdFromLine(line);
    if (!id || !base[id]) continue;

    const timeMatch = line.match(/\b\d+m\d+\.\d+s\b|\b\d+:\d+\.\d+\b/);
    const lapTime = timeMatch ? timeMatch[0] : "";

    let laps = "";
    const afterTime = timeMatch ? line.slice(timeMatch.index + timeMatch[0].length) : "";
    const lapsMatch = afterTime.match(/\b\d+\b/);
    if (lapsMatch) laps = lapsMatch[0];

    const posMatch = line.match(/^\s*(\d+)\b/);
const pos = posMatch ? Number(posMatch[1]) : null;

base[id] = {
  pos,
  lapTime,
  laps,
  status: lapTime ? "" : "No time",
};
  }

  return base;
}

function parseQualifyingPaste(text) {
  const base = makeQualifyingResultsTemplate();

  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const id = getDriverIdFromLine(line);
    if (!id || !base[id]) continue;

    const times = line.match(/\b\d{1,2}:\d{2}\.\d{3}\b/g) || [];

  const posMatch = line.match(/^\s*(\d+)\b/);
const pos = posMatch ? Number(posMatch[1]) : null;

base[id] = {
  pos,
  q1: times[0] || "",
  q2: times[1] || "",
  q3: times[2] || "",
};
  }

  return base;
}
// =====================================================
// 2) PASTE PARSER
// =====================================================

// RACE paste format:
// DRIVER_ID, POS, STATUS(time/gap/DNF), GRID, POINTS
function parseRacePaste(text) {
  const base = makeRaceResultsTemplate();

  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const toIntOrNull = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const normalizeStatus = (status, pos) => {
    const s = String(status ?? "").trim();
    const p = String(pos ?? "").trim().toUpperCase();

    if (p === "DNF" || p === "DNS") return p;
    if (!s) return "";
    if (/^winner$/i.test(s)) return "Winner";
    if (/^\d+$/.test(s)) return "Winner";
    return s;
  };

  const getDriverIdFromName = (name) => {
    const n = String(name || "").toLowerCase();

    if (n.includes("norris")) return "NOR";
    if (n.includes("verstappen")) return "VER";
    if (n.includes("russell")) return "RUS";
    if (n.includes("piastri")) return "PIA";
    if (n.includes("leclerc")) return "LEC";
    if (n.includes("hamilton")) return "HAM";
    if (n.includes("albon")) return "ALB";
    if (n.includes("sainz")) return "SAI";
    if (n.includes("alonso")) return "ALO";
    if (n.includes("stroll")) return "STR";
    if (n.includes("ocon")) return "OCO";
    if (n.includes("bearman")) return "BEA";
    if (n.includes("hulkenberg") || n.includes("hülkenberg")) return "HUL";
    if (n.includes("bortoleto")) return "BOR";
    if (n.includes("gasly")) return "GAS";
    if (n.includes("colapinto")) return "COL";
    if (n.includes("perez") || n.includes("pérez")) return "PER";
    if (n.includes("bottas")) return "BOT";
    if (n.includes("lawson")) return "LAW";
    if (n.includes("lindblad")) return "LIN";
    if (n.includes("hadjar")) return "HAD";
    if (n.includes("antonelli")) return "ANT";

    return "";
  };

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

  for (const line of lines) {
    // OLD FORMAT:
    // DRIVER_ID, POS, STATUS, GRID, POINTS
    if (line.includes(",")) {
      const parts = line.split(/[\t,|]+/).map((p) => p.trim());

      const id = (parts[0] || "").toUpperCase();
      if (!id || !base[id]) continue;

      const rawPos = (parts[1] || "").toUpperCase();
      const rawStatus = parts[2] || "";
      const rawGrid = parts[3] || "";
      const rawPoints = parts[4] || "";

      const isDNF =
        rawPos === "DNF" ||
        rawPos === "DNS" ||
        String(rawStatus).toUpperCase() === "DNF" ||
        String(rawStatus).toUpperCase() === "DNS";

      const pos = isDNF ? null : toIntOrNull(rawPos);
      const grid = toIntOrNull(rawGrid);
      const points = toIntOrNull(rawPoints);

      base[id] = {
        pos,
        status: normalizeStatus(rawStatus, rawPos),
        grid,
        points,
      };

      continue;
    }

    // NEW COPY-PASTE FORMAT:
    // 1  Andrea Kimi Antonelli  ITA  Mercedes AMG Petronas F1 Team  57
    // 2  Lando Norris           GBR  McLaren Mastercard F1 Team      3.264s
    // DNF Liam Lawson           NZD  Racing Bulls
    const parts = line.split(/\t+/).map((p) => p.trim()).filter(Boolean);

    let rawPos = "";
    let driverName = "";
    let status = "";

    if (parts.length >= 5) {
      rawPos = parts[0];
      driverName = parts[1];
      status = parts[4];
    } else {
      // Fallback for rows where tabs/spaces paste unevenly.
      const match = line.match(/^(\d+|DNF|DNS)\s+(.+?)\s+(ITA|GBR|AUS|NED|MON|ARG|ESP|THA|BRA|FRA|MEX|CAN|FIN|NZD|GER)\s+(.+?)(?:\s+(\d+(?:\.\d+)?s|[12]L|\d+\s*Laps?|\d+))?$/i);

      if (!match) continue;

      rawPos = match[1];
      driverName = match[2];
      status = match[5] || rawPos;
    }

    const id = getDriverIdFromName(driverName);
    if (!id || !base[id]) continue;

    const upperPos = String(rawPos).toUpperCase();
    const isDNF = upperPos === "DNF" || upperPos === "DNS";

    const pos = isDNF ? null : toIntOrNull(rawPos);
    const cleanStatus = isDNF ? upperPos : normalizeStatus(status, rawPos);
    const points = pos && pointsByPosition[pos] ? pointsByPosition[pos] : 0;

    base[id] = {
      pos,
      status: cleanStatus,
      grid: "",
      points,
    };
  }

  return base;
}
// =====================================================
// 3) YOUR PASTE BOXES (EDIT THESE ONLY)
// =====================================================
const PASTE_MONACO_P1 = `
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

const PASTE_MONACO_P2 = `
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

const PASTE_MONACO_P3 = `
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



const PASTE_MONACO_Q = `
1	12	Kimi Antonelli	Mercedes	1:13.599	1:12.704	1:12.051	28
2	3	Max Verstappen	Red Bull Racing	1:13.490	1:12.499	1:12.094	26
3	44	Lewis Hamilton	Ferrari	1:13.777	1:12.934	1:12.279	28
4	16	Charles Leclerc	Ferrari	1:13.293	1:12.774	1:12.351	29
5	6	Isack Hadjar	Red Bull Racing	1:14.408	1:12.722	1:12.434	25
6	63	George Russell	Mercedes	1:14.214	1:13.238	1:12.445	28
7	81	Oscar Piastri	McLaren	1:14.159	1:12.983	1:12.624	29
8	1	Lando Norris	McLaren	1:13.630	1:12.919	1:12.765	28
9	10	Pierre Gasly	Alpine	1:14.469	1:13.762	1:13.226	32
10	30	Liam Lawson	Racing Bulls	1:14.498	1:13.471	1:13.412	29
11	23	Alex Albon	Williams	1:14.321	1:13.787		24
12	55	Carlos Sainz	Williams	1:14.348	1:13.815		23
13	27	Nico Hulkenberg	Audi	1:13.923	1:13.902		21
14	43	Franco Colapinto	Alpine	1:14.573	1:13.995		24
15	41	Arvid Lindblad	Racing Bulls	1:14.685	1:14.248		23
16	5	Gabriel Bortoleto	Audi	1:14.683			10
17	31	Esteban Ocon	Haas F1 Team	1:14.722			14
18	11	Sergio Perez	Cadillac	1:14.747			12
19	87	Ollie Bearman	Haas F1 Team	1:14.814			14
20	77	Valtteri Bottas	Cadillac	1:15.283			13
21	14	Fernando Alonso	Aston Martin	1:15.349			13
22	18	Lance Stroll	Aston Martin	1:16.061			11
`;



const PASTE_MONACO_RACE = `
1	Andrea Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	78
2	Lewis Hamilton	GBR	Scuderia Ferrari HP	+6.271s
3	Isack Hadjar	FRA	Oracle Red Bull Racing	+23.394s
4	Oscar Piastri	AUS	McLaren Mastercard F1 Team	+24.261s
5	Liam Lawson	NZD	Racing Bulls	+26.553s
6	Arvid Lindblad	GBR	Racing Bulls	+29.010s
7	Pierre Gasly	FRA	BWT Alpine F1 Team	+30.369s
8	Alex Albon	THA	Atlassian Williams F1 Team	+33.413s
9	Esteban Ocon	FRA	TGR Haas F1 Team	+37.140s
10	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	+41.899s
11	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	+42.748s
12	George Russell	GBR	Mercedes AMG Petronas F1 Team	+43.353s
13	Nico Hulkenberg	GER	Audi Revolut F1 Team	+44.102s
14	Franco Colapinto	ARG	BWT Alpine F1 Team	+48.964s
15	Sergio Perez	MEX	Cadillac F1 Team	+49.153s
16	Carlos Sainz	ESP	Atlassian Williams F1 Team	+8 laps
DNF	Charles Leclerc	MON	Scuderia Ferrari HP	+14 laps
DNF	Lance Stroll	CAN	Aston Martin Aramco F1 Team	+22 laps
DNF	Lando Norris	GBR	McLaren Mastercard F1 Team	+35 laps
DNF	Ollie Bearman	GBR	TGR Haas F1 Team	+51 laps
DNF	Valtteri Bottas	FIN	Cadillac F1 Team	+63 laps
DNF	Max Verstappen	NED	Oracle Red Bull Racing
`;

const PASTE_CANADA_P1 = `
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

const PASTE_CANADA_SQ = `
1	63	George Russell	Mercedes	1:14.772	1:13.026	1:12.965	19
2	12	Kimi Antonelli	Mercedes	1:14.010	1:13.551	1:13.033	16
3	1	Lando Norris	McLaren	1:14.265	1:13.957	1:13.280	15
4	81	Oscar Piastri	McLaren	1:14.665	1:13.858	1:13.299	15
5	44	Lewis Hamilton	Ferrari	1:13.889	1:13.465	1:13.326	23
6	16	Charles Leclerc	Ferrari	1:15.006	1:13.554	1:13.410	19
7	3	Max Verstappen	Red Bull Racing	1:14.028	1:14.412	1:13.504	15
8	6	Isack Hadjar	Red Bull Racing	1:14.541	1:14.239	1:13.605	17
9	41	Arvid Lindblad	Racing Bulls	1:14.517	1:14.140	1:13.737	19
10	55	Carlos Sainz	Williams	1:15.500	1:14.547	1:14.536	24
11	27	Nico Hulkenberg	Audi	1:15.673	1:14.595		14
12	5	Gabriel Bortoleto	Audi	1:15.801	1:14.627		14
13	43	Franco Colapinto	Alpine	1:15.484	1:14.702		16
14	31	Esteban Ocon	Haas F1 Team	1:15.760	1:14.928		17
15	87	Ollie Bearman	Haas F1 Team	1:15.872	1:15.197		17
16	14	Fernando Alonso	Aston Martin	1:15.760			7
17	11	Sergio Perez	Cadillac	1:16.002			8
18	18	Lance Stroll	Aston Martin	1:16.354			9
19	10	Pierre Gasly	Alpine	1:16.642			8
20	77	Valtteri Bottas	Cadillac	1:16.866			8
`;

const PASTE_CANADA_SPRINT = `
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

const PASTE_CANADA_Q = `
1	63	George Russell	Mercedes	1:13.953	1:13.079	1:12.578	24
2	12	Kimi Antonelli	Mercedes	1:13.380	1:13.076	1:12.646	24
3	1	Lando Norris	McLaren	1:13.503	1:13.049	1:12.729	28
4	81	Oscar Piastri	McLaren	1:13.559	1:13.285	1:12.781	29
5	44	Lewis Hamilton	Ferrari	1:13.767	1:13.041	1:12.868	27
6	3	Max Verstappen	Red Bull Racing	1:14.067	1:13.479	1:12.907	23
7	6	Isack Hadjar	Red Bull Racing	1:13.654	1:12.975	1:12.935	22
8	16	Charles Leclerc	Ferrari	1:13.825	1:13.496	1:12.976	29
9	41	Arvid Lindblad	Racing Bulls	1:13.895	1:13.548	1:13.280	28
10	43	Franco Colapinto	Alpine	1:14.466	1:13.857	1:13.697	27
11	27	Nico Hulkenberg	Audi	1:14.562	1:13.886		21
12	30	Liam Lawson	Racing Bulls	1:14.346	1:13.897		22
13	5	Gabriel Bortoleto	Audi	1:14.775	1:14.071		22
14	10	Pierre Gasly	Alpine	1:14.698	1:14.187		20
15	55	Carlos Sainz	Williams	1:14.276	1:14.273		21
16	87	Ollie Bearman	Haas F1 Team	1:14.449	1:14.416		22
17	31	Esteban Ocon	Haas F1 Team	1:14.845			12
18	23	Alex Albon	Williams	1:14.851			13
19	14	Fernando Alonso	Aston Martin	1:15.196			11
20	11	Sergio Perez	Cadillac	1:15.429			11
21	18	Lance Stroll	Aston Martin	1:16.195			10
22	77	Valtteri Bottas	Cadillac	1:16.272			10
`;

const PASTE_CANADA_RACE = `
1	Andrea Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	68
2	Lewis Hamilton	GBR	Scuderia Ferrari HP	+10.768
3	Max Verstappen	NED	Oracle Red Bull Racing	+11.276
4	Charles Leclerc	MON	Scuderia Ferrari HP	+44.151
5	Isack Hadjar	FRA	Oracle Red Bull Racing	+1 lap
6	Franco Colapinto	ARG	BWT Alpine F1 Team	+1 lap
7	Liam Lawson	NZD	Racing Bulls	+1 lap
8	Pierre Gasly	FRA	BWT Alpine F1 Team	+1 lap
9	Carlos Sainz	ESP	Atlassian Williams F1 Team	+1 lap
10	Ollie Bearman	GBR	TGR Haas F1 Team	+1 lap
11	Oscar Piastri	AUS	McLaren Mastercard F1 Team	+2 laps
12	Nico Hulkenberg	GER	Audi Revolut F1 Team	+2 laps
13	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	+2 laps
14	Esteban Ocon	FRA	TGR Haas F1 Team	+2 laps
15	Lance Stroll	CAN	Aston Martin Aramco F1 Team	+4 laps
16	Valtteri Bottas	FIN	Cadillac F1 Team	+4 laps
DNF	Sergio Perez	MEX	Cadillac F1 Team	 
DNF	Lando Norris	GBR	McLaren Mastercard F1 Team	 
DNF	George Russell	GBR	Mercedes AMG Petronas F1 Team	 
DNF	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	 
DNF	Alex Albon	THA	Atlassian Williams F1 Team	 
DNS	Arvid Lindblad	GBR	Racing Bulls
`;
const PASTE_AUSTRALIA_RACE = `
NOR,5,+51.741s,6,10
VER,6,+54.617s,20,8
RUS,1,58 laps,1,25
PIA,DNS,DNS,5,0
LEC,3,+12.519s,4,15
HAM,4,+16.144s,7,12
ALB,12,+1 Lap,15,0
SAI,15,+2 Laps,21,0
ALO,DNF,0 laps,17,0
STR,17,+15 Laps,22,0
OCO,11,+1 Lap,13,0
BEA,7,+1 Lap,12,6
HUL,DNS,DNS,11,0
BOR,9,+1 Lap,10,2
GAS,10,+1 Lap,14,1
COL,14,+2 Laps,16,0
PER,16,+3 Laps,18,0
BOT,DNF,DNF,19,0
LAW,13,+1 Lap,8,0
LIN,8,+1 Lap,9,4
HAD,DNF,DNF,3,0
ANT,2,+2.974s,2,18
`;
const PASTE_CHINA_RACE = `
NOR,DNS,DNS,6
VER,DNF,DNF,8
RUS,2,+5.515s,2,18
PIA,DNS,DNS,5
LEC,4,+28.894s,4,12
HAM,3,+25.267s,3,15
ALB,DNS,DNS,18
SAI,9,+1 Lap,17,2
ALO,DNF,DNF,19
STR,DNF,DNF,21
OCO,14,+1 Lap,13
BEA,5,+57.268s,10,10
HUL,11,+1 Lap,11
BOR,DNS,DNS,16
GAS,6,+59.647s,7,8
COL,10,+1 Lap,12,1
PER,15,+1 Lap,22
BOT,13,+1 Lap,20
LAW,7,+1m20.588s,14,6
LIN,12,+1 Lap,15
HAD,8,+1m27.247s,9,4
ANT,1,56 Laps,1,25
`;
const PASTE_JAPANESE_RACE = `
NOR,5,23.479s,5,10
VER,8,32.677s,11,4
RUS,4,15.754s,2,12
PIA,2,13.722s,3,18
LEC,3,15.270s,4,15
HAM,6,25.037s,6,8
ALB,20,2 laps,17
SAI,15,65.008s,16 
ALO,18,1 lap,21
STR,DNF,23 laps,22
OCO,10,51.216s,12,1
BEA,DNF,33 laps,18
HUL,11,52.280s,13
BOR,13,59.078s,9
GAS,7,32.340s,7,6
COL,16,65.773s,15	
PER,17,92.453s,19 
BOT,19,1 lap,20
LAW,9,50.180s,14,2
LIN,14,59.848s,10
HAD,12,56.154s,8
ANT,1,53,1,25
`;
const PASTE_MIAMI_RACE = `
1	Andrea Kimi Antonelli	ITA	Mercedes AMG Petronas F1 Team	57
2	Lando Norris	GBR	McLaren Mastercard F1 Team	3.264s
3	Oscar Piastri	AUS	McLaren Mastercard F1 Team	27.092s
4	George Russell	GBR	Mercedes AMG Petronas F1 Team	43.051s
5	Max Verstappen	NED	Oracle Red Bull Racing	43.946s
6	Lewis Hamilton	GBR	Scuderia Ferrari HP	53.753s
7	Franco Colapinto	ARG	BWT Alpine F1 Team	61.871s
8 Charles Leclerc	MON	Scuderia Ferrari HP	44.245s
9	Carlos Sainz	ESP	Atlassian Williams F1 Team	82.072s
10	Alex Albon	THA	Atlassian Williams F1 Team	90.972s
11	Oliver Bearman	GBR	TGR Haas F1 Team	1L
12	Gabriel Bortoleto	BRA	Audi Revolut F1 Team	1L
13	Esteban Ocon	FRA	TGR Haas F1 Team	1L
14	Arvid Lindblad	GBR	Racing Bulls	1L
15	Fernando Alonso	ESP	Aston Martin Aramco F1 Team	1L
16	Sergio Perez	MEX	Cadillac F1 Team	1L
17	Lance Stroll	CAN	Aston Martin Aramco F1 Team	1L
18	Valtteri Bottas	FIN	Cadillac F1 Team	2L
DNF	Liam Lawson	NZD	Racing Bulls	 
DNF	Pierre Gasly	FRA	BWT Alpine F1 Team	 
DNF	Nico Hulkenberg	GER	Audi Revolut F1 Team	 
DNF	Isack Hadjar	FRA	Oracle Red Bull Racing
`;
// =====================================================
// 4) CONTENT
// =====================================================

export const previousRaceResults = [
  {
    raceName: "Monaco Grand Prix",
    raceDates: "June 5th–7th, 2026",
    location: "Monte Carlo, Monaco",
    weekendFormat: "standard",

    raceWeekendRecap: {
      enabled: true,
      title: "Monaco Grand Prix Weekend Recap",
      sections: [
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
              title: "Antonelli grabs Monaco pole after wild Q3 finish",
              summary:
                "Kimi Antonelli took a dramatic Monaco Grand Prix pole with a 1m12.051s, beating Max Verstappen by just 0.043s after a tight Q3 fight. Charles Leclerc briefly put Ferrari on provisional pole before Verstappen went fastest and Antonelli delivered the final blow. Leclerc ended fourth behind Lewis Hamilton, while Isack Hadjar put the second Red Bull fifth and McLaren struggled to seventh and eighth with Oscar Piastri ahead of Lando Norris.",
              url: "https://www.the-race.com/formula-1/antonelli-denies-verstappen-pole-f1-monaco-gp-qualifying-leclerc-hits-wall/",
            },
          ],
        },
        {
          heading: "Race",
          items: [
            {
              title: "Antonelli Wins Chaotic Monaco GP as Penalties Reshape Podium",
              summary:
                "Kimi Antonelli won a chaotic Monaco Grand Prix ahead of Lewis Hamilton and Isack Hadjar after a race packed with retirements, penalties and late drama. Max Verstappen retired after one lap, Lando Norris later stopped with a McLaren issue, and Charles Leclerc crashed after the restart following brake problems. Pit lane speeding penalties reshuffled the order, with Pierre Gasly losing third on the road and George Russell falling out of contention.",
              url: "https://www.formula1.com/en/latest/article/antonelli-secures-brilliant-victory-in-chaotic-monaco-grand-prix-amid-multiple-shock-retirements.27e644586K83z0NZd6efsz",
            },
          ],
        },
      ],
    },

    sessions: [
      {
        id: "p1",
        type: "practice",
        label: "Practice 1",
        time: "Leclerc fastest, full results below",
        trackNote: "",
        extraNote: "",
        results: parseLapPaste(PASTE_MONACO_P1),
      },
      {
        id: "p2",
        type: "practice",
        label: "Practice 2",
        time: "Hamilton fastest, full results below",
        trackNote: "",
        extraNote: "",
        results: parseLapPaste(PASTE_MONACO_P2),
      },
      {
        id: "p3",
        type: "practice",
        label: "Practice 3",
        time: "Antonelli fastest, full results below",
        trackNote: "",
        extraNote: "",
        results: parseLapPaste(PASTE_MONACO_P3),
      },
      {
        id: "q",
        type: "qualifying",
        label: "Qualifying",
        time: "Antonelli on pole, full results below",
        trackNote: "",
        extraNote: "",
        results: parseQualifyingPaste(PASTE_MONACO_Q),
      },
      {
        id: "race",
        type: "race",
        label: "Race Results",
        time: "Antonelli wins chaotic Monaco GP, full results below",
        trackNote: "",
        extraNote: "",
        results: parseRacePaste(PASTE_MONACO_RACE),
      },
    ],

    session: {
      id: "race",
      type: "race",
      label: "Race Results",
      time: "Antonelli wins chaotic Monaco GP, full results below",
      extraNote: "Dry Track",
      results: parseRacePaste(PASTE_MONACO_RACE),
    },
  },

  

    {
    raceName: "Canadian Grand Prix",
    raceDates: "May 22nd–24th, 2026",
    location: "Circuit Gilles-Villeneuve, Montreal",
    weekendFormat: "sprint",

    raceWeekendRecap: {
      enabled: true,
      title: "Canadian GP Weekend Recap",
      sections: [
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
              title: "Antonelli wins again as Russell’s Canadian GP heartbreak changes everything",
              summary:
                "Kimi Antonelli took another major step in the 2026 title fight by winning the Canadian Grand Prix after George Russell retired from the lead with a power unit failure. Russell had looked set to challenge his Mercedes teammate head-on, but his lap 30 stoppage handed Antonelli control of the race and turned a potential team duel into a major championship swing.",
              url: "https://www.motorsport.com/f1/news/f1-canadian-gp-kimi-antonelli-lands-f1-2026-blow-as-george-russell-retires-from-canada-gp/10823926/?utm_source=RSS&utm_medium=referral&utm_campaign=RSS-F1&utm_term=News&utm_content=www",
            },
          ],
        },
      ],
    },

    sessions: [
      {
        id: "p1",
        type: "practice",
        label: "Practice 1",
        time: "Kimi fastest, full results below",
        trackNote: "",
        extraNote: "",
        results: parseLapPaste(PASTE_CANADA_P1),
      },
      {
        id: "sq",
        type: "sprint_shootout",
        label: "Sprint Qualifying",
        time: "George on pole for sprint, full results below",
        trackNote: "",
        extraNote: "",
        results: parseQualifyingPaste(PASTE_CANADA_SQ),
      },
      {
        id: "sprint",
        type: "sprint_race",
        label: "Sprint Race",
        time: "George wins Canadian Sprint",
        trackNote: "",
        extraNote: "",
        results: parseRacePaste(PASTE_CANADA_SPRINT),
      },
      {
        id: "q",
        type: "qualifying",
        label: "Qualifying",
        time: "George on pole, full results below",
        trackNote: "",
        extraNote: "",
        results: parseQualifyingPaste(PASTE_CANADA_Q),
      },
      {
        id: "race",
        type: "race",
        label: "Race Results",
        time: "Kimi Antonelli wins Canadian GP, full results below",
        trackNote: "",
        extraNote: "",
        results: parseRacePaste(PASTE_CANADA_RACE),
      },
    ],

    // Keeps the old Previous Results page working until we update the display layout.
    session: {
      id: "race",
      type: "race",
      label: "Race Results",
      time: "Kimi Antonelli wins Canadian GP, full results below",
      extraNote: "Dry Track",
      results: parseRacePaste(PASTE_CANADA_RACE),
    },
  },
    {
    raceName: "MIAMI GRAND PRIX ",
    raceDates: "May 01st–03rd, 2026",
    location: "Miami International Autodrome, US",
    session: {
      id: "race",
      type: "race",
      label: "Race",
      time: "Winner name here, full results below.",
      extraNote: "Dry Track",
      results: parseRacePaste(PASTE_MIAMI_RACE),
    },
  },

  {
    raceName: "JAPANESE GRAND PRIX ",
    raceDates: "Mar 26th–29th, 2026",
    location: "Suzuka Circuit, Japan",
    session: {
      id: "race",
      type: "race",
      label: "Race",
      time: "Winner name here, full results below.",
      extraNote: "Dry Track",
      results: parseRacePaste(PASTE_JAPANESE_RACE),
    },
  },

  {
    raceName: "Chinese Grand Prix",
    raceDates: "Mar 19th–22nd, 2026",
    location: "Shanghai, China",
    session: {
      id: "race",
      type: "race",
      label: "Race",
      time: "Winner name here, full results below.",
      extraNote: "Dry Track",
      results: parseRacePaste(PASTE_CHINA_RACE),
    },
  },

  {
    raceName: "Australian Grand Prix",
    raceDates: "Mar 5th–8th, 2026",
    location: "Melbourne, Australia",
    session: {
      id: "race",
      type: "race",
      label: "Race",
      time: "Russell Wins, full results below.",
      extraNote: "Dry Track",
      results: parseRacePaste(PASTE_AUSTRALIA_RACE),
    },
  },
];