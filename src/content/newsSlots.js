const newsSlots = [
{
  slotId: "news1",
  sourceLabel: "Crash.net",
  title: "Toto Wolff Admits Monaco Podium Felt Uneasy Amid Antonelli Success",
  summary: "Mercedes team principal Toto Wolff admitted he felt conflicted celebrating on the Monaco Grand Prix podium with Kimi Antonelli after the young Italian secured his fifth consecutive victory. While Antonelli continued his remarkable championship charge with a dominant win from pole position, Wolff revealed it was difficult to fully enjoy the moment knowing George Russell had endured another difficult weekend and failed to score points. The contrasting fortunes have widened the gap between the Mercedes teammates and highlighted Antonelli’s growing status as the team’s clear title contender.",
  kcsQuickShift: "Antonelli keeps winning, but Wolff says Monaco was a reminder that Mercedes is still managing two very different championship stories.",
  url: "https://www.crash.net/f1/news/1097590/1/what-made-mercedes-boss-toto-wolff-uneasy-about-joining-kimi-antonelli-f1-monaco",
  imagePath: "/img/news/xpb/Mercedes/news-xpbtoto.jpg",
  dateLabel: "XPB IMAGES"
},
{
  slotId: "news2",
  sourceLabel: "Crash.net",
  title: "Brundle Says Monaco Penalty Fest Went Too Far",
  summary: "Martin Brundle has questioned the scale of the penalty-heavy Monaco Grand Prix, arguing that the race became too dominated by steward decisions. The chaotic weekend produced a long list of penalties and investigations, leaving Brundle concerned that the sport risks turning close racing into a constant rules debate instead of letting the action breathe.",
  kcsQuickShift: "Monaco was already chaotic enough, but Brundle clearly thinks the penalty list started to take over the race.",
  url: "https://www.crash.net/f1/news/1097591/1/martin-brundle-reveals-stance-brutal-f1-penalty-fest-monaco-gp",
  imagePath: "/img/news/xpb/news-xpbnicomartin.jpg",
  dateLabel: "XPB IMAGES"
},
{
  slotId: "news3",
  sourceLabel: "ESPN",
  title: "Mercedes and Ferrari Set for ADUO Engine Upgrade Help",
  summary: "Mercedes and Ferrari are both set to receive additional engine development opportunities under F1’s ADUO system after Red Bull Ford Powertrains was judged to have the leading combustion engine. Mercedes is expected to receive one upgrade token for being more than 2% behind, while Ferrari is expected to receive two because its deficit is understood to be over 4%, giving both teams a chance to close the power-unit gap during the season.",
  kcsQuickShift: "Red Bull having the best-rated engine while Mercedes and Ferrari get upgrade help is exactly the kind of F1 rule twist that keeps the paddock talking.",
  url: "https://www.espn.co.uk/f1/story/_/id/48965040/monaco-grand-prix-formula-1-mercedes-ferrari-receive-aduo-red-bull-best-engine-sources",
  imagePath: "/img/news/xpb/Races/news-xpbmiami.jpg",
  dateLabel: "XPB IMAGES"
},
{
  slotId: "news4",
  sourceLabel: "RacingNews365",
  title: "ADUO Engine Ruling Sparks Bigger F1 Power Unit Debate",
  summary: "The FIA’s ADUO decision is creating fresh controversy because the system focuses on internal combustion engine performance, not the full hybrid power unit package. That matters because battery deployment, energy recovery and electrical output are major parts of the 2026 rules, meaning teams could argue the ruling does not show the complete competitive picture.",
  kcsQuickShift: "This ADUO ruling could become a major political fight because in modern F1, engine performance is about much more than just the combustion engine.",
  url: "https://racingnews365.com/controversial-aduo-ruling-could-have-far-reaching-consequences",
  imagePath: "/img/news/kcai/newsaduo.jpg",
  dateLabel: "Jun 10, 2026"
},
{
  slotId: "news5",
  sourceLabel: "PlanetF1",
  title: "Russell Turns Pressure Back on Antonelli in Title Fight",
  summary: "George Russell has suggested the 2026 title fight is now Kimi Antonelli’s to lose, a claim that adds another layer to the growing Mercedes teammate battle. Antonelli’s run of victories has put him firmly in control of the championship, while Russell is trying to keep pressure on the young Italian and avoid letting the points gap define the rest of his season.",
  kcsQuickShift: "Russell may be playing it calm, but calling it Antonelli’s title to lose sounds like a little pressure being sent across the Mercedes garage.",
  url: "https://www.planetf1.com/news/george-russell-mind-games-kimi-antonelli-title-pressure-claim",
  imagePath: "/img/news/xpb/Mercedes/xpbimages1.jpg",
  dateLabel: "Jun 10, 2026"
},
{
  slotId: "news6",
  sourceLabel: "Formula1.com",
  title: "Albon Set to Make Williams History in Barcelona",
  summary: "Alex Albon is set to become the driver with the most race starts in Williams history at the upcoming Barcelona-Catalunya Grand Prix, moving past Nigel Mansell’s record of 95. On Beyond The Grid, Albon reflects on his Williams journey since joining the team in 2022, the team’s difficult start to F1’s new era, and how Williams has had to reset its targets around podiums, wins and championships.",
  kcsQuickShift: "Albon passing Mansell on the Williams starts list is a big milestone, especially with how much he has helped carry that team forward.",
  url: "https://www.formula1.com/en/latest/article/beyond-the-grid-albon-on-his-williams-journey-and-being-on-the-cusp-of-history.7Lp8Xr04nR40xJn2MChV87",
  imagePath: "/img/news/xpb/Williams/xpbwilliams.jpg",
  dateLabel: "XPB IMAGES"
},
{
  slotId: "news7",
  sourceLabel: "Marca",
  title: "Leclerc Warns Ferrari After Dangerous Brake Failure",
  summary: "Charles Leclerc has made clear that Ferrari must urgently solve its braking problems after his heavy Monaco crash, saying the car was in a dangerous situation with only one brake working properly. The issue has raised fresh pressure on Ferrari ahead of Barcelona, with Leclerc expected to move away from Brembo and switch to Carbon Industries brakes, the same supplier already used by Lewis Hamilton.",
  kcsQuickShift: "When Leclerc is talking about a dangerous brake limit, that is not just frustration — that is a serious Ferrari reliability warning.",
  url: "https://www.marca.com/motor/formula1/gp-barcelona-catalunya/2026/06/10/leclerc-destapa-problemon-ferrari-limite-peligroso.html",
  imagePath: "/img/news/Ferrari/Leclerc/ferraricharlesmonaco.jpg",
  dateLabel: "Courtesy of Ferrari F1"
},
{
  slotId: "news8",
  sourceLabel: "Infobae",
  title: "La estrategia de Alpine para revertir las sanciones a Colapinto y Gasly en Mónaco / Alpine Pushes to Overturn Monaco Penalties for Colapinto and Gasly",
  summary: "Alpine presentó un pedido de revisión ante la FIA por las sanciones de velocidad en boxes que afectaron a Pierre Gasly y Franco Colapinto en Mónaco. El equipo sostiene que sus pilotos no superaron realmente el límite de 60 km/h y apunta al criterio usado por la FIA para medir la velocidad, después de que Gasly recibiera dos sanciones de cinco segundos y Colapinto una de cinco segundos. / Alpine has filed a right-of-review request with the FIA over the Monaco pit-lane speeding penalties given to Pierre Gasly and Franco Colapinto. The team argues its drivers did not truly exceed the 60 km/h limit and is challenging the FIA’s measuring method, after Gasly received two five-second penalties and Colapinto one five-second penalty.",
  kcsQuickShift: "Alpine may not get the Monaco result changed, but this challenge could still force a bigger look at how pit-lane speed is measured. / Puede que Alpine no consiga cambiar el resultado de Mónaco, pero este reclamo podría abrir una discusión más grande sobre cómo se mide la velocidad en boxes.",
  url: "https://www.infobae.com/deportes/2026/06/09/la-estrategia-de-alpine-para-revertir-las-sanciones-a-colapinto-y-gasly-en-monaco-el-video-revelador/",
  imagePath: "/img/news/Alpine/colapinto/monacocolapinto.jpg",
  dateLabel: "Courtesy of Alpine F1"
},
{
  slotId: "news9",
  sourceLabel: "The Race",
  title: "Russell’s Driving Style Under Scrutiny as Antonelli Pulls Clear",
  summary: "George Russell’s 2026 struggles are being linked to how his driving style interacts with the lower-downforce cars and the current Pirelli tyres. The Race argues that Russell’s smooth, high-commitment cornering style can overload the rear tyres when the fronts are not in the right window, while Kimi Antonelli’s more aggressive but precise approach appears better suited to managing small slides and keeping the tyres alive.",
  kcsQuickShift: "This is not just about Russell being slower — it sounds like the 2026 car is asking for a style that Antonelli is handling better right now.",
  url: "https://www.the-race.com/formula-1/george-russell-driving-style-f1-2026-struggles-kimi-antonelli/",
  imagePath: "/img/news/xpb/Mercedes/news-xpbgeorge.jpg",
  dateLabel: "XPB IMAGES"
},
{
  slotId: "news10",
  sourceLabel: "ESPN",
  title: "Hamilton Says Ferrari Move Has Made Him Happier",
  summary: "Lewis Hamilton says he is happier this season after moving to Ferrari and feels he still has to remind people what he can do. After showing strong pace for Ferrari in Monaco practice, Hamilton made clear that the motivation is still there as he continues chasing his first Grand Prix win in red.",
  kcsQuickShift: "Hamilton sounds happier at Ferrari, but there is still that edge — he clearly wants to remind everyone he is not finished yet.",
  url: "https://www.espn.co.uk/f1/story/_/id/48965030/monaco-grand-prix-formula-1-lewis-hamilton-happier-year-ferrari-remind-people-am",
  imagePath: "/img/news/Ferrari/Lewis/monacolewis.jpg",
  dateLabel: "Courtesy of Ferrari F1"
}

];

export { newsSlots };