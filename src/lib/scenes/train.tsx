import { Line, Rect } from "@motion-canvas/2d";
import { createRefArray, Reference, ReferenceArray } from "@motion-canvas/core";
import {
  Position,
  positionToCoordinates,
  positionToRect,
  sequenceColumns,
  sequenceRows,
} from "../wall-coordinate-system";
import { GRID_LINE_WIDTH, GRID_WHITE } from "../design-system";

export const TRAIN_HEIGHT = 2;

export function setupTrainStructure(screen: Reference<Rect>): {
  horizontalLines: ReferenceArray<Line>;
  verticalLines: ReferenceArray<Line>;
  rects: ReferenceArray<Rect>;
} {
  const horizontalLines = createRefArray<Line>();
  const verticalLines = createRefArray<Line>();
  const rects = createRefArray<Rect>();

  const rectPositions = sequenceColumns(false).flatMap((column) =>
    sequenceRows(false)
      .filter((row) => row >= TRAIN_HEIGHT)
      .map((row) => {
        if (row === 3 && column % 2 === 1) {
          return null;
        } else {
          return positionToRect([column, row] as Position);
        }
      })
      .filter(Boolean)
  );

  screen().add([
    ...sequenceColumns().map((column) => (
      <Line
        ref={verticalLines}
        points={[
          positionToCoordinates([column, 2]),
          positionToCoordinates([column, 5]),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_WHITE}
      />
    )),
    ...sequenceRows()
      .filter((row) => row >= TRAIN_HEIGHT)
      .map((row) => (
        <Line
          ref={verticalLines}
          points={[
            positionToCoordinates([0, row]),
            positionToCoordinates([15, row]),
          ]}
          lineWidth={GRID_LINE_WIDTH}
          stroke={GRID_WHITE}
        />
      )),
    ...rectPositions.map(({ x, y, width, height }) => (
      <Rect
        ref={rects}
        x={x}
        y={y}
        width={width}
        height={height}
        fill={GRID_WHITE}
      />
    )),
  ]);

  return { horizontalLines, verticalLines, rects };
}
