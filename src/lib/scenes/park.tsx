import { createRef, Reference } from "@motion-canvas/core";
import { LEDSystem } from "../LEDSystem";
import { Line, Rect } from "@motion-canvas/2d";
import { GRID_BLUE, GRID_GREEN, LED_BLUE, LED_GREEN } from "../design-system";
import { positionToCoordinates } from "../wall-coordinate-system";

export default function makePark(
  ledSystem: Reference<LEDSystem>,
  screen: Reference<Rect>
): {
  topPath: Reference<Line>;
  middlePath: Reference<Line>;
  bottomPath: Reference<Line>;
} {
  // Top row is green
  ledSystem().fillRow(0, LED_GREEN);

  // Second row is mixed
  ledSystem().fillAt([0, 1], LED_GREEN);
  ledSystem().fillAt([1, 1], LED_GREEN);
  ledSystem().fillAt([2, 1], LED_GREEN);
  ledSystem().fillAt([3, 1], LED_GREEN);
  ledSystem().fillAt([4, 1], LED_BLUE);
  ledSystem().fillAt([5, 1], LED_BLUE);
  ledSystem().fillAt([6, 1], LED_GREEN);
  ledSystem().fillAt([7, 1], LED_GREEN);
  ledSystem().fillAt([8, 1], LED_GREEN);
  ledSystem().fillAt([9, 1], LED_GREEN);
  ledSystem().fillAt([10, 1], LED_BLUE);
  ledSystem().fillAt([11, 1], LED_BLUE);
  ledSystem().fillAt([12, 1], LED_GREEN);
  ledSystem().fillAt([13, 1], LED_GREEN);
  ledSystem().fillAt([14, 1], LED_GREEN);
  ledSystem().fillAt([15, 1], LED_GREEN);

  // Third Row is mixed
  ledSystem().fillAt([0, 2], LED_BLUE);
  ledSystem().fillAt([1, 2], LED_GREEN);
  ledSystem().fillAt([2, 2], LED_GREEN);
  ledSystem().fillAt([3, 2], LED_BLUE);
  ledSystem().fillAt([4, 2], LED_BLUE);
  ledSystem().fillAt([5, 2], LED_BLUE);
  ledSystem().fillAt([6, 2], LED_BLUE);
  ledSystem().fillAt([7, 2], LED_GREEN);
  ledSystem().fillAt([8, 2], LED_GREEN);
  ledSystem().fillAt([9, 2], LED_BLUE);
  ledSystem().fillAt([10, 2], LED_BLUE);
  ledSystem().fillAt([11, 2], LED_BLUE);
  ledSystem().fillAt([12, 2], LED_BLUE);
  ledSystem().fillAt([13, 2], LED_GREEN);
  ledSystem().fillAt([14, 2], LED_GREEN);
  ledSystem().fillAt([15, 2], LED_BLUE);

  // Two Rows of blue
  ledSystem().fillRow(3, LED_BLUE);
  ledSystem().fillRow(4, LED_BLUE);

  // Bottom row is green
  ledSystem().fillRow(5, LED_GREEN);

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
        fill={GRID_GREEN}
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
        fill={GRID_BLUE}
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
        fill={GRID_GREEN}
      />
    </>
  );

  return { topPath, middlePath, bottomPath };
}
