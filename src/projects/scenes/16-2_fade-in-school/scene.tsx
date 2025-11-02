import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { waitFor } from "@motion-canvas/core";
import { GRID_BLUE, LED_BLUE } from "@/lib/design-system";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fillAnimated, horizontalLines, verticalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  yield* fillAnimated(
    {
      ledColor: LED_BLUE,
      gridColor: GRID_BLUE,
    },
    3
  );

  yield* waitFor(0.3);
});
