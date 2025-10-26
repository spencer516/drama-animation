import { createRefArray, Reference, ReferenceArray } from "@motion-canvas/core";
import { LEDSystem } from "../LEDSystem";
import { Line, Rect } from "@motion-canvas/2d";
import { GRID_LINE_WIDTH, GRID_PURPLE, LED_PURPLE } from "../design-system";
import {
  positionToCoordinates,
  sequenceColumns,
  sequenceRows,
} from "../wall-coordinate-system";

export default function makeJudyHome(
  ledSystem: Reference<LEDSystem>,
  screen: Reference<Rect>
): {
  horizontalLines: ReferenceArray<Line>;
  verticalLines: ReferenceArray<Line>;
} {
  const horizontalLines = createRefArray<Line>();
  const verticalLines = createRefArray<Line>();

  ledSystem().fillRow(2, LED_PURPLE);
  ledSystem().fillRow(3, LED_PURPLE);
  ledSystem().fillRow(4, LED_PURPLE);
  ledSystem().fillRow(5, LED_PURPLE);

  screen().add([
    ...sequenceColumns().map((column) => (
      <Line
        ref={verticalLines}
        points={[
          positionToCoordinates([column, 2]),
          positionToCoordinates([column, 5]),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_PURPLE}
      />
    )),
    ...sequenceRows()
      .filter((row) => row >= 2)
      .map((row) => (
        <Line
          ref={verticalLines}
          points={[
            positionToCoordinates([0, row]),
            positionToCoordinates([15, row]),
          ]}
          lineWidth={GRID_LINE_WIDTH}
          stroke={GRID_PURPLE}
        />
      )),
  ]);

  return { horizontalLines, verticalLines };
}
