import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { waitFor } from "@motion-canvas/core";
import { GRID_PURPLE, LED_PURPLE } from "@/lib/design-system";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fillAnimated } = createFilledGrid(ledSystem, screen);

  yield* fillAnimated(
    {
      ledColor: LED_PURPLE,
      gridColor: GRID_PURPLE,
    },
    3
  );

  yield* waitFor(0.2);
});
