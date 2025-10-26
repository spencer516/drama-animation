import { createRefArray, Reference, ReferenceArray } from "@motion-canvas/core";
import { LEDSystem } from "../LEDSystem";
import { Line, Rect } from "@motion-canvas/2d";
import { GRID_LINE_WIDTH, GRID_YELLOW, LED_YELLOW } from "../design-system";
import {
  Position,
  positionToCoordinates,
  positionToRect,
  sequenceColumns,
  sequenceRows,
} from "../wall-coordinate-system";

export default function makePolice(
  ledSystem: Reference<LEDSystem>,
  screen: Reference<Rect>
): {
  horizontalLines: ReferenceArray<Line>;
  verticalLines: ReferenceArray<Line>;
  rects: ReferenceArray<Rect>;
} {
  const horizontalLines = createRefArray<Line>();
  const verticalLines = createRefArray<Line>();
  const rects = createRefArray<Rect>();

  const rectPositions = sequenceColumns(false).flatMap((column) =>
    sequenceRows(false)
      .filter((row) => row >= 3)
      .map((row) => positionToRect([column, row] as Position))
  );

  ledSystem().fillRow(3, LED_YELLOW);
  ledSystem().fillRow(4, LED_YELLOW);
  ledSystem().fillRow(5, LED_YELLOW);

  screen().add([
    ...sequenceColumns().map((column) => (
      <Line
        ref={verticalLines}
        points={[
          positionToCoordinates([column, 3]),
          positionToCoordinates([column, 5]),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_YELLOW}
      />
    )),
    ...sequenceRows()
      .filter((row) => row >= 3)
      .map((row) => (
        <Line
          ref={verticalLines}
          points={[
            positionToCoordinates([0, row]),
            positionToCoordinates([15, row]),
          ]}
          lineWidth={GRID_LINE_WIDTH}
          stroke={GRID_YELLOW}
        />
      )),
    ...rectPositions.map(({ x, y, width, height }) => (
      <Rect
        ref={rects}
        x={x}
        y={y}
        width={width}
        height={height}
        fill={GRID_YELLOW}
      />
    )),
  ]);

  return { horizontalLines, verticalLines, rects };
}
