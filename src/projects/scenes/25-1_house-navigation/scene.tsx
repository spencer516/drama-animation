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
import { GRID_RED, LED_OFF, LED_RED } from "@/lib/design-system";
import {
  Position,
  positionToCoordinates,
  positionToRect,
} from "@/lib/wall-coordinate-system";

// Configuration constants
const NUM_POINTS = 20; // Number of random points to visit
const PAUSE_DURATION = 1; // Pause duration at each point in seconds
const SPEED_PER_SEGMENT = 0.2; // Time to traverse one grid segment in seconds

export default makeScene2D(function* (view) {
  const random = useRandom(248);
  const { ledSystem, screen } = setupLEDScene(view);

  // Generate random interior points (excluding borders)
  const interiorPoints: Position[] = [];
  for (let i = 0; i < NUM_POINTS; i++) {
    const x = random.nextInt(1, 14) as Position[0]; // 1-14 (excluding 0 and 15)
    const y = random.nextInt(1, 5) as Position[1]; // 1-4 (excluding 0 and 5)
    interiorPoints.push([x, y]);
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

    const result = yield* navigateToPoint(
      fromPoint,
      toPoint,
      ledSystem,
      screen,
      i < path.length - 2,
      currentSquareRefs,
      currentPoint
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
    previousPoint: Position | null
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

    screen().add(
      <Line
        ref={lineRef}
        points={coordinates}
        stroke={GRID_RED}
        lineWidth={8}
        start={0}
        end={0}
        lineCap="round"
        lineJoin="round"
      />
    );

    // Create squares around the destination point
    const squareRefs: any[] = [];
    const squarePositions = getSurroundingSquares(to);

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
          fill={GRID_RED}
          opacity={0}
        />
      );
      squareRefs.push(squareRef);
    }

    // Animate the line (moving segment), LED, and squares simultaneously
    // Also fade out previous squares and LED
    const animations: any[] = [
      delay(SPEED_PER_SEGMENT, lineRef().start(1, duration, linear)),
      lineRef().end(1, duration, linear),
      ledSystem().fillAt(to, LED_RED, duration),
      ...squareRefs.map((ref) => ref().opacity(0.8, duration, easeInOutCubic)),
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

  // Helper function to get the four squares surrounding a point
  function getSurroundingSquares(point: Position): Position[] {
    const [x, y] = point;
    const squares: Position[] = [];

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

    return squares;
  }
});
