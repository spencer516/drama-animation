import { Line, makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { all, createRefArray, sequence, waitFor } from "@motion-canvas/core";
import { setupTrainStructure, TRAIN_HEIGHT } from "@/lib/scenes/train";
import {
  Coordinates,
  positionToCoordinates,
  rowToYCoordinate,
  sequenceRows,
} from "@/lib/wall-coordinate-system";
import {
  GRID_LINE_WIDTH,
  GRID_WHITE,
  LED_ON,
  LED_RED,
} from "@/lib/design-system";

const TRANSITION_TIME = 1;

export default makeScene2D(function* (view) {
  const { screen, ledSystem } = setupLEDScene(view);
  const addedHorizontalLines = createRefArray<Line>();

  const { verticalLines, rects } = setupTrainStructure(screen, ledSystem);

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
          opacity={0}
        />
      ))
  );

  yield* all(
    ...rects.map((rect) => rect.opacity(0, TRANSITION_TIME)),
    sequence(
      TRANSITION_TIME * 0.3,
      ...addedHorizontalLines
        .reverse()
        .map((line) => line.opacity(1, TRANSITION_TIME))
    ),
    ...verticalLines.map((line) => {
      const [start, end] = line.points() as [Coordinates, Coordinates];
      const startCol = start[0];
      return line.points(
        [[startCol, rowToYCoordinate(0)], end],
        TRANSITION_TIME
      );
    }),
    sequence(
      TRANSITION_TIME * 0.15,
      ...sequenceRows()
        .filter((row) => row < TRAIN_HEIGHT)
        .reverse()
        .map((row) => ledSystem().fillRow(row, LED_ON, TRANSITION_TIME * 0.7))
    )
  );

  yield* waitFor(2);
});
