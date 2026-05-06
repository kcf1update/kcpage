const newsSlots = [
  {
  slotId: 1,
  sourceLabel: "PlanetF1",
  title: "Brundle says Miami eased F1’s early-season energy concerns",
  summary: "Martin Brundle believes Formula 1 made real progress with its 2026 energy-management issues in Miami after earlier races raised concerns about cars slowing too much on straights. Rule adjustments around deployment and power delivery appeared to make the cars look faster and more natural, while also reducing some of the awkward engine labouring that had frustrated drivers and fans.",
  kcsQuickShift: "Miami did not fix every 2026 concern, but it was a big step in the right direction. The cars looked more alive, and that matters after all the early criticism.",
  url: "https://www.planetf1.com/news/f1-energy-labouring-crisis-eased-miami-fixes-martin-brundle",
  imagePath: "/img/news/shut/news-shutterstockbrundle.jpg",
  photoCredit: "Shutterstock",
  dateLabel: "May 6, 2026"
},
{
  slotId: 2,
  sourceLabel: "PlanetF1",
  title: "Wolff says Miami thriller silenced F1’s early-season critics",
  summary: "Toto Wolff says anyone still complaining about Formula 1 after the Miami Grand Prix should probably stay quiet, with the race producing stronger action and putting Mercedes under real pressure for the first time in 2026. Mercedes still won with Kimi Antonelli, but McLaren outscored them across the weekend and Wolff admitted the competitive order had shifted after rival upgrades and energy-management tweaks.",
  kcsQuickShift: "Miami was the first real warning shot for Mercedes. They still won the Grand Prix, but McLaren made it clear this season may not be as comfortable as it looked early on.",
  url: "https://www.planetf1.com/news/toto-wolff-critics-hide-mercedes-pressure-miami",
  imagePath: "/img/news/xpb/news-xpbtoto.jpg",
  photoCredit: "XPB IMAGES",
  dateLabel: "May 6, 2026"
},
{
  slotId: 3,
  sourceLabel: "The Race",
  title: "Mercedes still searching for answers after repeated poor F1 starts",
  summary: "Mercedes has admitted its starts have become a serious weak point after Kimi Antonelli again lost ground from pole in Miami. The issue appears to be a mix of clutch execution, grip prediction, and preparation problems, with Toto Wolff calling the situation unacceptable as the team tries to stop giving away early track position.",
  kcsQuickShift: "Mercedes may still have race-winning pace, but poor starts are turning pole position into hard work. If they do not clean this up soon, they could start paying a much bigger price.",
  url: "https://www.the-race.com/formula-1/why-mercedes-keeps-making-unacceptable-poor-f1-starts/",
  imagePath: "/img/news/xpb/news-xpbrussellmiami.jpg",
  photoCredit: "XPB IMAGES",
  dateLabel: "May 5, 2026"
},
{
  slotId: 4,
  sourceLabel: "The Race",
  title: "Hamilton questions Ferrari simulator work after difficult Miami weekend",
  summary: "Lewis Hamilton says Ferrari’s simulator preparation may be pushing him in the wrong direction after a tough Miami Grand Prix weekend. He felt the car behaved differently at the track than it had in preparation, and he now plans to step back from simulator work before Canada to see if a different approach helps him find a better baseline.",
  kcsQuickShift: "Hamilton is not blaming one simple thing, but this is a pretty clear sign that Ferrari still has work to do around correlation. If the sim points him one way and the real car goes another, that is a problem.",
  url: "https://www.the-race.com/formula-1/no-simulator-hamiltons-bold-idea-to-fix-2026-mini-slump/",
  imagePath: "/img/news/xpb/news-xpblewis.jpg",
  photoCredit: "XPB IMAGES",
  dateLabel: "May 5, 2026"
},
{
  slotId: 5,
  sourceLabel: "RacingNews365.nl",
  title: "Verstappen-kritiek Sainz zorgt voor hilariteit: \"Neem me niet kwalijk\" EN: Sainz criticism of Verstappen sparks laughter: \"Excuse me\"",
  summary: "Carlos Sainz was critical of Max Verstappen after a bold Miami overtake, but former F1 driver Christian Danner found the reaction amusing. Danner said Verstappen’s aggressive style is simply part of who he is as a racer, even if some of the moves could have been cleaner. EN: Carlos Sainz criticized Max Verstappen after a bold Miami overtake, but former F1 driver Christian Danner found the reaction amusing. Danner said Verstappen’s aggressive style is simply part of who he is as a racer, even if some of the moves could have been cleaner.",
  kcsQuickShift: "Verstappen races the same way whether he is fighting for first or eighth, and that is exactly why people keep talking about him. NL: Verstappen racet hetzelfde, of hij nu voor de eerste of achtste plek vecht, en juist daarom blijft iedereen over hem praten.",
  url: "https://racingnews365.nl/verstappen-kritiek-sainz-zorgt-voor-hilariteit-neem-me-niet-kwalijk",
  imagePath: "/img/news/xpb/news-xpbcarlos.jpg",
  photoCredit: "XPB IMAGES",
  dateLabel: "May 6, 2026"
},
{
  slotId: 6,
  sourceLabel: "M4 Sport",
  title: "Ezért nem aggasztja Hadjar kiesést eredményező hibája a Red Bullt EN: Why Red Bull is not worried by Hadjar’s race-ending mistake",
  summary: "Isack Hadjar’s Miami Grand Prix ended early after he hit the wall at Turn 14, but Red Bull team principal Laurent Mekies said the team is not worried about his overall level. Mekies also accepted that Red Bull made the weekend harder for Hadjar after a car legality issue led to him being disqualified from qualifying and forced to start from the pit lane. EN: Isack Hadjar’s Miami Grand Prix ended early after he hit the wall at Turn 14, but Red Bull team principal Laurent Mekies said the team is not worried about his overall level. Mekies also accepted that Red Bull made the weekend harder for Hadjar after a car legality issue led to him being disqualified from qualifying and forced to start from the pit lane.",
  kcsQuickShift: "Red Bull is not panicking over Hadjar, and that is probably fair. One messy Miami weekend does not erase the pace he has already shown this season. HU: A Red Bull nem esik pánikba Hadjar miatt, és ez valószínűleg érthető. Egy zavaros miami hétvége nem törli el azt a tempót, amit már megmutatott ebben a szezonban.",
  url: "https://m4sport.hu/forma-1/f1-hirek/cikk/2026/05/06/ezert-nem-aggasztja-hadjar-kiesest-eredmenyezo-hibaja-a-red-bullt",
  imagePath: "/img/news/xpb/news-xpbisack.jpg",
  photoCredit: "XPB IMAGES",
  dateLabel: "May 6, 2026"
},
{
  slotId: 7,
  sourceLabel: "Crash.net",
  title: "Audi’s reliability problems are slowing its early F1 development push",
  summary: "Allan McNish says Audi’s early 2026 reliability problems are frustrating because they are limiting the team’s ability to develop other areas of the car. Miami brought more setbacks, with Gabriel Bortoleto disqualified from the Sprint race, Nico Hulkenberg unable to start on Saturday after a fire, and another drivetrain-related retirement on Sunday.",
  kcsQuickShift: "Audi needs clean weekends before it can properly judge its pace. Right now, reliability problems are taking away the track time it badly needs.",
  url: "https://www.crash.net/f1/news/1094510/1/allan-mcnish-frustrating-audi-problems-limiting-f1-development-chances",
  imagePath: "/img/news/xpb/news-xpbaudigabby.jpg",
  photoCredit: "XPB IMAGES",
  dateLabel: "May 6, 2026"
},
{
 slotId: 9,
  sourceLabel: "ESPN",
  title: "Antonelli’s Miami win raises the pressure on Russell",
  summary: "Kimi Antonelli’s third straight Grand Prix victory has sharpened the internal Mercedes story, with ESPN arguing that George Russell may now have met his match. Antonelli’s Miami win extended his championship lead over Russell to 20 points and added to the feeling that F1 may already have its next major star.",
  kcsQuickShift: "This is becoming a real Mercedes storyline. Russell is still strong, but Antonelli is starting to look like more than a fast rookie in a great car.",
  url: "https://www.espn.co.uk/f1/story/_/id/48670437/kimi-antonelli-george-russell-met-match-f1-new-superstar-miami-grand-prix-2026",
  imagePath: "/img/news/xpb/xpbimages1.jpg",
  photoCredit: "XPB IMAGES",
  dateLabel: "May 3, 2026"
},
{
  slotId: 10,
  sourceLabel: "The Race",
  title: "The Race breaks down 10 key lessons from the Miami Grand Prix",
  summary: "The Race’s Miami Grand Prix review points to a season that is already being shaped by upgrades, reliability problems, and the continuing debate over F1’s 2026 rules. Red Bull’s new package helped Max Verstappen look much more competitive, while McLaren and Ferrari also showed how aggressive the development race is becoming. The piece also highlights Audi’s reliability worries, Alpine’s midfield breakthrough, Ferrari’s race-pace questions, and why one exciting Miami race does not fully settle the concerns around the new regulations.",
  kcsQuickShift: "Miami gave us a great race, but The Race makes a good point. The 2026 rules looked better here, yet tougher circuits may still expose the same energy-management problems.",
  url: "https://www.the-race.com/formula-1/f1-2026-miami-grand-prix-10-things-we-learned/",
  imagePath: "/img/news/shut/news-shutterstockmiamipit.jpg",
  photoCredit: "Shutterstock",
  dateLabel: "May 5, 2026"
}
];

export { newsSlots };