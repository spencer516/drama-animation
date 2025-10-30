import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { all, waitFor } from "@motion-canvas/core";
import {
  GRID_BLUE,
  GRID_GREEN,
  LED_BLUE,
  LED_GREEN,
  LED_YELLOW,
} from "@/lib/design-system";
import makePark from "@/lib/scenes/park";
import { STREET_LIGHT_POSITIONS } from "@/lib/scenes/street";

const TRANSITION_DURATION = 3;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  for (const position of STREET_LIGHT_POSITIONS) {
    ledSystem().fillAt(position, LED_YELLOW);
  }

  const { greenPositions, bluePositions, topPath, bottomPath, middlePath } =
    makePark(ledSystem, screen, false);

  yield* all(
    ...greenPositions.map((position) =>
      ledSystem().fillAt(position, LED_GREEN, TRANSITION_DURATION)
    ),
    ...bluePositions.map((position) =>
      ledSystem().fillAt(position, LED_BLUE, TRANSITION_DURATION)
    ),
    topPath().fill(GRID_GREEN, TRANSITION_DURATION),
    bottomPath().fill(GRID_GREEN, TRANSITION_DURATION),
    middlePath().fill(GRID_BLUE, TRANSITION_DURATION)
  );

  yield* waitFor(0.1);
});
