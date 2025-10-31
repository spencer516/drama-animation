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

  // Make the "shrunken" grid
  const verticalOffset = positionsToDistance([
    [0, 0],
    [0, 1],
  ]);

  const horizOffset = positionsToDistance([
    [0, 0],
    [8, 0],
  ]);

  verticalLines.map((line) => line.startOffset(verticalOffset));
  horizontalLines.map((line) => line.endOffset(horizOffset));

  const topLine = horizontalLines[0];
  const fadedLines = verticalLines.slice(8);
  const fadedColumns = sequenceColumns().filter((c) => c >= MAX_COLUMN);

  topLine.opacity(0);
  fadedLines.map((line) => line.opacity(0));
  fadedColumns.map((column) => ledSystem().fillColumn(column, LED_OFF));
  ledSystem().fillRow(0, LED_OFF);

  yield* all(
    ...verticalLines.map((line) => line.startOffset(0, TRANSITION_DURATION)),
    ...horizontalLines.map((line) => line.endOffset(0, TRANSITION_DURATION)),
    topLine.opacity(1, TRANSITION_DURATION),
    sequence(
      TRANSITION_DURATION * 0.1,
      ...fadedLines.map((line) => line.opacity(1, TRANSITION_DURATION * 0.4))
    ),
    sequence(
      TRANSITION_DURATION * 0.1,
      ...fadedColumns.map((column) =>
        ledSystem().fillColumn(
          column as ColumnPosition,
          LED_BLUE,
          TRANSITION_DURATION * 0.4
        )
      )
    ),
    ledSystem().fillRow(0, LED_BLUE, TRANSITION_DURATION * 0.8)
  );

  yield* waitFor(0.2);
});
