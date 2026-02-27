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
      label: "FP1 ",
      time: "9:30pm AST ",

      // ✅ Optional paste block (full timing sheet lines, any order)
      paste: `
`,

      results: Array(NEXT_RACE_DRIVERS.length).fill(""),
    },

    {
      id: "session2",
      label: "FP2",
      time: "1:00am AST",

      // ✅ Paste timing sheet here (full names + times, any order)
      paste: `
`,

      results: Array(NEXT_RACE_DRIVERS.length).fill(""),
    },

    {
      id: "session3",
      label: "FP3",
      time: "9:30pm AST",

      paste: `

`,

      results: Array(NEXT_RACE_DRIVERS.length).fill(""),
    },

    {
      id: "session4",
      label: "Qualifying",
      time: "1:00am AST",

      paste: ``,

      results: Array(NEXT_RACE_DRIVERS.length).fill(""),
    },
  ],

  weather: `Thursday Sunny/Cloudy🌤️ 23°
            Friday Sunny ☀️22°
            Saturday Sunny ☀️20°
            Sunday Sunny ☀️21°    `,
};