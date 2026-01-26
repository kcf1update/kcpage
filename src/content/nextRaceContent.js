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
];

// Create a blank results row (one slot per driver, in the same order)
const blank = () => Array(NEXT_RACE_DRIVERS.length).fill("");

export const nextRaceContent = {
  raceName: "Bahrain Grand Prix",
  location: "Sakhir, Bahrain",
 raceDates: "Feb 11 - 13",
  trackInfoUrl: "https://www.bahraingp.com/", // <-- add this
  
  sessions: [
    {
  id: "session1",
  label: "Session 1",
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
  ],
},

    {
  id: "session2",
  label: "Session 2",
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
  ],
},

  ],

  weather: `Example:
Fri: 36°C, partly cloudy
Sat: 24°C, chance of showers
Sun: 23°C, dry race expected`,
};
