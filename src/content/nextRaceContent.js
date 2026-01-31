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
  "Oliver Bearman",
  "Isack Hadjar",
  "Liam Lawson",
  "Alexander Albon",
  "Carlos Sainz",
  "Nico Hülkenberg",
  "Gabriel Bortoleto",
  "Valtteri Bottas",
  "Sergio Perez",
];

// Create a blank results row (one slot per driver, in the same order)


export const nextRaceContent = {
  raceName: "Bahrain Grand Prix",
  location: "Sakhir, Bahrain",
 raceDates: "Feb 11 - 13",
  trackInfoUrl: "https://www.bahraingp.com/", // <-- add this
  
  sessions: [
    {
  id: "session1",
  label: "Session 1",
  time: "Day 1 results below",
  results: [
    "",   // Max Verstappen
    "",  // Arvid Lindblad
    "",   // Charles Leclerc
    "",   // Lewis Hamilton
    "",   // Lando Norris
    "",   // Oscar Piastri
    "+0.537s, 93 laps",     // George Russell
    "+2.541s, 56 laps",     // Kimi Antonelli
    "",     // Lance Stroll
    "",     // Fernando Alonso
    "",     // Pierre Gasly
    "+2.030s, 60 laps",     // Franco Colapinto
    "+3.142s, 154 laps",     // Esteban Ocon
    "",     // Oliver Bearman
    "1:18.159s 107 laps",     // Isack Hadjar
    "+3.354s, 88 laps",     // Liam Lawson
    "",     // Alexander Albon
    "",     // Carlos Sainz
    "",     // Nico Hülkenberg
    "+7.137s, 27 laps",     // Gabriel Bortoleto
    "+6.492s, 33 laps",// Valtteri Bottas
    "+7.815s, 11 laps",// Sergio Perez
  ],
},

    {
  id: "session2",
  label: "Session 2",
  time: "Day 2 results below",
  results: [
    "q:19.580 27 laps",   // Max Verstappen
    "",  // Arvid Lindblad
    "+1.284 64 laps",   // Charles Leclerc
    "+13.292 56 laps",   // Lewis Hamilton
    "",   // Lando Norris
    "",   // Oscar Piastri
    "",     // George Russell
    "",     // Kimi Antonelli
    "",     // Lance Stroll
    "",     // Fernando Alonso
    "",     // Pierre Gasly
    "",     // Franco Colapinto
    "",     // Esteban Ocon
    "",     // Oliver Bearman
    "+12.311 51 laps",     // Isack Hadjar
    "",     // Liam Lawson
    "",     // Alexander Albon
    "",     // Carlos Sainz
    "",     // Nico Hülkenberg
    "",     // Gabriel Bortoleto
    "", //Valtteri Bottas
    "",//Sergio Perez
  ],
},
    {
  id: "session3",
  label: "Session 3",
  time: "Day 3 results below",
  results: [
    "",   // Max Verstappen
    "+2.058 120 laps",  // Arvid Lindblad
    "",   // Charles Leclerc
    "",   // Lewis Hamilton
    "+0.945 76 laps",   // Lando Norris
    "",   // Oscar Piastri
    "1.17.362 92 laps",     // George Russell
    "1.17.362 91 laps",     // Kimi Antonelli
    "",     // Lance Stroll
    "",     // Fernando Alonso
    "+1.935 67 laps",     // Pierre Gasly
    "+1.788 58 laps",     // Franco Colapinto
    "",     // Esteban Ocon
    "+1.952 42 laps",     // Oliver Bearman
    "",     // Isack Hadjar
    "",     // Liam Lawson
    "",     // Alexander Albon
    "",     // Carlos Sainz
    "	+3.648 68 laps",     // Nico Hülkenberg
    "",     // Gabriel Bortoleto
    "", //Valtteri Bottas
    "",//Sergio Perez
  ],
},

    {
  id: "session4",
  label: "Session 4",
  time: "That's a wrap day 5 results!",
  results: [
    "1:17.586 118 laps",   // Max Verstappen
    "1:18.451 47 laps",  // Arvid Lindblad
    "1:16.653 78 laps",   // Charles Leclerc
    "	1:16.348 63 laps",   // Lewis Hamilton
    "1:16.594 83 laps",   // Lando Norris
    "1:17.446 80 laps",   // Oscar Piastri
    "1:16.445 77 laps",     // George Russell
    "1:17.081 90 laps",     // Kimi Antonelli
    "1:46.404 4 laps",     // Lance Stroll
    "1:20.795 49 laps",     // Fernando Alonso
    "1:17.707 160 laps",     // Pierre Gasly
    "",     // Franco Colapinto
    "1:18.393 85 laps",     // Esteban Ocon
    "1:18.423 106 laps",     // Oliver Bearman
    "",     // Isack Hadjar
    "1:18.840 64 laps",     // Liam Lawson
    "",     // Alexander Albon
    "",     // Carlos Sainz
    "1:19.870 laps 78 laps",     // Nico Hülkenberg
    "1:20.179 66 laps",     // Gabriel Bortoleto
    "1:20.920 54 laps", //Valtteri Bottas
    "1:21.024 66 laps",//Sergio Perez
  ],
},

  ],

  weather: `Sunny skies with minimal chance of rain. Temperatures will hover just below 30 celcius.
`,
};
