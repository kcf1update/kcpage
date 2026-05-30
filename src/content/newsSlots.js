const newsSlots = [
    
 {
  slotId: "news1",
  sourceLabel: "ESPN",
  title: "Horner Reportedly Targeting F1 Return With BYD",
  summary: "Christian Horner is reportedly looking at a Formula 1 return with BYD, only months after his Red Bull exit. If it happens, it could be one of the biggest paddock moves in years and would add a major new storyline around F1’s future team landscape.",
  kcsQuickShift: "This one could be huge if it happens because Horner coming back with a new project would shake up the whole paddock.",
  url: "https://www.espn.com/f1/story/_/id/48826861/christian-horner-targets-formula-1-return-byd-10-months-red-bull-sacking-sources",
  imagePath: "/img/news/shut/news-christian.jpg",
  imageSource: "Shutterstock",
  dateLabel: "May 30, 2026"
},
{
  slotId: "news2",
  sourceLabel: "Crash.net",
  title: "Mercedes Walks Away From Alpine Share Talks",
  summary: "Mercedes has reportedly stepped back from talks over buying a minority stake in Alpine after the asking price became too high. The possible deal had moved far enough to become serious, but Mercedes now appears to have walked away from the table.",
  kcsQuickShift: "That is a pretty big business story because Alpine’s future still feels like one of the more unsettled situations on the grid.",
  url: "https://www.crash.net/f1/news/1096410/1/mercedes-walks-away-overpriced-alpine-f1-share-purchase",
  imagePath: "/img/news/xpb/news-xpbtoto.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "May 30, 2026"
},
{
  slotId: "news3",
  sourceLabel: "Formula1.com",
  title: "Antonelli Says He Must Keep Levelling Up In Title Fight",
  summary: "Kimi Antonelli says he cannot relax despite building a strong lead over George Russell in the drivers’ championship. The Mercedes driver says the season is still early, the competition is getting closer, and he needs to keep raising his level.",
  kcsQuickShift: "Antonelli sounds calm, but this title fight with Russell is only going to get more interesting from here.",
  url: "https://www.formula1.com/en/latest/article/antonelli-vows-to-keep-levelling-up-as-he-shares-mindset-over-developing-title-fight-with-russell.5sFGYIv70MRth0rdk3Osdp",
  imagePath: "/img/news/xpb/news-kimimiami.jpg",
  imageSource: "Formula1.com",
  dateLabel: "May 30, 2026"
},
{
  slotId: "news4",
  sourceLabel: "Crash.net",
  title: "Hamilton Loved Throwback Duel With Verstappen",
  summary: "Lewis Hamilton said he loved hunting down Max Verstappen during their late Canadian Grand Prix fight. Hamilton eventually passed Verstappen for second place, while both drivers said they enjoyed the battle after a tough, strategic fight to the flag.",
  kcsQuickShift: "It was good to see Hamilton and Verstappen fighting like that again, and it felt like a real throwback moment.",
  url: "https://www.crash.net/f1/news/1096290/1/lewis-hamilton-loved-hunting-down-one-greats-throwback-max-verstappen-duel",
  imagePath: "/img/news/xpb/news-maxlewismontreal.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "May 30, 2026"
},
{
  slotId: "news5",
  sourceLabel: "Motorsport.com",
  title: "Hamilton Simulator Decision Raises Ferrari Questions",
  summary: "David Croft has called Lewis Hamilton’s decision to avoid Ferrari’s simulator programme “quite damning” after Hamilton’s improved Canadian Grand Prix weekend. The comments raise more questions about Ferrari’s factory-to-track correlation and whether Hamilton has found a better direction outside the normal process.",
  kcsQuickShift: "Hamilton’s Canada weekend looked like progress, but this simulator story still makes you wonder what is really going on at Ferrari.",
  url: "https://www.motorsport.com/f1/news/lewis-hamilton-ferrari-simulator-decision-branded-quite-damning-after-canada-breakthrough/10825186/",
  imagePath: "/img/news/Ferrari/news-lewisandcharlesmontreal.jpg",
  imageSource: "Courtesy of Ferrari F1",
  dateLabel: "May 30, 2026"
},
{
  slotId: "news6",
  sourceLabel: "FormulaPassion",
  title: "Stella e Norris: “La Ferrari è favorita per Monaco, lo dice il GPS” EN: Stella And Norris Say Ferrari Is Favourite For Monaco",
  summary: "Andrea Stella ha detto che i dati GPS mostrano una Ferrari molto competitiva in curva, soprattutto in vista di Monaco dove i rettilinei sono pochi. EN: Andrea Stella says GPS data points to Ferrari being very strong in the corners, making them a serious favourite for pole position at Monaco.",
  kcsQuickShift: "Ferrari could be right in the mix at Monaco if the car really is that strong in the slow corners. IT: La Ferrari potrebbe essere davvero in lotta a Monaco se la macchina è così forte nelle curve lente.",
  url: "https://www.formulapassion.it/f1/f1-news/stella-norris-ha-ragione-la-ferrari-e-la-favorita-per-la-pole-position-a-monaco",
  imagePath: "/img/news/Ferrari/news-ferrari6.jpg",
  imageSource: "Courtesy of Ferrari F1",
  dateLabel: "May 30, 2026"
},
{
  slotId: "news7",
  sourceLabel: "Marca México",
  title: "Cadillac No Es Red Bull Con Checo Pérez, Pero Sí Lo Defienden EN: Cadillac Is Not Red Bull With Checo Pérez, But They Are Defending Him",
  summary: "Cadillac ha cerrado la puerta a los rumores sobre una posible salida temprana de Sergio Pérez, con Graeme Lowdon defendiendo el trabajo de Checo y Valtteri Bottas en el nuevo proyecto. EN: Cadillac has pushed back against rumours about Sergio Pérez leaving early, with Graeme Lowdon backing both Checo and Valtteri Bottas as the team builds its first F1 season.",
  kcsQuickShift: "Cadillac backing Checo this early matters because a new team needs stability before it needs drama. ES: Que Cadillac respalde a Checo tan pronto importa porque un equipo nuevo necesita estabilidad antes que drama.",
  url: "https://www.marca.com/mx/motor/formula-1/2026/05/30/6a1aaf5f22601d214d8b4588.html",
  imagePath: "/img/news/xpb/news-xpbperez.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "May 30, 2026"
},
{
  slotId: "news8",
  sourceLabel: "The Race",
  title: "How Worried Should Bottas Be About His F1 Future?",
  summary: "Valtteri Bottas is under more pressure after a difficult start beside Sergio Pérez at Cadillac, but his seat does not appear to be in immediate danger. The bigger concern is that Pérez has looked stronger so far, especially across recent weekends where Cadillac is still trying to find its footing.",
  kcsQuickShift: "Bottas probably is not in trouble right now, but he does need to stop this from turning into a clear trend.",
  url: "https://www.the-race.com/formula-1/how-worried-bottas-should-really-be-about-his-f1-future/",
  imagePath: "/img/news/shut/news-shutterstockbottas.jpg",
  imageSource: "Shutterstock",
  dateLabel: "May 30, 2026"
},
{
  slotId: "news9",
  sourceLabel: "RacingNews365",
  title: "Aston Martin Or Cadillac: Who Scores First?",
  summary: "Aston Martin and Cadillac remain the only teams without points this season, but both are trying to move closer to the midfield. Cadillac appears to be improving its qualifying gap and race performance, while Aston Martin is still waiting for bigger upgrades to move the AMR26 forward.",
  kcsQuickShift: "This bottom-of-the-table fight is actually worth watching because one messy race could change everything for either team.",
  url: "https://racingnews365.com/aston-martin-or-cadillac-who-wins-the-race-to-a-first-point",
  imagePath: "/img/news/shut/news-shutaston.jpg",
  imageSource: "Shutterstock",
  dateLabel: "May 30, 2026"
},
{
  slotId: "news10",
  sourceLabel: "Motorsport.com",
  title: "Bearman And Ocon Entertain Fans On Hot Ones",
  summary: "Ollie Bearman and Esteban Ocon gave fans a lighter F1 moment with their appearance on Hot Ones Versus. The Haas team-mates answered awkward questions, joked through the challenge, and showed off a more relaxed side away from the track.",
  kcsQuickShift: "This is just a fun one, and it is good to see a bit of personality from the drivers once in a while.",
  url: "https://www.motorsport.com/f1/news/ollie-bearman-and-esteban-ocon-leave-f1-fans-in-stitched-with-hot-ones-appearance/10825288/",
  imagePath: "/img/news/xpb/news-xpbestoban.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "May 30, 2026"
}];

export { newsSlots };