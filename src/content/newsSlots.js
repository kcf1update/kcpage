const newsSlots = [
    
{
  slotId: "news1",
  sourceLabel: "Crash.net",
  title: "Antonelli snatches dramatic Monaco pole as Leclerc hits the wall",
  summary: "Kimi Antonelli grabbed a huge Monaco Grand Prix pole after beating Max Verstappen by just 0.043s in a tense Q3 finish. Lewis Hamilton took third for Ferrari, while Charles Leclerc clipped the wall at Tabac on his final push lap after briefly holding provisional pole.",
  kcsQuickShift: "That is a massive pole for Antonelli, and at Monaco, starting up front can be half the battle.",
  url: "https://www.crash.net/f1/news/1097306/1/kimi-antonelli-snatches-dramatic-monaco-pole-charles-leclerc-hits-wall",
  imagePath: "/img/news/xpb/news-xpbkimipole.jpg",
  imageSource: "Crash.net",
  dateLabel: "Jun 6, 2026",
},
{
   slotId: "news2",
  sourceLabel: "Motorsport.com",
  title: "Antonelli takes sensational Monaco pole as Russell struggles to sixth",
  summary: "Kimi Antonelli took Monaco Grand Prix pole with a 1m12.051s, beating Max Verstappen by 0.043s after a late Q3 shootout. Lewis Hamilton qualified third, Charles Leclerc ended up fourth after hitting the barriers late on, while George Russell was only sixth and McLaren locked out the fourth row.",
  kcsQuickShift: "Antonelli keeps looking like the real deal, and Monaco pole is about as big as it gets.",
  url: "https://www.motorsport.com/f1/news/f1-monaco-gp-kimi-antonelli-takes-pole-position/10827563/",
  imagePath: "/img/news/xpb/news-kimipole2.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "Jun 6, 2026",
},
{
  slotId: "news3",
  sourceLabel: "The Race",
  title: "McLaren Breaks Curfew To Fix Norris’s Monaco Problem",
  summary: "McLaren broke one of its permitted curfews overnight in Monaco to work on Lando Norris’s car after his practice problems on Friday. Norris lost valuable track time during FP2, leaving McLaren with extra work to do before final practice and qualifying.",
  kcsQuickShift: "Not ideal for Norris at Monaco, because every missed lap here can hurt when qualifying is everything.",
  url: "https://www.the-race.com/formula-1/mclaren-broke-curfew-to-fix-norriss-practice-problems/",
  imagePath: "/img/news/shut/news-shutterstockmclarenpit.jpg",
  imageSource: "Shutterstock",
  dateLabel: "Jun 6, 2026"
},
{
  slotId: "news4",
  sourceLabel: "Motorsport.com",
  title: "Button Names Ferrari’s Biggest Monaco Qualifying Threats",
  summary: "Jenson Button believes Ferrari still looks strong for Monaco qualifying, but he pointed to Mercedes and McLaren as the main threats around the streets of Monte Carlo. With track position so critical, the battle for pole could decide far more than just Saturday bragging rights.",
  kcsQuickShift: "Ferrari may have the headline pace, but Monaco qualifying is tight enough that one clean lap could flip everything.",
  url: "https://www.motorsport.com/f1/news/jenson-button-names-ferraris-biggest-monaco-gp-qualifying-threats/10827462/",
  imagePath: "/img/news/xpb/news-xpbjenson.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "Jun 6, 2026"
},
{
  slotId: "news5",
  sourceLabel: "PlanetF1",
  title: "Verstappen Encouraged As Red Bull Closes On Ferrari In Monaco",
  summary: "Max Verstappen said Red Bull made a positive start in Monaco after finishing third in both Friday practice sessions. Ferrari still looked like the team to beat, but Verstappen, Charles Leclerc and George Russell all pointed to Red Bull being closer than expected around Monte Carlo.",
  kcsQuickShift: "Ferrari still looks strong, but Verstappen being this close at Monaco is exactly the kind of thing that makes qualifying dangerous.",
  url: "https://www.planetf1.com/news/max-verstappen-monaco-gp-red-bull-surprise-ferrari-crash-joke",
  imagePath: "/img/news/xpb/xpbverstappen.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "Jun 6, 2026"
},
{
  slotId: "news6",
  sourceLabel: "Motorsport.com",
  title: "Bearman Crashes Out As Red Flag Interrupts Monaco FP3",
  summary: "Oliver Bearman brought out the red flags during final practice in Monaco after crashing at Massenet. The Haas driver hit the barriers and damaged the car, forcing a stoppage in a session where track time was already extremely valuable before qualifying.",
  kcsQuickShift: "That is a rough one for Bearman, because Monaco gives drivers almost no room to recover from a mistake before qualifying.",
  url: "https://www.motorsport.com/f1/news/ollie-bearman-crashes-out-of-monaco-fp3-as-red-flag-halts-session/10827456/",
  imagePath: "/img/news/xpb/news-xpbbearman.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "Jun 6, 2026"
},
{
  slotId: "news7",
  sourceLabel: "Infobae",
  title: "Antes de la clasificación, Franco Colapinto quedó 19° en la última práctica libre del GP de Mónaco EN: Before qualifying, Franco Colapinto finished 19th in final Monaco practice",
  summary: "Franco Colapinto cerró la FP3 del Gran Premio de Mónaco en el puesto 19° con un tiempo de 1:15.179, después de un leve despiste en la horquilla y de quedar por detrás de su compañero Pierre Gasly. EN: Franco Colapinto ended Monaco FP3 in 19th with a 1:15.179 after a small moment at the hairpin, while Pierre Gasly finished 13th for Alpine.",
  kcsQuickShift: "Colapinto had a difficult final practice, and Monaco is not the easiest place to go into qualifying needing a clean reset. ES: Colapinto tuvo una última práctica complicada, y Mónaco no es el lugar más fácil para llegar a la clasificación necesitando empezar de nuevo.",
  url: "https://www.infobae.com/deportes/2026/06/06/franco-colapinto-afrontara-la-ultima-practica-libre-y-la-clasificacion-del-gp-de-monaco-hora-tv-y-todo-lo-que-hay-que-saber/",
  imagePath: "/img/news/Alpine/news-43japan.jpg",
  imageSource: "Courtesy of Alpine F1",
  dateLabel: "Jun 6, 2026"
},
{
  slotId: "news8",
  sourceLabel: "RacingNews365.nl",
  title: "Verstappen moet groot gat laten naar ongenaakbare Antonelli EN: Verstappen left with big gap to untouchable Antonelli",
  summary: "Kimi Antonelli sloot de derde vrije training in Monaco als snelste af, met Charles Leclerc, Lewis Hamilton, George Russell en Max Verstappen achter hem. Verstappen eindigde uiteindelijk vijfde en moest negen tienden toegeven op de Mercedes-coureur. EN: Kimi Antonelli ended final practice in Monaco fastest, ahead of Charles Leclerc, Lewis Hamilton, George Russell and Max Verstappen. Verstappen finished fifth, nine tenths off the Mercedes driver.",
  kcsQuickShift: "Antonelli looked seriously quick, and Verstappen has work to do before qualifying. NL: Antonelli zag er serieus snel uit, en Verstappen heeft werk te doen voor de kwalificatie.",
  url: "https://racingnews365.nl/verstappen-moet-gigantisch-gat-laten-naar-ongenaakbare-antonelli",
  imagePath: "/img/news/shut/news-shutterstockmaxcar.jpg",
  imageSource: "Shutterstock",
  dateLabel: "Jun 6, 2026"
},
{
  slotId: "news9",
  sourceLabel: "Formula 1",
  title: "Briatore Says Gucci Deal Is Perfect For Alpine’s Future",
  summary: "Flavio Briatore says Alpine’s new Gucci partnership is a major step for the team’s image, finances and long-term growth. Gucci is set to become Alpine’s title partner in 2027, with the team racing as Gucci Racing Alpine Formula One Team.",
  kcsQuickShift: "This is bigger than a paint job, because Alpine is clearly trying to turn itself into a much more powerful brand.",
  url: "https://www.formula1.com/en/latest/article/its-good-for-formula-1-briatore-explains-why-gucci-deal-is-perfect-for-alpines-future.7nNw6Ourmfer98S4OFwsox",
  imagePath: "/img/news/shut/news-shutflavio.jpg",
  imageSource: "Shutterstock",
  dateLabel: "Jun 6, 2026"
},
{
  slotId: "news10",
  sourceLabel: "The Race",
  title: "Monaco Qualifying Set To Create Major Headaches For F1 Teams",
  summary: "Monaco qualifying is expected to be especially difficult for teams because traffic, tyre preparation and track position are all major problems on such a tight circuit. With overtaking so limited in the race, getting the timing right on Saturday could be just as important as raw pace.",
  kcsQuickShift: "Monaco qualifying is always stressful, but this one feels like it could get messy very quickly.",
  url: "https://www.the-race.com/formula-1/all-the-headaches-monaco-qualifying-will-give-f1-teams/",
  imagePath: "/img/news/shut/news-shutterstockmiamipit.jpg",
  imageSource: "Shutterstock",
  dateLabel: "Jun 6, 2026"
},
];

export { newsSlots };