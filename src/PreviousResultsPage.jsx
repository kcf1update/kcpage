import RaceCentreLayout from "./RaceCentreLayout";

import {
  nextRaceContent as previousRaceCenterContent,
  raceWeekendRecap as previousRaceCenterRecap,
} from "./content/previousRaceCenterContent";

import { previousRaceCenterGalleryContent } from "./content/previousRaceCenterGalleryContent";

export default function PreviousResultsPage() {
  return (
    <RaceCentreLayout
      content={previousRaceCenterContent}
      recap={previousRaceCenterRecap}
      gallery={previousRaceCenterGalleryContent}
      showCountdown={false}
    />
  );
}