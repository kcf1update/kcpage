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
 raceDates: "Feb 11 - 13",
  trackInfoUrl: "https://www.bahraingp.com/", // <-- add this
  
  sessions: [
    {
  id: "session1",
  label: "Day 1 Feb 11",
  time: "completed -- *only drove in morning session",
  results: [
    " 1:34.798, 136 laps",   // Max Verstappen
    " 1:37.945, 75 laps",  // Arvid Lindblad
    "1:35.959, 80 laps",   // Charles Leclerc
    "1:36.433, 52 laps*",   // Lewis Hamilton
    " 1:34.669, 58 laps",   // Lando Norris
    " 1:35.602, 54 laps*",   // Oscar Piastri
    " 1:36.108, 56 laps*",     // George Russell
    " 1:37.629, 30 laps",     // Kimi Antonelli
    " 1:39.883, 36 laps ",     // Lance Stroll
    "",     // Fernando Alonso
    "1:36.765, 49 laps",     // Pierre Gasly
    " 1:40.330, 28 laps*",     // Franco Colapinto
    " 1:35.578, 115 laps",     // Esteban Ocon
    "",     // Ollie Bearman
    "",     // Isack Hadjar
    "",     // Liam Lawson
    "1:37.437, 68 laps",     // Alex Albon
    "1:38.221, 77 laps*",     // Carlos Sainz
    " 1:36.861, 73 laps",     // Nico Hülkenberg
    " 1:38.871, 49 laps*",     // Gabriel Bortoleto
    "1:39.150, 49 laps*",// Valtteri Bottas
    "1:38.828, 58 laps",// Sergio Perez
  ],
},

    {
  id: "session2",
  label: "Day 2 Feb 12",
  time: "completed -- *only drove in morning session",
  results: [
    "",   // Max Verstappen
    "1:37.470, 83 laps",  // Arvid Lindblad
    "1:34.273, 139 laps",   // Charles Leclerc
    "",   // Lewis Hamilton
    "1:34.784, 149 laps",   // Lando Norris
    "",   // Oscar Piastri
    "1:35.466, 54 laps",     // George Russell
    "no time set, 3 laps*",     // Kimi Antonelli
    "",     // Lance Stroll
    "1:38.248, 98 laps",     // Fernando Alonso
    " 1:36.723, 97 laps",     // Pierre Gasly
    "",     // Franco Colapinto
    "",     // Esteban Ocon
    "1:35.394, 130 laps",     // Ollie Bearman
    "1:36.561, 87 laps",     // Isack Hadjar
    "1:38.017, 50 laps*",     // Liam Lawson
    "1:37.229, 62 laps*",     // Alex Albon
    "1:37.592, 69 laps",     // Carlos Sainz
    "1:37.266, 47 laps*",     // Nico Hülkenberg
    "1:36.670, 67 laps",     // Gabriel Bortoleto
    " 1:36.824, 67 laps", //Valtteri Bottas
    "1:38.653, 42 laps*",//Sergio Perez
  ],
},
    {
  id: "session3",
  label: "Day 3 Feb 13",
  time: "completed -- *only drove in morning session",
  results: [
    "1:35.341, 61 laps",   // Max Verstappen
    "",  // Arvid Lindblad
    "",   // Charles Leclerc
    "1:34.209, 138 laps",   // Lewis Hamilton
    "",   // Lando Norris
    "1:34.549, 153 laps",   // Oscar Piastri
    "1:33.918, 78 laps",     // George Russell
    "1:33.669, 49 laps",     // Kimi Antonelli
    "1:38.165, 69 laps",     // Lance Stroll
    "",     // Fernando Alonso
    "",     // Pierre Gasly
    "1:35.806, 137 laps",     // Franco Colapinto
    "1:35.753, 68 laps",     // Esteban Ocon
    "1:35.972, 70 laps",     // Ollie Bearman
    "1:35.610, 53 laps",     // Isack Hadjar
    "1:36.808, 119 laps",     // Liam Lawson
    "1:36.793, 71 laps",     // Alex Albon
    "1:37.186, 68 laps",     // Carlos Sainz
    "1:36.291, 49 laps",     // Nico Hülkenberg
    "1:37.536, 60 laps",     // Gabriel Bortoleto
    "1:38.772, 37 laps", //Valtteri Bottas
    "1:39.251, 62 laps",//Sergio Perez
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

  weather: `Wed 11th high 25° low 19°, 
  Thu 12th high 25° low 19° 
  Fri 13th high 25° low 20° 
  No rain in the forecast`,
};
