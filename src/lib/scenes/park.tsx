import { createRef, Reference } from "@motion-canvas/core";
import { LEDSystem } from "../LEDSystem";
import { Line, Rect } from "@motion-canvas/2d";
import {
  GRID_BLACK,
  GRID_BLUE,
  GRID_GREEN,
  LED_BLUE,
  LED_GREEN,
} from "../design-system";
import {
  allPositions,
  excludePositions,
  Position,
  positionToCoordinates,
  sequenceColumns,
} from "../wall-coordinate-system";

const GREEN_POSITIONS: Position[] = [
  ...sequenceColumns().map((column) => [column, 0] as Position),
  [0, 1],
  [1, 1],
  [2, 1],
  [3, 1],
  [6, 1],
  [7, 1],
  [8, 1],
  [9, 1],
  [12, 1],
  [13, 1],
  [14, 1],
  [15, 1],
  [1, 2],
  [2, 2],
  [7, 2],
  [8, 2],
  [13, 2],
  [14, 2],
  ...sequenceColumns().map((column) => [column, 5] as Position),
];

const BLUE_POSITIONS: Position[] = excludePositions(
  allPositions(),
  GREEN_POSITIONS
);

export default function makePark(
  ledSystem: Reference<LEDSystem>,
  screen: Reference<Rect>,
  shouldFill: boolean = true
): {
  topPath: Reference<Line>;
  middlePath: Reference<Line>;
  bottomPath: Reference<Line>;
  greenPositions: Position[];
  bluePositions: Position[];
} {
  if (shouldFill) {
    GREEN_POSITIONS.map((position) => ledSystem().fillAt(position, LED_GREEN));
    BLUE_POSITIONS.map((position) => ledSystem().fillAt(position, LED_BLUE));
  }

  const bottomPath = createRef<Line>();
  const middlePath = createRef<Line>();
  const topPath = createRef<Line>();

  screen().add(
    <>
      <Line
        ref={bottomPath}
        points={[
          positionToCoordinates([0, 5]),
          positionToCoordinates([15, 5]),
          positionToCoordinates([15, 4]),
          positionToCoordinates([0, 4]),
        ]}
        fill={shouldFill ? GRID_GREEN : GRID_BLACK}
      />
      <Line
        ref={middlePath}
        points={[
          positionToCoordinates([0, 4]),
          positionToCoordinates([15, 4]),
          positionToCoordinates([15, 1]),
          positionToCoordinates([14, 2]),
          positionToCoordinates([13, 2]),
          positionToCoordinates([12, 1]),
          positionToCoordinates([11, 0]),
          positionToCoordinates([10, 0]),
          positionToCoordinates([9, 1]),
          positionToCoordinates([8, 2]),
          positionToCoordinates([7, 2]),
          positionToCoordinates([6, 1]),
          positionToCoordinates([5, 0]),
          positionToCoordinates([4, 0]),
          positionToCoordinates([3, 1]),
          positionToCoordinates([2, 2]),
          positionToCoordinates([1, 2]),
          positionToCoordinates([0, 1]),
        ]}
        fill={shouldFill ? GRID_BLUE : GRID_BLACK}
      />
      <Line
        ref={topPath}
        points={[
          positionToCoordinates([15, 0]),
          positionToCoordinates([15, 4]),
          positionToCoordinates([15, 1]),
          positionToCoordinates([14, 2]),
          positionToCoordinates([13, 2]),
          positionToCoordinates([12, 1]),
          positionToCoordinates([11, 0]),
          positionToCoordinates([10, 0]),
          positionToCoordinates([9, 1]),
          positionToCoordinates([8, 2]),
          positionToCoordinates([7, 2]),
          positionToCoordinates([6, 1]),
          positionToCoordinates([5, 0]),
          positionToCoordinates([4, 0]),
          positionToCoordinates([3, 1]),
          positionToCoordinates([2, 2]),
          positionToCoordinates([1, 2]),
          positionToCoordinates([0, 1]),
          positionToCoordinates([0, 0]),
        ]}
        fill={shouldFill ? GRID_GREEN : GRID_BLACK}
      />
    </>
  );

  return {
    topPath,
    middlePath,
    bottomPath,
    greenPositions: GREEN_POSITIONS,
    bluePositions: BLUE_POSITIONS,
  };
}
