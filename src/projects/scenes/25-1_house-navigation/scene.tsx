import { makeScene2D, Line, Rect } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  createRef,
  useRandom,
  waitFor,
  Color,
  easeInOutCubic,
  linear,
  delay,
} from "@motion-canvas/core";
import {
  GRID_RED,
  GRID_WHITE,
  GRID_BLUE,
  GRID_PURPLE,
  GRID_GREEN,
  GRID_YELLOW,
  LED_OFF,
  LED_RED,
  LED_BLUE,
  LED_GREEN,
  LED_YELLOW,
  LED_PURPLE,
} from "@/lib/design-system";
import {
  Position,
  positionToCoordinates,
  positionToRect,
} from "@/lib/wall-coordinate-system";

// Configuration constants
const NUM_POINTS = 20; // Number of random points to visit
const PAUSE_DURATION = 1; // Pause duration at each point in seconds
const SPEED_PER_SEGMENT = 0.2; // Time to traverse one grid segment in seconds

// Color palettes
const GRID_COLORS = [GRID_RED, GRID_BLUE, GRID_PURPLE, GRID_GREEN, GRID_YELLOW];
const LED_COLORS = [LED_RED, LED_BLUE, LED_PURPLE, LED_GREEN, LED_YELLOW];

// Helper function to calculate Manhattan distance between two points
function manhattanDistance(p1: Position, p2: Position): number {
  return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
}

