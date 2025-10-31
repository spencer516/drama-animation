import { Line, makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, createRefMap, useRandom, waitFor } from "@motion-canvas/core";
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
const CONCURRENT_PATHS = 5; // How many simultaneous paths are being traced
const ANIMATION_STAGGER = 0.02; // Delay between starting each path
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

  // Build multiple continuous paths that trace through the grid
  function buildContinuousPaths(): Segment[][] {
    const remaining = new Set(segments.map((s) => s.id));
    const paths: Segment[][] = [];

    // Start from FINAL_POSITION and work backwards
    const finalSegments = adjacencyMap.get(positionKey(FINAL_POSITION)) || [];
    const finalSegment =
      finalSegments[Math.floor(random.nextFloat() * finalSegments.length)];

    if (finalSegment) {
      remaining.delete(finalSegment.id);
      paths.push([finalSegment]);
    }

    // Create additional starting paths
    for (let i = 1; i < CONCURRENT_PATHS; i++) {
      const remainingSegments = Array.from(remaining).map(
        (id) => segments.find((s) => s.id === id)!
      );
      if (remainingSegments.length > 0) {
        const startSegment =
          remainingSegments[
            Math.floor(random.nextFloat() * remainingSegments.length)
          ];
        remaining.delete(startSegment.id);
        paths.push([startSegment]);
      }
    }

    // Extend each path by following connected segments
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
          const nextSegment =
            available[Math.floor(random.nextFloat() * available.length)];
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

    // Animate segment and LEDs at the same time
    yield* all(
      ref.opacity(0, SEGMENT_FADE_DURATION),
      ref.points(
        animateFromStart ? [pointB, pointB] : [pointA, pointA],
        SEGMENT_FADE_DURATION
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

  yield* all(...pathAnimations);

  yield* waitFor(1);
});

function withID({ start, end }: { start: Position; end: Position }): Segment {
  const [sx, sy] = start;
  const [ex, ey] = end;
  const id = `s:${sx},${sy}-e:${ex},${ey}`;
  return { start, end, id };
}
