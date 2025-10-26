import { Line, makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { createRef, waitFor } from "@motion-canvas/core";
import {
  GRID_BLUE,
  GRID_GREEN,
  LED_BLUE,
  LED_GREEN,
} from "@/lib/design-system";
import { positionToCoordinates } from "@/lib/wall-coordinate-system";
import makePolice from "@/lib/scenes/police";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const {} = makePolice(ledSystem, screen);

  // TODO: Add transition to school

  yield* waitFor(10);
});
