import { Line, makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  Color,
  all,
  waitFor,
  createRefArray,
  loop,
  delay,
} from "@motion-canvas/core";
import {
  Position,
  positionToCoordinates,
  sequenceColumns,
  sequenceRows,
} from "@/lib/wall-coordinate-system";

// Canis Major constellation positions on the 16x6 grid
// These represent the major stars of the constellation
const CONSTELLATION_STARS: Position[] = [
  [8, 2],   // Sirius (the brightest star, roughly center)
  [6, 1],   // Mirzam
  [10, 1],  // Muliphein
  [11, 3],  // Wezen
  [12, 4],  // Aludra
  [9, 4],   // Adhara
  [7, 3],   // Furud
];

// Define the connections between stars (indices in CONSTELLATION_STARS array)
const STAR_CONNECTIONS: [number, number][] = [
  [0, 1], // Sirius to Mirzam
  [0, 2], // Sirius to Muliphein
  [0, 6], // Sirius to Furud
  [0, 5], // Sirius to Adhara
  [2, 3], // Muliphein to Wezen
  [3, 4], // Wezen to Aludra
  [3, 5], // Wezen to Adhara
];

const STAR_COLOR = new Color("#FFFFFF");
const BLACK = new Color("#000000");
const LINE_COLOR = new Color("#4A90E2"); // Soft blue for constellation lines

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  // Start with all LEDs off
  ledSystem().fillAll(BLACK);

  // Generate all LED positions for twinkling
  const allPositions: Position[] = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 16; col++) {
      allPositions.push([col, row] as Position);
    }
  }

  // Create a set for quick lookup of constellation stars
  const constellationSet = new Set(
    CONSTELLATION_STARS.map((pos) => `${pos[0]},${pos[1]}`)
  );

  // Phase 1: Random twinkling animation (5 seconds)
  const twinkleAnimations = [];

  for (const position of allPositions) {
    // Each LED gets its own twinkling loop with random timing
    const randomDelay = Math.random() * 0.5;
    const twinkleDuration = 0.3 + Math.random() * 0.4; // 0.3-0.7s per twinkle
    const offDuration = 0.2 + Math.random() * 0.3; // 0.2-0.5s off time

    twinkleAnimations.push(
      (function* () {
        yield* waitFor(randomDelay);

        // Twinkle for approximately 5 seconds
        const twinkleCount = Math.floor(5 / (twinkleDuration + offDuration));
        for (let i = 0; i < twinkleCount; i++) {
          yield* ledSystem().fillAt(position, STAR_COLOR, twinkleDuration * 0.3);
          yield* waitFor(twinkleDuration * 0.4);
          yield* ledSystem().fillAt(position, BLACK, twinkleDuration * 0.3);
          yield* waitFor(offDuration);
        }
      })()
    );
  }

  yield* all(...twinkleAnimations);

  // Phase 2: Gradually reveal constellation stars
  // Fade out all non-constellation LEDs WHILE fading in constellation stars
  const transitionAnimations = [];

  for (const position of allPositions) {
    const isConstellationStar = constellationSet.has(`${position[0]},${position[1]}`);

    if (isConstellationStar) {
      // Constellation stars: fade in brightly
      transitionAnimations.push(
        ledSystem().fillAt(position, STAR_COLOR, 1.5)
      );
    } else {
      // Non-constellation stars: fade out
      transitionAnimations.push(
        ledSystem().fillAt(position, BLACK, 1.5)
      );
    }
  }

  // All transitions happen simultaneously
  yield* all(...transitionAnimations);

  // Wait a moment to show the constellation
  yield* waitFor(1.0);

  // Phase 3: Draw constellation lines
  const lines = createRefArray<Line>();

  // Create lines connecting the stars
  for (const [startIdx, endIdx] of STAR_CONNECTIONS) {
    const startPos = CONSTELLATION_STARS[startIdx];
    const endPos = CONSTELLATION_STARS[endIdx];

    screen().add(
      <Line
        ref={lines}
        points={[
          positionToCoordinates(startPos),
          positionToCoordinates(endPos),
        ]}
        lineWidth={3}
        stroke={LINE_COLOR}
        opacity={0}
        lineCap="round"
        lineJoin="round"
      />
    );
  }

  // Fade in all lines simultaneously
  yield* all(
    ...lines.map((line) => line.opacity(1, 2.0))
  );

  // Hold the final constellation view
  yield* waitFor(3.0);

  // Optional: Fade out ending
  yield* all(
    ...lines.map((line) => line.opacity(0, 1.0)),
    ledSystem().fillAll(BLACK, 1.0)
  );
});
