// src/content/nextRaceContent.js

export const NEXT_RACE_DRIVERS = [
  "Max Verstappen",
  "Arvid Lindblad",
  "Charles Leclerc",
  "Lewis Hamilton",
  "Lando Norris",
  "Oscar Piastri",
  "George Russell",
  "Kimi Antonelli",
  "Lance Stroll",
  "Fernando Alonso",
  "Pierre Gasly",
  "Franco Colapinto",
  "Esteban Ocon",
  "Ollie Bearman",
  "Isack Hadjar",
  "Liam Lawson",
  "Alex Albon",
  "Carlos Sainz",
  "Nico Hülkenberg",
  "Gabriel Bortoleto",
  "Valtteri Bottas",
  "Sergio Perez",
];

export const nextRaceContent = {
  raceName: "Quatar Airways Australian Grand Prix",
  location: "Albert Park Circut - Melbourne, Australia ",
  raceDates: "Mar 5th to 8th",
  trackInfoUrl: "https://www.formula1.com/en/racing/2026/australia",

  sessions: [
    {
      id: "session1",
      label: "Day 4 Feb 18 ",
      time: "complete",

      // ✅ Optional paste block (full timing sheet lines, any order)
      paste: `George Russell	Mercedes	1m33.459s	 	76
2 	Oscar Piastri	McLaren / Mercedes	1m33.469s	0.010s	70
3 	Charles Leclerc	Ferrari	1m33.739s	0.280s	70
4 	Lando Norris	McLaren / Mercedes	1m34.052s	0.593s	54
5 	Kimi Antonelli	Mercedes	1m34.158s	0.699s	69
6 	Isack Hadjar	Red Bull / Red Bull Ford	1m34.260s	0.801s	66
7 	Lewis Hamilton	Ferrari	1m34.299s	0.840s	44
8 	Carlos Sainz	Williams / Mercedes	1m35.113s	1.654s	55
9 	Franco Colapinto	Alpine / Mercedes	1m35.254s	1.795s	60
10 	Gabriel Bortoleto	Audi	1m35.263s	1.804s	71
11 	Alexander Albon	Williams / Mercedes	1m35.690s	2.231s	55
12 	Liam Lawson	Racing Bulls / Red Bull Ford	1m35.753s	2.294s	61
13 	Oliver Bearman	Haas / Ferrari	1m35.778s	2.319s	42
14 	Pierre Gasly	Alpine / Mercedes	1m35.898s	2.439s	61
15 	Lance Stroll	Aston Martin / Honda	1m35.974s	2.515s	26
16 	Esteban Ocon	Haas / Ferrari	1m36.418s	2.959s	65
17 	Fernando Alonso	Aston Martin / Honda	1m36.536s	3.077s	28
18 	Nico Hulkenberg	Audi	1m36.741s	3.282s	49
19 	Arvid Lindblad	Racing Bulls / Red Bull Ford	1m36.769s	3.310s	75
20 	Valtteri Bottas	Cadillac / Ferrari	1m36.798s	3.339s	35
21 	Sergio Perez	Cadillac / Ferrari	1m38.191s	4.732s	24
`,

      results: Array(NEXT_RACE_DRIVERS.length).fill(""),
    },

    {
      id: "session2",
      label: "Day 5 Feb 19",
      time: "complete",

      // ✅ Paste timing sheet here (full names + times, any order)
      paste: `Kimi Antonelli	Mercedes	1:32.803
2	Oscar Piastri	McLaren	1:32.861
3	Max Verstappen	Red Bull	1:33.162
4	Lewis Hamilton	Ferrari	1:33.408
5	Lando Norris	McLaren	1:33.453
6	Franco Colapinto	Alpine	1:33.818
7	Nico Hulkenberg	Audi	1:33.987
8	George Russell	Mercedes	1:34.111
9	Esteban Ocon	Haas	1:34.201
10	Liam Lawson	Racing Bulls	1:34.532
11	Alex Albon	Williams	1:34.555
12	Gabriel Bortoleto	Audi	1:35.263
13	Ollie Bearman	Haas	1:35.279
14	Sergio Perez	Cadillac	1:35.369
15	Fernando Alonso	Aston Martin	1:37.472
16	Valtteri Bottas	Cadillac	1:40.193
`,

      results: Array(NEXT_RACE_DRIVERS.length).fill(""),
    },

    {
      id: "session3",
      label: "Day 6 Feb 20",
      time: "complete",

      paste: `1 Charles Leclerc (Ferrari) 1m31.992s, 
2 Lando Norris (McLaren) 1m32.871s
3 Max Verstappen (Red Bull) 1m33.109s
4 George Russell (Mercedes) 1m33.197s
5 Pierre Gasly (Alpine) 1m33.421s
6 Ollie Bearman (Haas) 1m33.487s
7 Gabriel Bortoleto (Audi) 1m33.755s
8 Kimi Antonelli (Mercedes) 1m33.916s
9 Arvid Lindblad (Racing Bulls) 1m34.149s
10 Carlos Sainz (Williams) 1m34.342s
11 Oscar Piastri (McLaren) 1m34.352s
12 Esteban Ocon (Haas) 1m34.494s
13 Isack Hadjar (Red Bull) 1m34.511s
14 Valtteri Bottas (Cadillac) 1m35.290s
15 Nico Hulkenberg (Audi) 1m36.019s
16 Sergio Perez (Cadillac) 1m40.842s

`,

      results: Array(NEXT_RACE_DRIVERS.length).fill(""),
    },

    {
      id: "session4",
      label: "Session 4",
      time: "",

      paste: ``,

      results: Array(NEXT_RACE_DRIVERS.length).fill(""),
    },
  ],

  weather: `A little to early yet.`,
};