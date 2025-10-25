import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { Color, sequence, waitFor } from "@motion-canvas/core";
import { sequenceRows } from "@/lib/wall-coordinate-system";
import { GRID_BLUE, LED_BLUE } from "@/lib/design-system";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill } = createFilledGrid(ledSystem, screen);

  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  yield* waitFor(10);
});
