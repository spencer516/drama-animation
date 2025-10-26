import {
  all,
  Color,
  createRef,
  easeInQuad,
  Reference,
  spawn,
  useRandom,
  waitFor,
  ThreadGenerator,
} from "@motion-canvas/core";
import { LEDSystem } from "../LEDSystem";
import { Line, Rect } from "@motion-canvas/2d";
import {
  ColumnPosition,
  coordinatesToDistance,
  Position,
  positionToCoordinates,
  RowPosition,
} from "../wall-coordinate-system";
import { GRID_LINE_WIDTH, LED_OFF } from "../design-system";

type Params = {
  randomSeed: number;
  totalBolts: number;
  totalDuration: number;
};

const WHITE_BRIGHT = new Color("#ffffff");

export default function* lightning(
  ledSystem: Reference<LEDSystem>,
  screen: Reference<Rect>,
  { randomSeed, totalBolts, totalDuration }: Params
): ThreadGenerator {
  const randomGenerator = useRandom(randomSeed);
  // Generate a random starting position on an edge
  const getRandomEdgePosition = (): Position => {
    const edge = Math.floor(randomGenerator.nextFloat() * 4); // 0=top, 1=right, 2=bottom, 3=left

    if (edge === 0) {
      // Top edge
      return [
        Math.floor(randomGenerator.nextFloat() * 16) as ColumnPosition,
        0,
      ];
    } else if (edge === 1) {
      // Right edge
      return [15, Math.floor(randomGenerator.nextFloat() * 6) as RowPosition];
    } else if (edge === 2) {
      // Bottom edge
      return [
        Math.floor(randomGenerator.nextFloat() * 16) as ColumnPosition,
        5,
      ];
    } else {
      // Left edge
      return [0, Math.floor(randomGenerator.nextFloat() * 6) as RowPosition];
    }
  };

  // Check which edge a position is on (returns null if not on edge)
  const getEdge = ([col, row]: Position): string | null => {
    if (row === 0) return "top";
    if (row === 5) return "bottom";
    if (col === 0) return "left";
    if (col === 15) return "right";
    return null;
  };

  // Generate a random path of connecting positions from edge to edge
  const generateLightningPath = (): Position[] => {
    const path: Position[] = [];
    const visited = new Set<string>();

    // Start at random edge position
    let col = 0 as ColumnPosition;
    let row = 0 as RowPosition;
    [col, row] = getRandomEdgePosition();
    path.push([col, row]);
    visited.add(`${col},${row}`);

    const startEdge = getEdge([col, row]);

    // Keep walking until we hit a different edge (with max attempts to prevent infinite loops)
    const maxSteps = 100;
    let steps = 0;

    while (steps < maxSteps) {
      steps++;

      // Get available directions (not visited and within bounds)
      const directions: Array<[number, number]> = [];
      if (col > 0 && !visited.has(`${col - 1},${row}`))
        directions.push([-1, 0]);
      if (col < 15 && !visited.has(`${col + 1},${row}`))
        directions.push([1, 0]);
      if (row > 0 && !visited.has(`${col},${row - 1}`))
        directions.push([0, -1]);
      if (row < 5 && !visited.has(`${col},${row + 1}`)) directions.push([0, 1]);

      // If no available directions, we're stuck - start over
      if (directions.length === 0) {
        return generateLightningPath();
      }

      // Pick a random available direction
      const dir =
        directions[Math.floor(randomGenerator.nextFloat() * directions.length)];
      col = (col + dir[0]) as ColumnPosition;
      row = (row + dir[1]) as RowPosition;
      path.push([col, row]);
      visited.add(`${col},${row}`);

      // If we've hit a different edge, we're done
      const currentEdge = getEdge([col, row]);
      if (currentEdge !== null && currentEdge !== startEdge) {
        break;
      }
    }

    return path;
  };

  // Spawn a bunch of bolts with a random delay between 0-10s
  for (let i = 0; i < totalBolts; i++) {
    spawn(function* () {
      yield* waitFor(randomGenerator.nextFloat(0, totalDuration));

      // Generate path from edge to edge
      const path = generateLightningPath();

      // Convert path to screen coordinates
      const points = path.map((pos) => positionToCoordinates(pos));
      const length = coordinatesToDistance(points);

      // Create the lightning line
      const bolt = createRef<Line>();
      screen().add(
        <Line
          ref={bolt}
          points={points}
          stroke={WHITE_BRIGHT}
          lineWidth={GRID_LINE_WIDTH}
          lineCap="round"
          lineJoin="round"
          startOffset={0}
          endOffset={length}
        />
      );

      const boltDuration = 0.2 + randomGenerator.nextFloat() * 0.2; // 0.2-0.4s

      // Simultaneously track LED positions
      spawn(function* () {
        const segmentDuration = boltDuration / path.length;
        for (let i = 0; i < path.length; i++) {
          // Turn on LED at current position
          ledSystem().fillAt(path[i], WHITE_BRIGHT);

          yield* waitFor(segmentDuration);

          // Turn off LED
          ledSystem().fillAt(path[i], LED_OFF);
        }
      });

      // Animate the bolt from start to end
      yield* all(
        bolt().startOffset(0, boltDuration, easeInQuad),
        bolt().endOffset(0, boltDuration, easeInQuad)
      );

      // Remove the bolt
      bolt().remove();
    });
  }
}
