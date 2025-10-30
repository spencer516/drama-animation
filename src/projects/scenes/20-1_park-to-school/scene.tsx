import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { all, waitFor } from "@motion-canvas/core";
import { GRID_BLUE, LED_BLUE } from "@/lib/design-system";
import makePark from "@/lib/scenes/park";

const TRANSITION_DURATION = 3;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { greenPositions, topPath, bottomPath } = makePark(ledSystem, screen);

  yield* all(
    ...greenPositions.map((position) =>
      ledSystem().fillAt(position, LED_BLUE, TRANSITION_DURATION)
    ),
    topPath().fill(GRID_BLUE, TRANSITION_DURATION),
    bottomPath().fill(GRID_BLUE, TRANSITION_DURATION)
  );

  yield* waitFor(0.1);
});
