import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { waitFor } from "@motion-canvas/core";
import { GRID_BLUE, GRID_WHITE, LED_BLUE, LED_ON } from "@/lib/design-system";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, fillAnimated } = createFilledGrid(ledSystem, screen);

  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  yield* fillAnimated(
    {
      ledColor: LED_ON,
      gridColor: GRID_WHITE,
    },
    1
  );

  yield* waitFor(0.2);
});
