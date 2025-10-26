import {
  Color,
  createRefArray,
  Reference,
  ReferenceArray,
} from "@motion-canvas/core";
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

export const POLICE_HEIGHT = 3;

export function setupPoliceStructure(
  screen: Reference<Rect>,
  color: Color
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
      .filter((row) => row >= POLICE_HEIGHT)
      .map((row) => positionToRect([column, row] as Position))
  );

  screen().add([
    ...sequenceColumns().map((column) => (
      <Line
        ref={verticalLines}
        points={[
          positionToCoordinates([column, 3]),
          positionToCoordinates([column, 5]),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={color}
      />
    )),
    ...sequenceRows()
      .filter((row) => row >= POLICE_HEIGHT)
      .map((row) => (
        <Line
          ref={verticalLines}
          points={[
            positionToCoordinates([0, row]),
            positionToCoordinates([15, row]),
          ]}
          lineWidth={GRID_LINE_WIDTH}
          stroke={color}
        />
      )),
    ...rectPositions.map(({ x, y, width, height }) => (
      <Rect
        ref={rects}
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
      />
    )),
  ]);

  return { horizontalLines, verticalLines, rects };
}

export function getPoliceLightPositions(): Position[] {
  return sequenceColumns().flatMap((column) =>
    sequenceRows()
      .filter((row) => row >= POLICE_HEIGHT)
      .map((row) => [column, row] as Position)
  );
}

export default function makePolice(
  ledSystem: Reference<LEDSystem>,
  screen: Reference<Rect>
): {
  horizontalLines: ReferenceArray<Line>;
  verticalLines: ReferenceArray<Line>;
  rects: ReferenceArray<Rect>;
} {
  const lightPositions = getPoliceLightPositions();

  for (const position of lightPositions) {
    ledSystem().fillAt(position, LED_YELLOW);
  }

  return setupPoliceStructure(screen, GRID_YELLOW);
}
