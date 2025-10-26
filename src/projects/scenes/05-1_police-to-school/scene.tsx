import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, waitFor } from "@motion-canvas/core";
import makePolice, {
  getPoliceLightPositions,
  POLICE_HEIGHT,
  setupPoliceStructure,
} from "@/lib/scenes/police";
import {
  GRID_BLACK,
  GRID_BLUE,
  GRID_YELLOW,
  LED_BLUE,
  LED_YELLOW,
} from "@/lib/design-system";
import { positionsToDistance } from "@/lib/wall-coordinate-system";

const TRANSITION_TIME = 1.3;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { verticalLines, horizontalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  const verticalDistanceOffset = positionsToDistance([
    [0, 0],
    [0, POLICE_HEIGHT],
  ]);

  const initialPoliceLines = horizontalLines.slice(POLICE_HEIGHT);

  initialPoliceLines.map((line) => line.stroke(GRID_YELLOW));

  verticalLines.map((line) =>
    line.startOffset(verticalDistanceOffset).stroke(GRID_YELLOW)
  );

  const policeLightPositions = getPoliceLightPositions();
  const { rects } = setupPoliceStructure(screen, GRID_BLACK);

  policeLightPositions.map((position) =>
    ledSystem().fillAt(position, LED_YELLOW)
  );

  rects.map((rect) => rect.fill(GRID_YELLOW));

  yield* all(
    ...rects.map((rect) => rect.fill(GRID_BLACK, TRANSITION_TIME)),
    ...verticalLines.map((line) =>
      all(
        line.startOffset(0, TRANSITION_TIME),
        line.stroke(LED_BLUE, TRANSITION_TIME)
      )
    ),
    ...horizontalLines.map((line) => line.stroke(GRID_BLUE, TRANSITION_TIME)),
    ledSystem().fillAll(LED_BLUE, TRANSITION_TIME)
  );

  yield* waitFor(0.1);
});
