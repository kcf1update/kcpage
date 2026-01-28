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
  time: "",
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
    "",     // Oliver Bearman
    "",     // Isack Hadjar
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
  id: "session4",
  label: "Session 4",
  time: "",
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
    "",     // Oliver Bearman
    "",     // Isack Hadjar
    "",     // Liam Lawson
    "",     // Alexander Albon
    "",     // Carlos Sainz
    "",     // Nico Hülkenberg
    "",     // Gabriel Bortoleto
    "", //Valtteri Bottas
    "",//Sergio Perez
  ],
},

  ],

  weather: `Example:
Fri: 36°C, partly cloudy
Sat: 24°C, chance of showers
Sun: 23°C, dry race expected`,
};
