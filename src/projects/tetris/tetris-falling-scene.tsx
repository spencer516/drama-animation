import { makeScene2D, Rect } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  Color,
  createRef,
  all,
  waitFor,
  easeOutBounce,
  easeInCubic,
  Reference,
  sequence,
} from "@motion-canvas/core";
import { positionToRect, Position } from "@/lib/wall-coordinate-system";

// ============================================================================
// ANIMATION SETTINGS - Customize these values to control the animation
// ============================================================================

// Speed settings
const FALL_SPEED = 0.8; // Duration in seconds for each piece to fall (lower = faster)
const DELAY_BETWEEN_PIECES = 0.1; // Delay in seconds between piece drops (lower = faster sequence)
const FADE_OUT_DURATION = 1.5; // Duration in seconds for final fade to black

// Color palette for Tetris pieces
const TETRIS_COLORS = [
  "#FF0000", // Red (Z piece)
  "#00FF00", // Green (S piece)
  "#0000FF", // Blue (J piece)
  "#FFFF00", // Yellow (O piece)
  "#FF00FF", // Magenta (T piece)
  "#00FFFF", // Cyan (I piece)
  "#FF8800", // Orange (L piece)
];

// ============================================================================
// TETRIS PIECE DEFINITIONS
// ============================================================================

// Define Tetris piece shapes as relative grid coordinates
// Each piece is defined as an array of [column, row] offsets from the piece's origin
type TetrisPieceShape = [number, number][];

const TETRIS_PIECES: TetrisPieceShape[] = [
  // I piece (4 cells in a row)
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],

  // O piece (2x2 square)
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ],

  // T piece
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ],

  // L piece
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
  ],

  // J piece
  [
    [1, 0],
    [1, 1],
    [1, 2],
    [0, 2],
  ],

  // S piece
  [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ],

  // Z piece
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
];

// ============================================================================
// GRID SYSTEM
// ============================================================================

// The LED grid is 16x6, which means we have 15x5 squares between the LEDs
const GRID_COLS = 15;
const GRID_ROWS = 5;

interface GridCell {
  rect: Reference<Rect>;
  position: [number, number]; // Grid position [col, row]
  ledPositions: Position[]; // The 4 surrounding LED positions
  occupied: boolean; // Whether this cell is occupied by a placed piece
}

interface TetrisPiece {
  cells: GridCell[];
  color: string;
}

