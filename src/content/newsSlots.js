const newsSlots = [
    
 {
  slotId: "news1",
  sourceLabel: "RacingNews365",
  title: "What has triggered Max Verstappen F1 exit threats explained",
  summary: "Max Verstappen’s frustration with F1’s new rules continues to grow, with the focus mainly on power unit balance, energy management, and whether the sport is moving too far away from pure racing.",
  kcsQuickShift: "This is a big one because when Verstappen talks about not enjoying the direction of F1, the sport has to take that seriously.",
  url: "https://racingnews365.com/what-has-triggered-max-verstappen-f1-exit-threats-explained",
  imagePath: "/img/news/xpb/xpbverstappen.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "May 31, 2026"
},

{
  slotId: "news2",
  sourceLabel: "RacingNews365",
  title: "Lewis Hamilton highlights key boost to Kimi Antonelli maiden F1 title hopes",
  summary: "Lewis Hamilton says Kimi Antonelli has a stronger support system around him at Mercedes than Hamilton had during his first title fight in 2007, with Toto Wolff helping guide the young Italian through the pressure.",
  kcsQuickShift: "Antonelli has the speed, but having the right people around him may be just as important in a title fight.",
  url: "https://racingnews365.com/lewis-hamilton-highlights-key-boost-to-kimi-antonelli-maiden-f1-title-hopes",
  imagePath: "/img/news/xpb/news-xpblewis.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "May 31, 2026"
},

{
  slotId: "news3",
  sourceLabel: "Crash.net",
  title: "Why Fernando Alonso is convinced he’s ‘the best’ in F1 despite Aston Martin woes",
  summary: "Fernando Alonso remains fully confident in his own level despite Aston Martin’s difficult start to 2026, saying he does not need the car’s results to prove he is still operating at the top.",
  kcsQuickShift: "That is classic Alonso, and honestly, that confidence is probably part of why he is still so dangerous after all these years.",
  url: "https://www.crash.net/f1/news/1096355/1/why-fernando-alonso-convinced-hes-best-f1-despite-aston-martin-woes",
  imagePath: "/img/news/shut/news-shutfernando.jpg",
  imageSource: "Shutterstock",
  dateLabel: "May 31, 2026"
},

{
  slotId: "news4",
  sourceLabel: "Crash.net",
  title: "Why Carlos Sainz thinks the time has come to stop complaining about F1 2026 rules",
  summary: "Carlos Sainz says the current 2026 rules are still not ideal, but he believes drivers may have to stop complaining for now and focus on improving the package for next season.",
  kcsQuickShift: "Sainz is not saying the rules are perfect, but he seems ready to stop fighting the same battle every weekend.",
  url: "https://www.crash.net/f1/news/1096291/1/why-carlos-sainz-thinks-time-has-come-stop-complaining-about-f1-2026-rules",
  imagePath: "/img/news/xpb/news-xpbcarlos.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "May 30, 2026"
},

{
  slotId: "news5",
  sourceLabel: "AUTOhebdo",
  title: "Décryptage – Aménagement moteur : Urgent d’attendre ? EN: Analysis: Engine adjustments, is it urgent to wait?",
  summary: "Nouvelle répartition de puissance, réduction des courses trop énergivores et discussions autour de l’ADUO continuent d’alimenter les débats entre les équipes, la FOM et la FIA. EN: The debate over F1’s engine rules continues, with power split, energy management, and ADUO all part of the discussion as the sport tries to find common ground.",
  kcsQuickShift: "This engine debate is not going away, and it may shape how good or frustrating this new era of F1 really becomes. FR: Ce débat moteur ne va pas disparaître, et il pourrait définir cette nouvelle ère de la F1.",
  url: "https://www.autohebdo.fr/actualites/f1/decryptage-amenagement-moteur-urgent-dattendre.html",
  imagePath: "/img/news/kcai/news-aduo1.jpg",
  imageSource: "KC AI generated image",
  dateLabel: "May 30, 2026"
},

{
  slotId: "news6",
  sourceLabel: "Motorsport.com",
  title: "The reclined seating position that caused Fernando Alonso's Canadian GP retirement",
  summary: "Fernando Alonso’s Canadian Grand Prix retirement was linked to severe back pain caused by Aston Martin’s more reclined cockpit position, with the issue becoming too much after repeated kerb impacts in Montreal.",
  kcsQuickShift: "That is a rough way to end a race, and it shows how even small cockpit changes can become a big problem for the driver.",
  url: "https://www.motorsport.com/f1/news/fernando-alonso-canadian-gp-retirement-cause/10825683/",
  imagePath: "/img/news/shut/news-shutaston.jpg",
  imageSource: "Motorsport.com",
  dateLabel: "May 31, 2026"
},

{
  slotId: "news7",
  sourceLabel: "PlanetF1",
  title: "James Vowles sends clear Carlos Sainz message before F1 silly season ignites",
  summary: "James Vowles believes Carlos Sainz and Alex Albon still want to be part of the Williams project, even with driver market talk starting to build around the grid.",
  kcsQuickShift: "This is really about trust, because Williams has to show Sainz and Albon that the progress is real.",
  url: "https://www.planetf1.com/news/carlos-sainz-williams-james-vowles-driver-market",
  imagePath: "/img/news/xpb/news-xpbjames.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "May 31, 2026"
},

{
  slotId: "news8",
  sourceLabel: "Autosport",
  title: "From Benetton to Gucci: Is Briatore closing the circle at Enstone?",
  summary: "Autosport looks at the parallels between Benetton’s rise in F1 and Gucci’s arrival at Alpine, with Flavio Briatore again sitting near the centre of the Enstone story.",
  kcsQuickShift: "This is one of those bigger picture F1 stories where business, history, and team politics all cross over.",
  url: "https://www.autosport.com/f1/news/from-benetton-to-gucci-is-briatore-closing-the-circle-at-enstone/10825180/",
  imagePath: "/img/news/shut/news-shutflavio.jpg",
  imageSource: "Shutterstock",
  dateLabel: "May 29, 2026"
},

{
  slotId: "news9",
  sourceLabel: "F1news.se",
  title: "Antonelli får vägledning från Wolff och Bono EN: Antonelli gets guidance from Wolff and Bono",
  summary: "Kimi Antonelli fick stöd och tydliga instruktioner från Toto Wolff och Peter Bonnington efter den intensiva Mercedes-duellen med George Russell under Kanadas sprintlopp. EN: Kimi Antonelli received guidance from Toto Wolff and Peter Bonnington after his heated Mercedes battle with George Russell during the Canadian sprint.",
  kcsQuickShift: "Antonelli is fast, but moments like this show how much learning still happens even when a young driver is winning. SE: Antonelli är snabb, men sådana här stunder visar hur mycket en ung förare fortfarande lär sig även när han vinner.",
  url: "https://f1news.se/antonelli-far-vagledning-fran-wolff-och-bono",
  imagePath: "/img/news/xpb/news-xpbkimi3.jpg",
  imageSource: "XPB IMAGES",
  dateLabel: "May 29, 2026"
},

{
  slotId: "news10",
  sourceLabel: "Formula 1",
  title: "Which football team does each Formula 1 driver support?",
  summary: "Formula1.com takes a lighter look at the football teams followed by drivers on the F1 grid, including Lewis Hamilton and Oscar Piastri backing Arsenal and several French drivers supporting PSG.",
  kcsQuickShift: "A bit of a lighter story here, but it’s always fun seeing what the drivers are into away from the race track.",
  url: "https://www.formula1.com/en/latest/article/which-football-team-does-each-formula-1-driver-support.7hpW93YPgRMYmsSHEzw29L",
  imagePath: "/img/news/kcai/news-premier.jpg",
  imageSource: "Formula 1",
  dateLabel: "May 30, 2026"
}
];

export { newsSlots };