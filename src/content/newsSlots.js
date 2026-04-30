const newsSlots = [
  {
    slotId: 1,
    sourceLabel: "RacingNews365",
    title: "FIA adds more wet-weather limits to F1’s 2026 rules",
    summary:
      "The FIA has added another safety-focused regulation change for wet-weather racing, with boost mode now blocked in low-grip rainy conditions. The change is aimed at stopping sudden power spikes when drivers are already dealing with reduced traction, while active aero use will also be limited in designated wet zones.",
    kcsQuickShift:
      "This is a sensible safety move because extra power in heavy rain is exactly where things can get messy fast.",
    url: "https://racingnews365.com/fia-announces-new-changes-to-f1-regulations",
    imagePath: "/img/news/kcai/news-FIA.jpg",
    photoCredit: "KC AI",
    dateLabel: "April 30, 2026",
  },
  {
    slotId: 2,
    sourceLabel: "ESPN",
    title: "Russell expects to meet Mercedes contract targets",
    summary:
      "George Russell says he expects to hit the performance targets needed to stay with Mercedes beyond 2026, even with Max Verstappen still being linked to the team. Russell’s comments keep the focus on Mercedes’ future driver plans while also making clear that he believes his own results should speak for themselves.",
    kcsQuickShift:
      "Russell is basically saying the Verstappen rumours are there, but his own numbers should keep him firmly in the Mercedes picture.",
    url: "https://www.espn.co.uk/f1/story/_/id/48615896/george-russell-expects-hit-contract-metrics-stay-mercedes-f1-max-verstappen-2027",
    imagePath: "/img/news/xpb/news-xpbgeorge.jpg",
    photoCredit: "XPB IMAGES",
    dateLabel: "April 30, 2026",
  },
  {
    slotId: 3,
    sourceLabel: "The Race",
    title: "Ferrari sees signs Hamilton has unlocked more in 2026",
    summary:
      "Ferrari believes Lewis Hamilton is getting more out of the team and the car this season after a difficult first year together. The team sees his deeper involvement, stronger integration and improved comfort with the project as reasons why he is now closer to delivering the kind of performances Ferrari expected.",
    kcsQuickShift:
      "This feels like Ferrari saying Hamilton is finally part of the machine instead of trying to learn it from the outside.",
    url: "https://www.the-race.com/formula-1/what-ferrari-thinks-hamilton-has-unlocked-f1-2026/",
    imagePath: "/img/news/ferrari/news-ferrari6.jpg",
    photoCredit: "Courtesy of Ferrari F1",
    dateLabel: "April 30, 2026",
  },
  {
    slotId: 4,
    sourceLabel: "The Race",
    title: "F1 considers extra 2026 engine help for Honda",
    summary:
      "F1 is weighing whether Honda should receive extra help under the 2026 engine development rules after Aston Martin’s power unit package began the season with performance and reliability problems. The discussion appears to centre on whether the current concession system gives struggling manufacturers enough room to recover without distorting competition.",
    kcsQuickShift:
      "This is exactly the kind of 2026 rules story that matters because one weak power unit can drag a whole team project down.",
    url: "https://www.the-race.com/formula-1/f1-considering-engine-rule-tweak-honda-extra-help/",
    imagePath: "/img/news/xpb/news-xpbneweystroll.jpg",
    photoCredit: "XPB IMAGES",
    dateLabel: "April 29, 2026",
  },
  {
    slotId: 5,
    sourceLabel: "FormulaPassion",
    title:
      'Hadjar e la firma per il Red Bull Junior Team: "Non riuscivo a crederci" EN: Hadjar remembers signing with the Red Bull Junior Team',
    summary:
      "Isack Hadjar ha ricordato quanto fosse importante per lui entrare nel Red Bull Junior Team, soprattutto in un momento in cui il suo futuro non era ancora chiaro e trovare il budget per continuare a correre era complicato. EN: Isack Hadjar looked back on how important it felt to join the Red Bull Junior Team, especially at a time when his racing future was unclear and funding the next step was not easy.",
    kcsQuickShift:
      "Hadjar’s story is a good reminder that even future F1 drivers can be one phone call away from a completely different path. IT: La storia di Hadjar ricorda che anche i futuri piloti di F1 possono dipendere da una sola occasione.",
    url: "https://formulapassion-pro.ey.r.appspot.com/f1/f1-news/hadjar-ricordo-ingresso-red-bull-junior-team-non-riuscivo-a-crederci",
    imagePath: "/img/news/xpb/news-xpbisack.jpg",
    photoCredit: "XPB IMAGES",
    dateLabel: "April 30, 2026",
  },
  {
    slotId: 6,
    sourceLabel: "Formula 1",
    title: "Racing Bulls reveal bright yellow Miami GP livery",
    summary:
      "Racing Bulls have revealed a bold yellow special livery for the Miami Grand Prix weekend, inspired by Red Bull’s Summer Edition Sudachi Lime theme. The look carries across the car and team kit, giving the team another standout visual identity for one of F1’s most style-driven race weekends.",
    kcsQuickShift:
      "Miami is the right place for a loud livery and Racing Bulls definitely did not play this one safe.",
    url: "https://www.formula1.com/en/latest/article/gallery-racing-bulls-reveal-vibrant-yellow-livery-for-miami-grand-prix-weekend.3qkktjcjeVnMY6j9hZLPYR",
    imagePath: "/img/news/kcai/news-yellowrb.jpg",
    photoCredit: "Formula 1",
    dateLabel: "April 30, 2026",
  },
  {
    slotId: 7,
    sourceLabel: "Motorsport.com",
    title: "Mekies says Red Bull’s 2025 comeback hurt its 2026 start",
    summary:
      "Laurent Mekies says Red Bull’s late push to recover performance in 2025 came with a cost, leaving the team with a weaker starting point for its 2026 car. Red Bull still believes the decision was worth it, but the comments explain why the team may now be playing catch-up at the start of the new rules cycle.",
    kcsQuickShift:
      "Red Bull made the call to fight last year and now they are dealing with the bill that came with it.",
    url: "https://www.motorsport.com/f1/news/laurent-mekies-admits-2025-comeback-hurt-red-bulls-2026-f1-start/10816547/",
    imagePath: "/img/news/shut/news-miekes.jpg",
    photoCredit: "Shutterstock",
    dateLabel: "April 30, 2026",
  },
  {
    slotId: 8,
    sourceLabel: "RacingNews365.nl",
    title:
      "Auto Verstappen op dieet voor GP Miami EN: Verstappen’s car goes on a diet for the Miami GP",
    summary:
      "Red Bull wil in Miami verbetering laten zien met de RB22, nadat de auto aan het begin van 2026 te zwaar en niet competitief genoeg bleek. RacingNews365 meldt dat de auto eerder ongeveer 9 tot 10 kilo te zwaar was en dat Red Bull lichtere onderdelen en updates voorbereidt om tijd te winnen en het energiemanagement te verbeteren. EN: Red Bull wants to show progress with the RB22 in Miami after starting 2026 with a car that was too heavy and not competitive enough. RacingNews365 reports that the car had been around 9 to 10 kilograms overweight, with lighter parts and updates expected to help lap time and energy management.",
    kcsQuickShift:
      "A lighter Red Bull will not fix everything overnight, but every kilo matters when the field is this tight. NL: Een lichtere Red Bull lost niet alles meteen op, maar elk kilo telt in zo’n spannend veld.",
    url: "https://racingnews365.nl/auto-verstappen-op-dieet-voor-gp-miami",
    imagePath: "/img/news/xpb/news-xpbisack.jpg",
    photoCredit: "XPB IMAGES",
    dateLabel: "April 30, 2026",
  },
  {
    slotId: 9,
    sourceLabel: "RacingNews365",
    title: "Bottas opens up about personal struggles in F1",
    summary:
      "Valtteri Bottas has spoken about difficult moments from his early F1 career, including weight pressure, burnout and the role mental health support played in helping him recover. It is a more personal story that shows the human cost behind the performance demands drivers face at the top level.",
    kcsQuickShift:
      "This is an important reminder that drivers can look calm on the outside while carrying a lot more than people realize.",
    url: "https://racingnews365.com/valtteri-bottas-opens-up-over-personal-struggles-its-not-a-problem-until-its-a-problem",
    imagePath: "/img/news/shut/news-shutterstockbottas.jpg",
    photoCredit: "Shutterstock",
    dateLabel: "April 30, 2026",
  },
  {
    slotId: 10,
    sourceLabel: "Crash.net",
    title: "Wolff expects closer Miami battles after F1 rule evolution",
    summary:
      "Toto Wolff believes the Miami Grand Prix could produce closer racing after F1’s latest regulatory changes. With the updated procedures and technical tweaks now being tested in a real race weekend setting, Miami should give teams and fans a clearer idea of whether the changes actually improve the on-track product.",
    kcsQuickShift:
      "Miami should give us a better read on whether these rule tweaks are really helping the racing or just adding another talking point.",
    url: "https://www.crash.net/f1/news/1093741/1/wolff-predicts-closer-f1-battles-miami-gp-after-regulatory-evolution",
    imagePath: "/img/news/xpb/news-xpbwolffbrown.jpg",
    photoCredit: "XPB IMAGES",
    dateLabel: "April 30, 2026",
  },
];

export { newsSlots };