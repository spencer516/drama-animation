import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, useRandom, waitFor, spawn } from "@motion-canvas/core";
import { GRID_BLUE, LED_BLUE, LED_ON, LED_OFF } from "@/lib/design-system";

// Configuration variables
const FADE_DURATION = 3; // Duration of each LED fade in/out in seconds
const SPARKLE_DURATION = 30; // Total duration of the sparkling effect in seconds
const SPARKLE_PERCENTAGE = 0.7; // Percentage of LEDs that sparkle at any given time

export default makeScene2D(function* (view) {
  const random = useRandom();
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, horizontalLines, verticalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  // Collect all LED references
  const allLEDs = Array.from(ledSystem().iterate());
  let isSparkling = true;
  const sparklingLEDs = new Set<number>();

  // Calculate number of workers based on sparkle percentage
  const numWorkers = Math.ceil(allLEDs.length * SPARKLE_PERCENTAGE);

  // Create independent workers
  for (let i = 0; i < numWorkers; i++) {
    spawn(function* () {
      while (isSparkling) {
        // Random delay before next sparkle
        yield* waitFor(random.nextFloat(0.1, 1));

        // Choose a random LED that's not already sparkling
        let ledIndex: number;
        let attempts = 0;
        do {
          ledIndex = random.nextInt(0, allLEDs.length - 1);
          attempts++;
        } while (sparklingLEDs.has(ledIndex) && attempts < 10);

        // Skip if all LEDs are busy (shouldn't happen with proper percentage)
        if (sparklingLEDs.has(ledIndex)) {
          yield* waitFor(1);
        }

        sparklingLEDs.add(ledIndex);
        const [ledRef] = allLEDs[ledIndex];

        // Fade to white with randomized duration
        const fadeInDuration = random.nextFloat(
          FADE_DURATION * 0.5,
          FADE_DURATION * 1.5
        );
        yield* ledRef().fill(LED_ON, fadeInDuration);

        // Fade back to blue with randomized duration
        const fadeOutDuration = random.nextFloat(
          FADE_DURATION * 0.5,
          FADE_DURATION * 1.5
        );
        yield* ledRef().fill(LED_BLUE, fadeOutDuration);

        sparklingLEDs.delete(ledIndex);
      }
    });
  }

  yield* waitFor(SPARKLE_DURATION);

  isSparkling = false;

  // Let the final lights finally transition back to blue
  yield* waitFor(5);
});
