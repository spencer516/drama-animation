import { Line, makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, createRefArray, waitFor } from "@motion-canvas/core";
import {
  GRID_BLUE,
  GRID_LINE_WIDTH,
  GRID_WHITE,
  LED_BLUE,
  LED_OFF,
  LED_ON,
  LED_RED,
} from "@/lib/design-system";
import { setupTrainStructure, TRAIN_HEIGHT } from "@/lib/scenes/train";
import {
  Coordinates,
  positionToCoordinates,
  rowToYCoordinate,
  sequenceRows,
} from "@/lib/wall-coordinate-system";

const TRANSITION_TIME = 1;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const addedHorizontalLines = createRefArray<Line>();

  const { verticalLines, rects } = setupTrainStructure(screen, ledSystem);

  ledSystem().fillAll(LED_ON);

  for (const line of verticalLines) {
    line.save();
    const [start, end] = line.points() as [Coordinates, Coordinates];
    const startCol = start[0];
    line.points([[startCol, rowToYCoordinate(0)], end]);
  }

  for (const rect of rects) {
    rect.opacity(0);
  }

  screen().add(
    sequenceRows()
      .filter((row) => row < TRAIN_HEIGHT)
      .map((row) => (
        <Line
          ref={addedHorizontalLines}
          points={[
            positionToCoordinates([0, row]),
            positionToCoordinates([15, row]),
          ]}
          lineWidth={GRID_LINE_WIDTH}
          stroke={GRID_WHITE}
          opacity={1}
        />
      ))
  );

  yield* all(
    ...sequenceRows()
      .filter((row) => row < TRAIN_HEIGHT)
      .map((row) => ledSystem().fillRow(row, LED_OFF, TRANSITION_TIME)),
    ...verticalLines.map((line) => line.restore(TRANSITION_TIME)),
    ...rects.map((rect) => rect.opacity(1, TRANSITION_TIME)),
    ...addedHorizontalLines.map((line) => line.opacity(0, TRANSITION_TIME))
  );

  yield* waitFor(0.2);
});
