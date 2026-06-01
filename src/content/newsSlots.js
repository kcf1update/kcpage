const newsSlots = [
    
 {
  slotId: "news1",
  sourceLabel: "Crash.net",
  title: "F1 2026 Monaco Grand Prix: Start time, how to watch and full schedule",
  summary: "Formula 1 heads to Monaco from June 5-7 for a traditional race weekend, with practice on Friday, final practice and qualifying on Saturday, and the Grand Prix on Sunday. The tight Monte Carlo streets put extra pressure on qualifying, with Mercedes looking strong but Ferrari tipped as a serious threat.",
  kcsQuickShift: "Monaco week is here, and this is the one where Saturday qualifying can shape the whole weekend.",
  url: "https://www.crash.net/f1/news/1096692/1/f1-2026-monaco-grand-prix-start-time-how-watch-and-full-schedule",
  imagePath: "/img/news/raceposter/news-postermonaco.jpg",
  imageSource: "KC AI Generated Image",
  dateLabel: "Jun 1, 2026"
},
{
  slotId: "news2",
  sourceLabel: "Crash.net",
  title: "Guenther Steiner dig at Max Verstappen over F1 2026 rules draws brutal clapback from Jos",
  summary: "Guenther Steiner took a swipe at Max Verstappen’s complaints over the 2026 F1 rules, suggesting the debate is partly about keeping Max happy. Jos Verstappen fired back at Steiner, while Max continues to make it clear that the planned 2026 engine format still needs changes.",
  kcsQuickShift: "This 2026 rules debate is not going away, and when Steiner and the Verstappen camp get involved, it gets personal fast.",
  url: "https://www.crash.net/f1/news/1096685/1/guenther-steiner-dig-max-verstappen-over-f1-2026-rules-draws-brutal-clawback-jos",
  imagePath: "/img/news/shut/news-shutterstockmax.jpg",
  imageSource: "Shutterstock",
  dateLabel: "Jun 1, 2026"
},
{
  slotId: "news3",
  sourceLabel: "Crash.net",
  title: "Explained: Why F1 has removed active aero at the Monaco Grand Prix",
  summary: "F1 drivers will not have active aero available at Monaco after the FIA decided there will be no straight mode zones around the circuit. The decision comes down to safety and stability, with Monaco’s short straights, traction zones and braking areas not fitting the FIA’s criteria.",
  kcsQuickShift: "This makes sense for Monaco, because the last thing anyone needs is cars getting unstable through those tight streets.",
  url: "https://www.crash.net/f1/news/1096301/1/explained-why-f1-has-removed-active-aero-monaco-grand-prix",
  imagePath: "/img/news/kcai/news-FIA.jpg",
  imageSource: "KC AI Generated Image",
  dateLabel: "Jun 1, 2026"
},
{
  slotId: "news4",
  sourceLabel: "RacingNews365",
  title: "Lance Stroll reveals staggering Aston Martin upgrades timeline",
  summary: "Lance Stroll says Aston Martin may not bring its first major upgrade until Spa or Zandvoort, meaning the team could be waiting until after the summer break for new parts. Stroll said the vibration issue has been fixed, but the AMR26 still needs a lot more power and downforce.",
  kcsQuickShift: "That is a long wait for Aston Martin, especially when the car still sounds like it needs help in a few big areas.",
  url: "https://racingnews365.com/lance-stroll-reveals-staggering-aston-martin-upgrades-timeline",
  imagePath: "/img/news/shut/news-shutterstocklance.jpg",
  imageSource: "Shutterstock",
  dateLabel: "Jun 1, 2026"
},
{
  slotId: "news5",
  sourceLabel: "PlanetF1",
  title: "Williams targeting ‘next level’ as former McLaren insider joins in latest signing spree",
  summary: "Williams has added former McLaren insider Piers Thynne as part of a wider recruitment push under James Vowles. Thynne helped McLaren during its recent rise, and Williams is also bringing in experienced names from Mercedes and Alpine as it tries to build back toward the front.",
  kcsQuickShift: "Williams is not just talking about rebuilding anymore, they are bringing in serious people to try and make it happen.",
  url: "https://www.planetf1.com/news/williams-mclaren-f1-jobs-piers-thynne",
  imagePath: "/img/news/xpb/news-xpbjames.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "Jun 1, 2026"
},
{
  slotId: "news6",
  sourceLabel: "Motorsport.com",
  title: "Max Verstappen jokes about Red Bull in Monaco: ‘I’m going to order a new back’",
  summary: "Max Verstappen says Monaco could be another tough weekend for Red Bull, joking that he may need a new back because of how bumpy the circuit is. Red Bull has struggled with kerbs and bumps before, and Monaco’s tight street layout could expose that weakness again.",
  kcsQuickShift: "Max is joking, but there is a real concern here because Monaco is exactly the kind of track that can make Red Bull uncomfortable.",
  url: "https://www.motorsport.com/f1/news/max-verstappen-jokes-about-red-bull-in-monaco-im-going-to-order-a-new-back/10825961/",
  imagePath: "/img/news/shut/news-shutterstockmaxcar.jpg",
  imageSource: "Shutterstock",
  dateLabel: "Jun 1, 2026"
},
{
  slotId: "news7",
  sourceLabel: "RacingNews365 NL",
  title: "Norris treedt in voetsporen Verstappen met Nordschleife-debuut EN: Norris follows in Verstappen’s footsteps with Nordschleife debut",
  summary: "Lando Norris heeft zijn eerste rondes gereden op de Nürburgring Nordschleife in een McLaren 750S, nadat Max Verstappen eerder ook veel aandacht kreeg op het beroemde circuit. In de beelden is te zien dat Norris voorzichtig begint, maar steeds meer vertrouwen krijgt. EN: Lando Norris has completed his first laps of the Nürburgring Nordschleife in a McLaren 750S, following the recent attention around Max Verstappen at the same famous circuit. The onboard footage shows Norris starting carefully before growing more confident.",
  kcsQuickShift: "Nice little side story here with Lando trying the Nordschleife, and you can see him getting more comfortable as the run goes on. NL: Mooi klein zijverhaal hier met Lando op de Nordschleife, en je ziet hem steeds meer vertrouwen krijgen tijdens de rit.",
  url: "https://racingnews365.nl/norris-treedt-in-voetsporen-verstappen-met-nordschleife-debuut",
  imagePath: "/img/news/xpb/news-xpblando.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "Jun 1, 2026"
},
{
  slotId: "news8",
  sourceLabel: "Motorsport.com",
  title: "Williams prioritises Monaco spare parts after costly Alex Albon Canadian GP crash",
  summary: "James Vowles says Williams is pushing hard to build up its spare parts supply before Monaco after a damaging Canadian Grand Prix weekend. Alex Albon’s Friday crash hit several major components, and Vowles warned that Monaco’s tight street circuit can be brutal if a team arrives short on spares.",
  kcsQuickShift: "This is the hidden side of a crash weekend, because the damage does not end when the car gets back to the garage.",
  url: "https://www.motorsport.com/f1/news/williams-prioritised-monaco-spare-parts-after-costly-alex-albon-canadian-gp-crash/10825763/",
  imagePath: "/img/news/shut/news-shutterstockalbon.jpg",
  imageSource: "Shutterstock",
  dateLabel: "Jun 1, 2026"
},
{
  slotId: "news9",
  sourceLabel: "Motorsport.com",
  title: "Kimi Antonelli makes Lewis Hamilton-Nico Rosberg vow amid George Russell F1 fight",
  summary: "Kimi Antonelli says Mercedes is letting him and George Russell race freely, but he does not want their fight to become another Hamilton-Rosberg situation. After tension between the two in Canada, Antonelli said they can race hard, but need to keep it fair and avoid hurting the team.",
  kcsQuickShift: "This is exactly the balance Mercedes has to manage now, because Antonelli and Russell both want to win but the team cannot afford a teammate war.",
  url: "https://www.motorsport.com/f1/news/kimi-antonelli-makes-lewis-hamilton-nico-rosberg-vow-amid-george-russell-f1-fight/10825867/",
  imagePath: "/img/news/xpb/news-xpbkimi3.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "Jun 1, 2026"
},
{
  slotId: "news10",
  sourceLabel: "Formula 1",
  title: "It’s Race Week: 5 storylines we’re excited about ahead of the 2026 Monaco Grand Prix",
  summary: "Formula 1’s Monaco preview looks at the biggest storylines heading into the weekend, including the importance of qualifying, Ferrari and McLaren’s chances of challenging Mercedes, George Russell trying to close the gap after Canada, and the added traffic challenge with 22 cars on track.",
  kcsQuickShift: "This is a good Monaco setup piece, because it covers the big picture before the cars hit the streets.",
  url: "https://www.formula1.com/en/latest/article/its-race-week-5-storylines-were-excited-about-ahead-of-the-2026-monaco-grand-prix.6augu7uTvHvJRRmoxT9O8n",
  imagePath: "/img/news/shut/news-shutmonaco.jpg",
  imageSource: "Shutterstock",
  dateLabel: "Jun 1, 2026"
}
];

export { newsSlots };