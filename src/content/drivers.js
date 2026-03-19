// src/content/drivers.js
// Put your flag PNGs in /public/flags using lowercase country codes, e.g. /public/flags/gb.png

const rawDrivers = [
  // McLaren
  { id: "NOR", name: "Lando Norris", number: 1, countryCode: "gb", team: "McLaren" },
  { id: "PIA", name: "Oscar Piastri", number: 81, countryCode: "au", team: "McLaren" },

  // Mercedes
  { id: "RUS", name: "George Russell", number: 63, countryCode: "gb", team: "Mercedes" },
  { id: "ANT", name: "Kimi Antonelli", number: 12, countryCode: "it", team: "Mercedes" },

  // Red Bull
  { id: "VER", name: "Max Verstappen", number: 3, countryCode: "nl", team: "Red Bull" },
  { id: "HAD", name: "Isack Hadjar", number: 6, countryCode: "fr", team: "Red Bull" },

  // Ferrari
  { id: "LEC", name: "Charles Leclerc", number: 16, countryCode: "mc", team: "Ferrari" },
  { id: "HAM", name: "Lewis Hamilton", number: 44, countryCode: "gb", team: "Ferrari" },

  // Williams
  { id: "ALB", name: "Alex Albon", number: 23, countryCode: "th", team: "Williams" },
  { id: "SAI", name: "Carlos Sainz", number: 55, countryCode: "es", team: "Williams" },

  // Racing Bulls
  { id: "LAW", name: "Liam Lawson", number: 30, countryCode: "nz", team: "Racing Bulls" },
  { id: "LIN", name: "Arvid Lindblad", number: 41, countryCode: "gb", team: "Racing Bulls" },

  // Aston Martin
  { id: "ALO", name: "Fernando Alonso", number: 14, countryCode: "es", team: "Aston Martin" },
  { id: "STR", name: "Lance Stroll", number: 18, countryCode: "ca", team: "Aston Martin" },

  // Haas
  { id: "OCO", name: "Esteban Ocon", number: 31, countryCode: "fr", team: "Haas" },
  { id: "BEA", name: "Oliver Bearman", number: 87, countryCode: "gb", team: "Haas" },

  // Audi / Sauber
  { id: "HUL", name: "Nico Hulkenberg", number: 27, countryCode: "de", team: "Audi" },
  { id: "BOR", name: "Gabriel Bortoleto", number: 5, countryCode: "br", team: "Audi" },

  // Alpine
  { id: "GAS", name: "Pierre Gasly", number: 10, countryCode: "fr", team: "Alpine" },
  { id: "COL", name: "Franco Colapinto", number: 43, countryCode: "ar", team: "Alpine" },

  // Cadillac
  { id: "PER", name: "Sergio Perez", number: 11, countryCode: "mx", team: "Cadillac" },
  { id: "BOT", name: "Valtteri Bottas", number: 77, countryCode: "fi", team: "Cadillac" },
];

export const DRIVERS = rawDrivers.map((driver) => ({
  ...driver,
  flag: driver.countryCode ? `/flags/${driver.countryCode.toLowerCase()}.png` : "",
}));

export const DRIVER_IDS = DRIVERS.map((d) => d.id);

export const getDriverById = (id) => DRIVERS.find((d) => d.id === id);