import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, waitFor } from "@motion-canvas/core";
import {
  GRID_BLACK,
  GRID_WHITE,
  LED_OFF,
  LED_ON,
  LED_YELLOW,
} from "@/lib/design-system";
import { getStreetLightPartitions } from "@/lib/transitions/school-to-street";

const TRANSITION_TIME = 1;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, fillAnimated, horizontalLines, verticalLines } =
    createFilledGrid(ledSystem, screen);

  const { streetLights, otherLights } = getStreetLightPartitions();

  fill({
    ledColor: LED_ON,
    gridColor: GRID_WHITE,
  });

  yield* all(
    ...otherLights.map((position) =>
      ledSystem().fillAt(position, LED_OFF, TRANSITION_TIME)
    ),
    ...streetLights.map((position) =>
      ledSystem().fillAt(position, LED_YELLOW, TRANSITION_TIME)
    ),
    ...horizontalLines.map((line) => line.stroke(GRID_BLACK, TRANSITION_TIME)),
    ...verticalLines.map((line) => line.stroke(GRID_BLACK, TRANSITION_TIME))
  );

  yield* waitFor(0.2);
});
