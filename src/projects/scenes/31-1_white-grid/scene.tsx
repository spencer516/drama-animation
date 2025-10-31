import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, waitFor } from "@motion-canvas/core";
import { GRID_BLACK, GRID_WHITE, LED_OFF, LED_ON } from "@/lib/design-system";

const TRANSITION_TIME = 1;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, fillAnimated, horizontalLines, verticalLines } =
    createFilledGrid(ledSystem, screen);

  fill({
    ledColor: LED_OFF,
    gridColor: GRID_BLACK,
  });

  yield* all(
    fillAnimated(
      {
        ledColor: LED_ON,
        gridColor: GRID_WHITE,
      },
      TRANSITION_TIME
    )
  );

  yield* waitFor(0.2);
});
