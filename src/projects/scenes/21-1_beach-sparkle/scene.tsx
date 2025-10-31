import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, useRandom, waitFor, spawn } from "@motion-canvas/core";
import { GRID_BLUE, LED_BLUE, LED_ON, LED_OFF } from "@/lib/design-system";

// Configuration variables
const FADE_DURATION = 3; // Duration of each LED fade in/out in seconds
const SPARKLE_DURATION = 30; // Total duration of the sparkling effect in seconds
const SPARKLE_PERCENTAGE = 0.3; // Percentage of LEDs that sparkle at any given time

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

  /*
  CLAUDE: HERE!!!
  First, use spawn() to create a bunch of independent workers. The number
  of workers is based on SPARKLE_PERCENTAGE

  The worker will run continuously in a loop provded that isSparkling is true

  In each loop, it will 
    - delay itself for a random amount of time
    - choose a random light that is not already being sparkled
    - fade the light from blue to LED_ON (randomized duration)
    - fade the light from LED_ON to blue (randomized duration)
  */

  yield* waitFor(SPARKLE_DURATION);

  isSparkling = false;

  // Let the final lights finally transition back to blue
  yield* waitFor(5);
});