// ============================================================================
// MAIN SCENE
// ============================================================================

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  // Reset everything to black
  ledSystem().fillAll(new Color("black"));

  // Create all grid cells
  const gridCells: GridCell[][] = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    gridCells[row] = [];
    for (let col = 0; col < GRID_COLS; col++) {
      const rectRef = createRef<Rect>();

      // Each square sits between LED lights
      const rectData = positionToRect([col, row] as Position, 1, 1);

      // The 4 surrounding LEDs are at corners
      const ledPositions: Position[] = [
        [col, row] as Position,
        [col + 1, row] as Position,
        [col, row + 1] as Position,
        [col + 1, row + 1] as Position,
      ];

      screen().add(
        <Rect
          ref={rectRef}
          x={rectData.x}
          y={rectData.y}
          width={rectData.width}
          height={rectData.height}
          stroke={"#000000"}
          lineWidth={8}
          fill={"#000000"}
          opacity={1}
        />
      );

      gridCells[row][col] = {
        rect: rectRef,
        position: [col, row],
        ledPositions,
        occupied: false,
      };
    }
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  // Check if a piece can be placed at a given position
  function canPlacePiece(
    shape: TetrisPieceShape,
    startCol: number,
    startRow: number
  ): boolean {
    for (const [colOffset, rowOffset] of shape) {
      const col = startCol + colOffset;
      const row = startRow + rowOffset;

      // Check bounds
      if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) {
        return false;
      }

      // Check if already occupied
      if (gridCells[row][col].occupied) {
        return false;
      }
    }
    return true;
  }

  // Find a random valid position for a piece
  function findRandomPosition(
    shape: TetrisPieceShape
  ): [number, number] | null {
    const attempts = 100;
    for (let i = 0; i < attempts; i++) {
      const startCol = Math.floor(Math.random() * GRID_COLS);
      const startRow = Math.floor(Math.random() * GRID_ROWS);

      if (canPlacePiece(shape, startCol, startRow)) {
        return [startCol, startRow];
      }
    }
    return null;
  }

  // Animate a piece falling into place
  function* dropPiece(
    shape: TetrisPieceShape,
    startCol: number,
    startRow: number,
    color: string
  ) {
    const cells: GridCell[] = [];

    // Collect the cells this piece will occupy
    for (const [colOffset, rowOffset] of shape) {
      const col = startCol + colOffset;
      const row = startRow + rowOffset;
      cells.push(gridCells[row][col]);
    }

    // Mark cells as occupied
    cells.forEach((cell) => (cell.occupied = true));

    // Animate falling (from above the screen)
    const startOffsetY = -800; // Start position above screen
    const colorObj = new Color(color);

    // Create temporary rects that will "fall"
    const tempRects: Reference<Rect>[] = [];
    for (const cell of cells) {
      const tempRef = createRef<Rect>();
      const rect = cell.rect();
      screen().add(
        <Rect
          ref={tempRef}
          x={rect.x()}
          y={rect.y() + startOffsetY}
          width={rect.width()}
          height={rect.height()}
          stroke={"#000000"}
          lineWidth={8}
          fill={color}
          opacity={1}
        />
      );
      tempRects.push(tempRef);
    }

    // Animate the fall with bounce effect
    yield* all(
      ...tempRects.map((tempRect, i) =>
        tempRect().y(cells[i].rect().y(), FALL_SPEED, easeOutBounce)
      )
    );

    // Transfer color to actual grid cells and remove temp rects
    yield* all(
      ...cells.map((cell) => cell.rect().fill(color, 0.1)),
      ...cells.flatMap((cell) =>
        cell.ledPositions.map((ledPos) =>
          ledSystem().fillAt(ledPos, colorObj, 0.1)
        )
      ),
      ...tempRects.map((tempRect) => tempRect().opacity(0, 0.1))
    );

    // Remove temp rects
    tempRects.forEach((tempRect) => tempRect().remove());

    return { cells, color };
  }

  // ============================================================================
  // MAIN ANIMATION SEQUENCE
  // ============================================================================

  const placedPieces: TetrisPiece[] = [];

  // Keep dropping pieces until we can't find any more valid positions
  let pieceCount = 0;
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = 20; // Stop after this many failed placement attempts

  while (consecutiveFailures < maxConsecutiveFailures) {
    // Pick a random piece shape and color
    const shape =
      TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)];
    const color =
      TETRIS_COLORS[Math.floor(Math.random() * TETRIS_COLORS.length)];

    // Find a valid position
    const position = findRandomPosition(shape);

    if (position === null) {
      consecutiveFailures++;
      continue;
    }

    consecutiveFailures = 0;
    const [startCol, startRow] = position;

    // Drop the piece
    const piece = yield* dropPiece(shape, startCol, startRow, color);
    placedPieces.push(piece);
    pieceCount++;

    // Small delay before next piece
    yield* waitFor(DELAY_BETWEEN_PIECES);
  }

  // Hold the final state for a moment
  yield* waitFor(0.5);

  // ============================================================================
  // FADE OUT TO BLACK
  // ============================================================================

  yield* all(
    ...placedPieces.flatMap((piece) =>
      piece.cells.map((cell) =>
        cell.rect().fill("#000000", FADE_OUT_DURATION, easeInCubic)
      )
    ),
    ledSystem().fillAll(new Color("black"), FADE_OUT_DURATION)
  );
});
