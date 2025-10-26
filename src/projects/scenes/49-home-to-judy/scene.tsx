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
import makePark from "@/lib/scenes/park";
import makeJudyHome from "@/lib/scenes/judyHome";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const {} = makeJudyHome(ledSystem, screen);

  // TODO: Add transition to home

  yield* waitFor(10);
});
