import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, sequence, waitFor } from "@motion-canvas/core";
import {
  GRID_BLUE,
  GRID_PURPLE,
  LED_BLUE,
  LED_OFF,
  LED_PURPLE,
} from "@/lib/design-system";
import { positionsToDistance } from "@/lib/wall-coordinate-system";

const TRANSITION_TIME = 0.6;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, verticalLines, horizontalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  const offset = positionsToDistance([
    [0, 0],
    [0, 2],
  ]);

  yield* all(
    ...verticalLines.map((line) => line.startOffset(offset, TRANSITION_TIME)),
    sequence(
      TRANSITION_TIME * 0.2,
      ...horizontalLines
        .slice(0, 2)
        .map((line) => line.opacity(0, TRANSITION_TIME))
    ),
    sequence(
      TRANSITION_TIME * 0.2,
      ledSystem().fillRow(0, LED_OFF, TRANSITION_TIME),
      ledSystem().fillRow(1, LED_OFF, TRANSITION_TIME)
    ),
    ...[...verticalLines, ...horizontalLines].map((line) =>
      line.stroke(GRID_PURPLE, TRANSITION_TIME)
    ),
    ledSystem().fillRow(2, LED_PURPLE, TRANSITION_TIME),
    ledSystem().fillRow(3, LED_PURPLE, TRANSITION_TIME),
    ledSystem().fillRow(4, LED_PURPLE, TRANSITION_TIME),
    ledSystem().fillRow(5, LED_PURPLE, TRANSITION_TIME)
  );

  yield* waitFor(0.2);
});
