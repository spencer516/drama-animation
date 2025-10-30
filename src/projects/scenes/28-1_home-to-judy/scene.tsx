import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { waitFor } from "@motion-canvas/core";
import {
  GRID_BLUE,
  GRID_PURPLE,
  LED_BLUE,
  LED_PURPLE,
} from "@/lib/design-system";

const TRANSITION_DURATION = 10;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, fillAnimated } = createFilledGrid(ledSystem, screen);

  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  yield* fillAnimated(
    {
      ledColor: LED_PURPLE,
      gridColor: GRID_PURPLE,
    },
    TRANSITION_DURATION
  );

  yield* waitFor(0.2);
});
