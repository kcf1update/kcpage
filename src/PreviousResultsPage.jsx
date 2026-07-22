import RaceCentreLayout from "./RaceCentreLayout";

import {
  nextRaceContent as previousRaceCenterContent,
  raceWeekendRecap as previousRaceCenterRecap,
} from "./content/previousRaceCenterContent";

export default function PreviousResultsPage() {
  return (
   <RaceCentreLayout
  content={previousRaceCenterContent}
  recap={previousRaceCenterRecap}
  showCountdown={false}
  showPreviousResultsButton={false}
/>
  );
}