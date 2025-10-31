import { Line, makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  createRefMap,
  linear,
  spawn,
  useRandom,
  waitFor,
} from "@motion-canvas/core";
import {
  GRID_BLUE,
  GRID_LINE_WIDTH,
  LED_BLUE,
  LED_OFF,
} from "@/lib/design-system";
import {
  Position,
  positionsToDistance,
  positionToCoordinates,
  sequenceColumns,
  sequenceRows,
} from "@/lib/wall-coordinate-system";

type Segment = {
  id: string;
  start: Position;
  end: Position;
};

const FINAL_POSITION: Position = [12, 4];

// Animation configuration
const SEGMENT_FADE_DURATION = 0.15; // How long each segment takes to fade out
const CONCURRENT_PATHS = 15; // How many simultaneous paths are being traced
const ANIMATION_STAGGER = 0; // Delay between starting each path
const LED_FADE_DURATION = 0.15; // How long LEDs take to fade out

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const segmentRefs = createRefMap<Line>();

  const random = useRandom();

  // Make a line that fills in every segment
  const segments: Segment[] = sequenceColumns()
    .flatMap((column) =>
      sequenceRows().flatMap((row) => {
        const start = [column, row] as Position;
        return [
          column > 14 ? null : { start, end: [column + 1, row] as Position },
          row > 4 ? null : { start, end: [column, row + 1] as Position },
        ].filter(Boolean);
      })
    )
    .map(withID);

  const segmentLength = positionsToDistance([
    [0, 0],
    [1, 0],
  ]);

  ledSystem().fillAll(LED_BLUE);

  screen().add(
    segments.map(({ id, start, end }) => (
      <Line
        ref={segmentRefs[id]}
        points={[positionToCoordinates(start), positionToCoordinates(end)]}
        stroke={GRID_BLUE}
        lineWidth={GRID_LINE_WIDTH}
      />
    ))
  );

  // Build adjacency map: for each position, track which segments connect to it
  const positionKey = (pos: Position) => `${pos[0]},${pos[1]}`;
  const adjacencyMap = new Map<string, Segment[]>();

  for (const segment of segments) {
    const startKey = positionKey(segment.start);
    const endKey = positionKey(segment.end);

    if (!adjacencyMap.has(startKey)) adjacencyMap.set(startKey, []);
    if (!adjacencyMap.has(endKey)) adjacencyMap.set(endKey, []);

    adjacencyMap.get(startKey)!.push(segment);
    adjacencyMap.get(endKey)!.push(segment);
  }

  // Track which segments have been animated out
  const animatedSegments = new Set<string>();

  // Track active segments at each position (for LED fade logic)
  const activeSegmentsAtPosition = new Map<string, Set<string>>();
  for (const segment of segments) {
    const startKey = positionKey(segment.start);
    const endKey = positionKey(segment.end);

    if (!activeSegmentsAtPosition.has(startKey)) {
      activeSegmentsAtPosition.set(startKey, new Set());
    }
    if (!activeSegmentsAtPosition.has(endKey)) {
      activeSegmentsAtPosition.set(endKey, new Set());
    }

    activeSegmentsAtPosition.get(startKey)!.add(segment.id);
    activeSegmentsAtPosition.get(endKey)!.add(segment.id);
  }

  // Build multiple continuous paths that converge to FINAL_POSITION
  function buildContinuousPaths(): Segment[][] {
    const remaining = new Set(segments.map((s) => s.id));
    const paths: Segment[][] = [];

    // Pick random starting segments from edges of the grid
    const edgeSegments = segments.filter((seg) => {
      const [sx, sy] = seg.start;
      const [ex, ey] = seg.end;
      return (
        sx === 0 ||
        sy === 0 ||
        sx === 15 ||
        sy === 5 ||
        ex === 0 ||
        ey === 0 ||
        ex === 15 ||
        ey === 5
      );
    });

    // Create starting paths from random edge segments
    const shuffledEdges = edgeSegments.sort(() => random.nextFloat() - 0.5);
    for (let i = 0; i < Math.min(CONCURRENT_PATHS, shuffledEdges.length); i++) {
      const startSegment = shuffledEdges[i];
      if (remaining.has(startSegment.id)) {
        remaining.delete(startSegment.id);
        paths.push([startSegment]);
      }
    }

    // Extend each path by following connected segments toward FINAL_POSITION
    let anyPathGrew = true;
    while (remaining.size > 0 && anyPathGrew) {
      anyPathGrew = false;

      for (const path of paths) {
        if (remaining.size === 0) break;

        const lastSegment = path[path.length - 1];
        const endPos = lastSegment.end;
        const startPos = lastSegment.start;

        // Find available segments connected to either end
        const connectedToEnd = (
          adjacencyMap.get(positionKey(endPos)) || []
        ).filter((s) => remaining.has(s.id));
        const connectedToStart = (
          adjacencyMap.get(positionKey(startPos)) || []
        ).filter((s) => remaining.has(s.id));

        const available = [...connectedToEnd, ...connectedToStart];

        if (available.length > 0) {
          // Prefer segments that get us closer to FINAL_POSITION
          const sorted = available.sort((a, b) => {
            const distA = Math.min(
              Math.abs(a.start[0] - FINAL_POSITION[0]) +
                Math.abs(a.start[1] - FINAL_POSITION[1]),
              Math.abs(a.end[0] - FINAL_POSITION[0]) +
                Math.abs(a.end[1] - FINAL_POSITION[1])
            );
            const distB = Math.min(
              Math.abs(b.start[0] - FINAL_POSITION[0]) +
                Math.abs(b.start[1] - FINAL_POSITION[1]),
              Math.abs(b.end[0] - FINAL_POSITION[0]) +
                Math.abs(b.end[1] - FINAL_POSITION[1])
            );
            return distA - distB;
          });

          const nextSegment = sorted[0];
          path.push(nextSegment);
          remaining.delete(nextSegment.id);
          anyPathGrew = true;
        }
      }
    }

    // Handle any remaining disconnected segments
    while (remaining.size > 0) {
      const remainingSegments = Array.from(remaining).map(
        (id) => segments.find((s) => s.id === id)!
      );
      const segment = remainingSegments[0];
      remaining.delete(segment.id);

      // Find shortest path to add this to
      const shortestPath = paths.reduce((shortest, current) =>
        current.length < shortest.length ? current : shortest
      );
      shortestPath.push(segment);
    }

    // Ensure the last segment of the longest path touches FINAL_POSITION
    // Find the path that ends closest to FINAL_POSITION and make it animate last
    paths.sort((a, b) => {
      const lastA = a[a.length - 1];
      const lastB = b[b.length - 1];

      const distA = Math.min(
        Math.abs(lastA.start[0] - FINAL_POSITION[0]) +
          Math.abs(lastA.start[1] - FINAL_POSITION[1]),
        Math.abs(lastA.end[0] - FINAL_POSITION[0]) +
          Math.abs(lastA.end[1] - FINAL_POSITION[1])
      );
      const distB = Math.min(
        Math.abs(lastB.start[0] - FINAL_POSITION[0]) +
          Math.abs(lastB.start[1] - FINAL_POSITION[1]),
        Math.abs(lastB.end[0] - FINAL_POSITION[0]) +
          Math.abs(lastB.end[1] - FINAL_POSITION[1])
      );

      return distB - distA; // Path ending closest to FINAL_POSITION goes last
    });

    return paths;
  }

  const animationPaths = buildContinuousPaths();

  // Animate segment removal with concurrent LED fading
  function* animateSegmentOut(segment: Segment) {
    const ref = segmentRefs[segment.id]();
    if (!ref) return;

    // Randomly choose to animate from start or end
    const animateFromStart = random.nextFloat() > 0.5;
    const [pointA, pointB] = ref.points();

    // Mark segment as animated
    animatedSegments.add(segment.id);

    // Check which LEDs should fade
    const ledAnimations = [];
    for (const pos of [segment.start, segment.end]) {
      const key = positionKey(pos);
      activeSegmentsAtPosition.get(key)?.delete(segment.id);

      // If no more segments at this position, fade out the LED
      if (activeSegmentsAtPosition.get(key)?.size === 0) {
        ledAnimations.push(ledSystem().fillAt(pos, LED_OFF, LED_FADE_DURATION));
      }
    }

    // Animate segment and LEDs at the same time (no opacity fade)
    yield* all(
      ref.points(
        animateFromStart ? [pointB, pointB] : [pointA, pointA],
        SEGMENT_FADE_DURATION,
        linear
      ),
      ...ledAnimations
    );
  }

  // Execute each path as a continuous animation
  function* animatePath(path: Segment[]) {
    for (const segment of path) {
      yield* animateSegmentOut(segment);
    }
  }

  // Run all paths concurrently  with staggered starts
  const pathAnimations = animationPaths.map((path, index) =>
    (function* () {
      yield* waitFor(index * ANIMATION_STAGGER);
      yield* animatePath(path);
    })()
  );

  spawn(function* () {
    yield* screen().opacity(0, 3);
  });

  yield* all(...pathAnimations);

  yield* waitFor(1);
});

function withID({ start, end }: { start: Position; end: Position }): Segment {
  const [sx, sy] = start;
  const [ex, ey] = end;
  const id = `s:${sx},${sy}-e:${ex},${ey}`;
  return { start, end, id };
}
