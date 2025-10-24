import { makeScene2D, Rect } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  Color,
  createRef,
  all,
  waitFor,
  easeInOutCubic,
  loop,
  Reference
} from "@motion-canvas/core";
import { positionToRect, Position, ColumnPosition, RowPosition } from "@/lib/wall-coordinate-system";

// Define the grid of squares (15x5 squares between the 16x6 LED grid)
const GRID_COLS = 15;
const GRID_ROWS = 5;

// Random color palette for the chaos
const COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FF8800', // Orange
  '#8800FF', // Purple
  '#FF0088', // Hot Pink
  '#00FF88', // Mint
];

interface GridSquare {
  rect: Reference<Rect>;
  position: [number, number]; // Grid position [col, row]
  ledPositions: Position[]; // The 4 surrounding LED positions
}

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  // Reset everything to black
  ledSystem().fillAll(new Color('black'));

  // Create all grid squares
  const squares: GridSquare[] = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const rectRef = createRef<Rect>();

      // Each square sits between LED lights, so it starts at position [col, row]
      // and has size 1x1 in grid coordinates
      const rectData = positionToRect([col, row] as Position, 1, 1);

      // The 4 surrounding LEDs are at corners: [col, row], [col+1, row], [col, row+1], [col+1, row+1]
      const ledPositions: Position[] = [
        [col, row] as Position,
        [(col + 1), row] as Position,
        [col, (row + 1)] as Position,
        [(col + 1), (row + 1)] as Position,
      ];

      screen().add(
        <Rect
          ref={rectRef}
          x={rectData.x}
          y={rectData.y}
          width={rectData.width}
          height={rectData.height}
          fill={'#000000'}
          opacity={0}
        />
      );

      squares.push({
        rect: rectRef,
        position: [col, row],
        ledPositions,
      });
    }
  }

  // Fade in from black
  yield* all(
    ...squares.map(sq => sq.rect().opacity(1, 0.3))
  );

  // Helper function to create a single flash
  function* createFlash() {
    // Pick random squares to flash
    const numFlashes = Math.floor(Math.random() * 8) + 5; // 5-12 squares at once
    const flashDuration = 0.05 + Math.random() * 0.1; // 50-150ms

    const flashSquares = [];
    const usedIndices = new Set<number>();

    // Select random unique squares
    while (flashSquares.length < numFlashes && flashSquares.length < squares.length) {
      const idx = Math.floor(Math.random() * squares.length);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        flashSquares.push(squares[idx]);
      }
    }

    // Flash them with random colors
    const flashTasks = [];

    for (const square of flashSquares) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const colorObj = new Color(color);

      // Turn on square
      flashTasks.push(square.rect().fill(color, flashDuration * 0.3));

      // Turn on surrounding LEDs
      for (const ledPos of square.ledPositions) {
        flashTasks.push(ledSystem().fillAt(ledPos, colorObj, flashDuration * 0.3));
      }
    }

    yield* all(...flashTasks);

    // Wait a bit while they're on
    yield* waitFor(flashDuration * 0.4);

    // Turn them off
    const offTasks = [];
    for (const square of flashSquares) {
      offTasks.push(square.rect().fill('#000000', flashDuration * 0.3));

      for (const ledPos of square.ledPositions) {
        offTasks.push(ledSystem().fillAt(ledPos, new Color('#000000'), flashDuration * 0.3));
      }
    }

    yield* all(...offTasks);

    // Very short delay before next flash
    yield* waitFor(0.02 + Math.random() * 0.05);
  }

  // Run chaotic strobe for approximately 10 seconds
  // Each flash cycle takes roughly 0.1-0.3 seconds, so we'll do about 50-100 flashes
  const numFlashes = 70;
  for (let i = 0; i < numFlashes; i++) {
    yield* createFlash();
  }

  // Fade out to black
  yield* all(
    ...squares.map(sq => sq.rect().opacity(0, 0.4)),
    ledSystem().fillAll(new Color('black'), 0.4)
  );
});
