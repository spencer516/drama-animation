import { Line, makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  chain,
  Color,
  createRefArray,
  delay,
  waitFor,
} from "@motion-canvas/core";
import { GRID_BLUE, LED_BLUE } from "@/lib/design-system";
import {
  Position,
  positionsToDistance,
  positionToCoordinates,
  sequenceColumns,
  sequenceRows,
} from "@/lib/wall-coordinate-system";

// Animation parameters
const ANIMATION_DURATION = 2.0; // Total duration for all animations
const HORIZONTAL_LINE_DELAY = 0.08; // Delay between horizontal lines (top to bottom)
const VERTICAL_LINE_DELAY = 0.08; // Delay between vertical lines (left to right)
const HORIZONTAL_LINE_LENGTH = 0.9; // Length of horizontal lines (0-1, where 1 = full width)
const VERTICAL_LINE_LENGTH = 0.9; // Length of vertical lines (0-1, where 1 = full height)
const LED_FADE_DURATION = 0.3; // Duration for LED fade in/out
const LED_DIAGONAL_WIDTH = 6; // Width of the diagonal LED band

const LINE_COLOR = new Color("white");
const LED_WHITE = new Color("white");

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill } = createFilledGrid(ledSystem, screen);

  // Fill the grid with blue
  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  // Create horizontal lines (animating left to right)
  const horizontalLines = createRefArray<Line>();
  const horizontalLineWidth = positionsToDistance([
    [0, 0],
    [15, 0],
  ]);

  screen().add(
    sequenceRows().map((row) => (
      <Line
        ref={horizontalLines}
        points={[
          positionToCoordinates([0, row]),
          positionToCoordinates([15, row]),
        ]}
        lineWidth={8}
        stroke={LINE_COLOR}
        endOffset={horizontalLineWidth}
        startOffset={0}
      />
    ))
  );

  // Create vertical lines (animating top to bottom)
  const verticalLines = createRefArray<Line>();
  const verticalLineWidth = positionsToDistance([
    [0, 0],
    [0, 5],
  ]);

  screen().add(
    sequenceColumns().map((column) => (
      <Line
        ref={verticalLines}
        points={[
          positionToCoordinates([column, 0]),
          positionToCoordinates([column, 5]),
        ]}
        lineWidth={8}
        stroke={LINE_COLOR}
        endOffset={verticalLineWidth}
        startOffset={0}
      />
    ))
  );

  // Create diagonal LED positions (top-left to bottom-right)
  // Grid is 16 columns (0-15) x 6 rows (0-5)
  const diagonalLEDs: Position[] = [];
  const columns = sequenceColumns();
  const rows = sequenceRows();

  for (const row of rows) {
    for (const col of columns) {
      // Scale row to match column range for diagonal calculation
      const scaledRow = (row / 5) * 15;
      // Calculate distance from the diagonal
      const distanceFromDiagonal = Math.abs(scaledRow - col);
      if (distanceFromDiagonal <= LED_DIAGONAL_WIDTH) {
        diagonalLEDs.push([col, row] as Position);
      }
    }
  }

  // Calculate delay for each LED based on its position along the diagonal
  const getLEDDelay = (position: Position) => {
    const [col, row] = position;
    // Normalize to 0-1 range where top-left is 0 and bottom-right is 1
    const normalizedCol = col / 15;
    const normalizedRow = row / 5;
    const diagonalPosition = (normalizedCol + normalizedRow) / 2;
    return diagonalPosition * ANIMATION_DURATION;
  };

  // Run all three animations concurrently
  yield* all(
    // 1. Horizontal lines animation (top to bottom)
    ...horizontalLines.map((line, index) => {
      const animDuration = ANIMATION_DURATION - index * HORIZONTAL_LINE_DELAY;
      const extendDuration = animDuration * HORIZONTAL_LINE_LENGTH;
      const retractDuration = animDuration * HORIZONTAL_LINE_LENGTH;
      const delayBetween = animDuration - extendDuration - retractDuration;

      return delay(
        index * HORIZONTAL_LINE_DELAY,
        all(
          line.endOffset(0, extendDuration),
          delay(
            extendDuration + delayBetween,
            line.startOffset(horizontalLineWidth, retractDuration)
          )
        )
      );
    }),

    // 2. Vertical lines animation (left to right)
    ...verticalLines.map((line, index) => {
      const animDuration = ANIMATION_DURATION - index * VERTICAL_LINE_DELAY;
      const extendDuration = animDuration * VERTICAL_LINE_LENGTH;
      const retractDuration = animDuration * VERTICAL_LINE_LENGTH;
      const delayBetween = animDuration - extendDuration - retractDuration;

      return delay(
        index * VERTICAL_LINE_DELAY,
        all(
          line.endOffset(0, extendDuration),
          delay(
            extendDuration + delayBetween,
            line.startOffset(verticalLineWidth, retractDuration)
          )
        )
      );
    }),

    // 3. LED lights animation (diagonal fade TL to BR)
    ...diagonalLEDs.map((position) =>
      delay(
        getLEDDelay(position),
        chain(
          // Fade in: blue to white
          ledSystem().fillAt(position, LED_WHITE, LED_FADE_DURATION),
          waitFor(LED_FADE_DURATION),
          // Fade out: white to blue
          ledSystem().fillAt(position, LED_BLUE, LED_FADE_DURATION)
        )
      )
    )
  );
});
