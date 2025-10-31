import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, sequence, waitFor } from "@motion-canvas/core";
import {
  GRID_BLUE,
  GRID_PURPLE,
  LED_OFF,
  LED_PURPLE,
} from "@/lib/design-system";
import { positionsToDistance } from "@/lib/wall-coordinate-system";

const TRANSITION_TIME = 1.2;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, verticalLines, horizontalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  fill({
    ledColor: LED_PURPLE,
    gridColor: GRID_PURPLE,
  });

  const rowsToFade = horizontalLines.slice(0, 2);

  // Setup the judy "compressed" purple look
  const verticalOffset = positionsToDistance([
    [0, 0],
    [0, 2],
  ]);

  ledSystem().fillRow(0, LED_OFF);
  ledSystem().fillRow(1, LED_OFF);

  rowsToFade.map((row) => row.opacity(0));
  verticalLines.map((line) => line.startOffset(verticalOffset));

  yield* all(
    ...verticalLines.map((line) => line.startOffset(0, TRANSITION_TIME)),
    ...[...verticalLines, ...horizontalLines].map((line) =>
      line.stroke(GRID_BLUE, TRANSITION_TIME)
    ),
    sequence(
      TRANSITION_TIME * 0.2,
      ...rowsToFade.reverse().map((row) => row.opacity(1, TRANSITION_TIME))
    ),
    ledSystem().fillAll(GRID_BLUE, TRANSITION_TIME)
  );

  yield* waitFor(0.2);
});