export default makeScene2D(function* (view) {
  const random = useRandom(248);
  const { ledSystem, screen } = setupLEDScene(view);

  // Generate random interior points (excluding borders)
  // Ensure each point is at least 5 segments away from the previous one
  const interiorPoints: Position[] = [];
  let lastPoint: Position = [0, 0]; // Start from top-left corner

  for (let i = 0; i < NUM_POINTS; i++) {
    let x: Position[0];
    let y: Position[1];
    let attempts = 0;
    const maxAttempts = 100;

    // Keep generating until we find a point that's at least 5 segments away
    do {
      x = random.nextInt(1, 14) as Position[0]; // 1-14 (excluding 0 and 15)
      y = random.nextInt(1, 5) as Position[1]; // 1-4 (excluding 0 and 5)
      attempts++;
    } while (
      attempts < maxAttempts &&
      manhattanDistance(lastPoint, [x, y]) < 5
    );

    const newPoint: Position = [x, y];
    interiorPoints.push(newPoint);
    lastPoint = newPoint;
  }

  console.log(interiorPoints);

  // Start from top-left corner
  const startPoint: Position = [0, 0];
  const path = [startPoint, ...interiorPoints, startPoint];

  // Keep track of current squares and LED to fade them out
  let currentSquareRefs: any[] = [];
  let currentPoint: Position | null = null;

  // Navigate through the path
  for (let i = 0; i < path.length - 1; i++) {
    const fromPoint = path[i];
    const toPoint = path[i + 1];

    // Pick random colors for this stop
    const colorIndex = random.nextInt(0, GRID_COLORS.length - 1);
    const gridColor = GRID_COLORS[colorIndex];
    const ledColor = LED_COLORS[colorIndex];

    const result = yield* navigateToPoint(
      fromPoint,
      toPoint,
      ledSystem,
      screen,
      i < path.length - 2,
      currentSquareRefs,
      currentPoint,
      gridColor,
      ledColor,
      random
    );

    currentSquareRefs = result.squareRefs;
    currentPoint = toPoint;
  }

  yield* waitFor(2);

  // Helper function to navigate from one point to another
  function* navigateToPoint(
    from: Position,
    to: Position,
    ledSystem: any,
    screen: any,
    shouldPause: boolean,
    previousSquareRefs: any[],
    previousPoint: Position | null,
    gridColor: Color,
    ledColor: Color,
    random: ReturnType<typeof useRandom>
  ) {
    // Calculate the path through grid lines (horizontal then vertical)
    const pathPoints: Position[] = [];
    const [fromX, fromY] = from;
    const [toX, toY] = to;

    // Move horizontally first
    if (fromX !== toX) {
      const step = fromX < toX ? 1 : -1;
      for (let x = fromX; x !== toX; x += step) {
        pathPoints.push([x as Position[0], fromY]);
      }
    }

    // Then move vertically
    pathPoints.push([toX, fromY]);
    if (fromY !== toY) {
      const step = fromY < toY ? 1 : -1;
      for (let y = fromY; y !== toY; y += step) {
        pathPoints.push([toX, y as Position[1]]);
      }
    }
    pathPoints.push(to);

    // Calculate total distance and duration
    const totalSegments = Math.abs(toX - fromX) + Math.abs(toY - fromY);
    const duration = totalSegments * SPEED_PER_SEGMENT;

    // Create the line
    const lineRef = createRef<Line>();
    const coordinates = pathPoints.map(positionToCoordinates);

    // Create squares around the destination point
    const squareRefs: any[] = [];
    const squarePositions = getSurroundingSquares(to, random);

    for (const squarePos of squarePositions) {
      const squareRef = createRef<Rect>();
      const { x, y, width, height } = positionToRect(squarePos);
      screen().add(
        <Rect
          ref={squareRef}
          x={x}
          y={y}
          width={width}
          height={height}
          fill={gridColor}
          opacity={0}
        />
      );
      squareRefs.push(squareRef);
    }

    screen().add(
      <Line
        ref={lineRef}
        points={coordinates}
        stroke={GRID_WHITE}
        lineWidth={8}
        start={0}
        end={0}
        lineCap="round"
        lineJoin="round"
      />
    );

    // Animate the line (moving segment), LED, and squares simultaneously
    // Also fade out previous squares and LED
    const animations: any[] = [
      delay(SPEED_PER_SEGMENT, lineRef().start(1, duration, linear)),
      lineRef().end(1, duration, linear),
      ledSystem().fillAt(to, ledColor, duration),
      ...squareRefs.map((ref) => ref().opacity(1, duration, easeInOutCubic)),
    ];

    // Fade out previous squares and LED if they exist
    if (previousPoint !== null) {
      animations.push(
        ledSystem().fillAt(previousPoint, LED_OFF, duration),
        ...previousSquareRefs.map((ref) =>
          ref().opacity(0, duration, easeInOutCubic)
        )
      );
    }

    yield* all(...animations);

    // Remove the line
    lineRef().remove();

    // Remove previous squares
    previousSquareRefs.forEach((ref) => ref().remove());

    // Pause at the point
    if (shouldPause) {
      yield* waitFor(PAUSE_DURATION);
    }

    return { squareRefs };
  }

  // Helper function to get the squares surrounding a point (at least 4, with random extensions)
  function getSurroundingSquares(
    point: Position,
    random: ReturnType<typeof useRandom>
  ): Position[] {
    const [x, y] = point;
    const squares: Position[] = [];

    // Always add the 4 core surrounding squares
    // Top-left square
    if (x > 0 && y > 0) {
      squares.push([(x - 1) as Position[0], (y - 1) as Position[1]]);
    }

    // Top-right square
    if (x < 15 && y > 0) {
      squares.push([x as Position[0], (y - 1) as Position[1]]);
    }

    // Bottom-left square
    if (x > 0 && y < 5) {
      squares.push([(x - 1) as Position[0], y as Position[1]]);
    }

    // Bottom-right square
    if (x < 15 && y < 5) {
      squares.push([x as Position[0], y as Position[1]]);
    }

    // Randomly add additional squares to vary the room shape
    // Decide how many extra squares to add (0-3)
    const extraSquares = random.nextInt(0, 3);

    for (let i = 0; i < extraSquares; i++) {
      // Try to add squares in adjacent positions
      const direction = random.nextInt(0, 3); // 0=left, 1=right, 2=up, 3=down

      let newSquare: Position | null = null;

      switch (direction) {
        case 0: // Extend left
          if (x > 1 && y > 0 && y < 5) {
            newSquare = [(x - 2) as Position[0], y as Position[1]];
          }
          break;
        case 1: // Extend right
          if (x < 14 && y > 0 && y < 5) {
            newSquare = [(x + 1) as Position[0], y as Position[1]];
          }
          break;
        case 2: // Extend up
          if (y > 1 && x > 0 && x < 15) {
            newSquare = [x as Position[0], (y - 2) as Position[1]];
          }
          break;
        case 3: // Extend down
          if (y < 4 && x > 0 && x < 15) {
            newSquare = [x as Position[0], (y + 1) as Position[1]];
          }
          break;
      }

      // Add the square if it's valid and not already in the list
      if (newSquare) {
        const squareKey = `${newSquare[0]},${newSquare[1]}`;
        const exists = squares.some(([sx, sy]) => `${sx},${sy}` === squareKey);
        if (!exists) {
          squares.push(newSquare);
        }
      }
    }

    return squares;
  }
});
