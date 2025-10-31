import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { waitFor } from "@motion-canvas/core";
import {
  GRID_PURPLE,
  GRID_WHITE,
  LED_ON,
  LED_PURPLE,
} from "@/lib/design-system";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fillAnimated, fill } = createFilledGrid(ledSystem, screen);

  fill({
    ledColor: LED_ON,
    gridColor: GRID_WHITE,
  });

  yield* fillAnimated(
    {
      ledColor: LED_PURPLE,
      gridColor: GRID_PURPLE,
    },
    3
  );

  yield* waitFor(0.2);
});
