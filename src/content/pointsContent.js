// src/content/pointsContent.js
// ✅ Data-only file (NO React imports in here)

// Teams (used for Constructor standings)
export const pointsTeams = [
  { id: "RBR", name: "Red Bull Racing", color: "#0600EF" },
  { id: "FER", name: "Scuderia Ferrari", color: "#E8002D" },
  { id: "MCL", name: "McLaren", color: "#FF8000" },
  { id: "MER", name: "Mercedes", color: "#00D2BE" },
  { id: "AMR", name: "Aston Martin", color: "#006F62" },
  { id: "ALP", name: "Alpine", color: "#0090FF" },
  { id: "HAA", name: "Haas", color: "#B6BABD" },
  { id: "RAC", name: "Racing Bulls", color: "#1434A4" },
  { id: "WIL", name: "Williams", color: "#00A1E0" },
  { id: "SAU", name: "Audi", color: "#E10600" },
  { id: "CAD", name: "Cadillac", color: "#BFC3C7"  },

];

// Drivers (edit ONLY the points numbers)
export const pointsDrivers = [
  // Red Bull Racing
  { id: "VER", name: "Max Verstappen", code: "VER", teamId: "RBR", teamName: "Red Bull Racing", countryFlag: "🇳🇱", points: 8  },
  { id: "HAD", name: "Isack Hadjar",   code: "HAD", teamId: "RBR", teamName: "Red Bull Racing", countryFlag: "🇫🇷", points: 0 },

  // Ferrari
  { id: "LEC", name: "Charles Leclerc", code: "LEC", teamId: "FER", teamName: "Scuderia Ferrari", countryFlag: "🇲🇨", points: 22 },
  { id: "HAM", name: "Lewis Hamilton",  code: "HAM", teamId: "FER", teamName: "Scuderia Ferrari", countryFlag: "🇬🇧", points: 18 },

  // McLaren
  { id: "NOR", name: "Lando Norris",  code: "NOR", teamId: "MCL", teamName: "McLaren", countryFlag: "🇬🇧", points: 15 },
  { id: "PIA", name: "Oscar Piastri", code: "PIA", teamId: "MCL", teamName: "McLaren", countryFlag: "🇦🇺", points: 3 },

  // Mercedes
  { id: "RUS", name: "George Russell",  code: "RUS", teamId: "MER", teamName: "Mercedes", countryFlag: "🇬🇧", points: 33 },
  { id: "ANT", name: "Kimi Antonelli",  code: "ANT", teamId: "MER", teamName: "Mercedes", countryFlag: "🇮🇹", points: 22 },

  // Aston Martin
  { id: "STR", name: "Lance Stroll",   code: "STR", teamId: "AMR", teamName: "Aston Martin", countryFlag: "🇨🇦", points: 0 },
  { id: "ALO", name: "Fernando Alonso", code: "ALO", teamId: "AMR", teamName: "Aston Martin", countryFlag: "🇪🇸", points: 0 },

  // Alpine
  { id: "GAS", name: "Pierre Gasly",     code: "GAS", teamId: "ALP", teamName: "Alpine", countryFlag: "🇫🇷", points: 1 },
  { id: "COL", name: "Franco Colapinto", code: "COL", teamId: "ALP", teamName: "Alpine", countryFlag: "🇦🇷", points: 0 },

  // Haas
  { id: "OCO", name: "Esteban Ocon",    code: "OCO", teamId: "HAA", teamName: "Haas", countryFlag: "🇫🇷", points: 0 },
  { id: "BEA", name: "Oliver Bearman",  code: "BEA", teamId: "HAA", teamName: "Haas", countryFlag: "🇬🇧", points: 7 },

  // Racing Bulls
  { id: "LAW", name: "Liam Lawson",     code: "LAW", teamId: "RAC", teamName: "Racing Bulls", countryFlag: "🇳🇿", points: 2 },
  { id: "LNB", name: "Arvid Lindblad",  code: "LNB", teamId: "RAC", teamName: "Racing Bulls", countryFlag: "🇬🇧", points: 4 },

  // Williams
  { id: "ALB", name: "Alexander Albon", code: "ALB", teamId: "WIL", teamName: "Williams", countryFlag: "🇹🇭", points: 0 },
  { id: "SAI", name: "Carlos Sainz",    code: "SAI", teamId: "WIL", teamName: "Williams", countryFlag: "🇪🇸", points: 0 },

  // Audi
  { id: "HUL", name: "Nico Hülkenberg",    code: "HUL", teamId: "SAU", teamName: "Audi", countryFlag: "🇩🇪", points: 0 },
  { id: "BOR", name: "Gabriel Bortoleto",  code: "BOR", teamId: "SAU", teamName: "Audi", countryFlag: "🇧🇷", points: 2 },

  // Cadillac (future entry)
  { id: "PER", name: "Sergio Perez", code: "PER", teamId: "CAD", teamName: "Cadillac", countryFlag: "MX", points: 0 },
{ id: "BOT", name: "Valtteri Bottas", code: "BOT", teamId: "CAD", teamName: "Cadillac", countryFlag: "FI", points: 0 },

];

// Optional: if you ever want to FORCE a constructor’s points (instead of auto-summing)
// Leave as {} to disable.
export const constructorPointsOverride = {
  // مثال:
  // RBR: 120,
};
