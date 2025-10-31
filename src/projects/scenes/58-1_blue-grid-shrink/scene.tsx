import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, sequence, waitFor } from "@motion-canvas/core";
import { GRID_BLUE, LED_BLUE, LED_OFF } from "@/lib/design-system";
import {
  ColumnPosition,
  positionsToDistance,
  sequenceColumns,
} from "@/lib/wall-coordinate-system";

const TRANSITION_DURATION = 0.8;
const MAX_COLUMN = 8;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, horizontalLines, verticalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  const verticalOffset = positionsToDistance([
    [0, 0],
    [0, 1],
  ]);

  const horizOffset = positionsToDistance([
    [0, 0],
    [MAX_COLUMN, 0],
  ]);

  yield* all(
    ...verticalLines.map((line) =>
      line.startOffset(verticalOffset, TRANSITION_DURATION)
    ),
    ...horizontalLines.map((line) =>
      line.endOffset(horizOffset, TRANSITION_DURATION)
    ),
    horizontalLines[0].opacity(0, TRANSITION_DURATION),
    sequence(
      TRANSITION_DURATION * 0.1,
      ...verticalLines
        .slice(MAX_COLUMN)
        .reverse()
        .map((line) => line.opacity(0, TRANSITION_DURATION * 0.4))
    ),
    sequence(
      TRANSITION_DURATION * 0.1,
      ...sequenceColumns()
        .filter((c) => c >= MAX_COLUMN)
        .map((column) =>
          ledSystem().fillColumn(
            column as ColumnPosition,
            LED_OFF,
            TRANSITION_DURATION * 0.4
          )
        )
    ),
    ledSystem().fillRow(0, LED_OFF, TRANSITION_DURATION * 0.8)
  );

  yield* waitFor(0.2);
});
