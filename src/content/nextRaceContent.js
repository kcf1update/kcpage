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

// Create a blank results row (one slot per driver, in the same order)


export const nextRaceContent = {
  raceName: "Bahrain Pre-Season testing",
  location: "Sakhir, Bahrain",
 raceDates: "Feb 18 - 20",
  trackInfoUrl: "https://www.bahraingp.com/", // <-- add this
  
  sessions: [
    {
  id: "session1",
  label: "Day 4 Feb 18 ",
  time: "complete",
  results: [
    "did not run ",   // Max Verstappen
    "1m36.769s	3.310s	75 ",  // Arvid Lindblad
    "1m33.739s	0.280s	70",   // Charles Leclerc
    "1m34.299s	0.840s	44",   // Lewis Hamilton
    "1m34.052s	0.593s	54 ",   // Lando Norris
    "1m33.469s	0.010s	70 ",   // Oscar Piastri
    "1m33.459s	0.000s  76 ",     // George Russell
    "1m34.158s	0.699s	69 ",     // Kimi Antonelli
    "1m35.974s	2.515s	26 ",     // Lance Stroll
    "1m36.536s	3.077s	28",     // Fernando Alonso
    "1m35.898s	2.439s	61",     // Pierre Gasly
    "1m35.254s	1.795s	60 ",     // Franco Colapinto
    " 1m36.418s	2.959s	65",     // Esteban Ocon
    "1m35.778s	2.319s	42",     // Ollie Bearman
    "1m34.260s	0.801s	66",     // Isack Hadjar
    "1m35.753s	2.294s	61",     // Liam Lawson
    "1m35.690s	2.231s	55",     // Alex Albon
    "1m35.113s	1.654s	55",     // Carlos Sainz
    " 1m36.741s	3.282s	49",     // Nico Hülkenberg
    "1m35.263s	1.804s	71 ",     // Gabriel Bortoleto
    "1m36.798s	3.339s	35",// Valtteri Bottas
    "1m38.191s	4.732s	24",// Sergio Perez
  ],
},

    {
  id: "session2",
  label: "Day 5 Feb 19",
  time: "3am to 12noon AST",
  results: [
    "",   // Max Verstappen
    "",  // Arvid Lindblad
    "",   // Charles Leclerc
    "",   // Lewis Hamilton
    "",   // Lando Norris
    "",   // Oscar Piastri
    "",     // George Russell
    "",     // Kimi Antonelli
    "",     // Lance Stroll
    "",     // Fernando Alonso
    "",     // Pierre Gasly
    "",     // Franco Colapinto
    "",     // Esteban Ocon
    "",     // Ollie Bearman
    "",     // Isack Hadjar
    "",     // Liam Lawson
    "",     // Alex Albon
    "",     // Carlos Sainz
    "",     // Nico Hülkenberg
    "",     // Gabriel Bortoleto
    " ", //Valtteri Bottas
    "",//Sergio Perez
  ],
},
    {
  id: "session3",
  label: "Day 6 Feb 20",
  time: "3am to 12noon AST",
  results: [
    "",   // Max Verstappen
    "",  // Arvid Lindblad
    "",   // Charles Leclerc
    "",   // Lewis Hamilton
    "",   // Lando Norris
    "",   // Oscar Piastri
    "",     // George Russell
    "",     // Kimi Antonelli
    "",     // Lance Stroll
    "",     // Fernando Alonso
    "",     // Pierre Gasly
    "",     // Franco Colapinto
    "",     // Esteban Ocon
    "",     // Ollie Bearman
    "",     // Isack Hadjar
    "",     // Liam Lawson
    "",     // Alex Albon
    "",     // Carlos Sainz
    "",     // Nico Hülkenberg
    "",     // Gabriel Bortoleto
    "", //Valtteri Bottas
    "",//Sergio Perez
  ],
},

    {
  id: "session4",
  label: "Session 4",
  time: "",
  results: [
    "",   // Max Verstappen
    "",  // Arvid Lindblad
    "",   // Charles Leclerc
    "	",   // Lewis Hamilton
    "",   // Lando Norris
    "",   // Oscar Piastri
    "",     // George Russell
    "",     // Kimi Antonelli
    "",     // Lance Stroll
    "",     // Fernando Alonso
    "",     // Pierre Gasly
    "",     // Franco Colapinto
    "",     // Esteban Ocon
    "",     // Ollie Bearman
    "",     // Isack Hadjar
    "",     // Liam Lawson
    "",     // Alex Albon
    "",     // Carlos Sainz
    "",     // Nico Hülkenberg
    "",     // Gabriel Bortoleto
    "", //Valtteri Bottas
    "",//Sergio Perez
  ],
},

  ],

  weather: `Wed 18th high 21° low 19°, 
  Thu 19th high 22° low 20° 
  Fri 20th high 22° low 20° 
  No rain in the forecast`,
};
