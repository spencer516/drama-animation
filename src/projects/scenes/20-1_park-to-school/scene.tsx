import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, waitFor } from "@motion-canvas/core";
import { GRID_BLACK, GRID_BLUE, LED_BLUE } from "@/lib/design-system";
import makePark from "@/lib/scenes/park";

const TRANSITION_DURATION = 3;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fillAnimated, horizontalLines, verticalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  const { greenPositions, topPath, bottomPath, middlePath } = makePark(
    ledSystem,
    screen
  );

  yield* all(
    topPath().fill(GRID_BLACK, TRANSITION_DURATION),
    bottomPath().fill(GRID_BLACK, TRANSITION_DURATION),
    middlePath().fill(GRID_BLACK, TRANSITION_DURATION),
    fillAnimated(
      {
        ledColor: LED_BLUE,
        gridColor: GRID_BLUE,
      },
      TRANSITION_DURATION
    )
  );

  yield* waitFor(0.2);
});
