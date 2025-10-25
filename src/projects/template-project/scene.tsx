import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { waitFor } from "@motion-canvas/core";
import { GRID_BLUE, LED_BLUE } from "@/lib/design-system";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, horizontalLines, verticalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  yield* waitFor(10);
});
