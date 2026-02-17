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
  label: "Day 1 Feb 18",
  time: "3am to 12noon AST",
  results: [
    " ",   // Max Verstappen
    " ",  // Arvid Lindblad
    "",   // Charles Leclerc
    "",   // Lewis Hamilton
    " ",   // Lando Norris
    " ",   // Oscar Piastri
    " ",     // George Russell
    " ",     // Kimi Antonelli
    " ",     // Lance Stroll
    "",     // Fernando Alonso
    "",     // Pierre Gasly
    " ",     // Franco Colapinto
    " ",     // Esteban Ocon
    "",     // Ollie Bearman
    "",     // Isack Hadjar
    "",     // Liam Lawson
    "",     // Alex Albon
    "",     // Carlos Sainz
    " ",     // Nico Hülkenberg
    " ",     // Gabriel Bortoleto
    "",// Valtteri Bottas
    "",// Sergio Perez
  ],
},

    {
  id: "session2",
  label: "Day 2 Feb 19",
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
  label: "Day 3 Feb 20",
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
