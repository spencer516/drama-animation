import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { waitFor, useRandom, spawn } from "@motion-canvas/core";
import { GRID_PURPLE, LED_PURPLE } from "@/lib/design-system";
import lightning from "@/lib/effects/lightning";
import chaosRectangles from "@/lib/effects/chaos-rectangles";
import { chaoticLineRemoval } from "@/lib/effects/random-chaotic-removal";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom();

  const { fill, horizontalLines, verticalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  // Initial state: Everything blue with grid
  fill({
    ledColor: LED_PURPLE,
    gridColor: GRID_PURPLE,
  });

  const allLines = [...horizontalLines, ...verticalLines];
  chaoticLineRemoval(randomGenerator, allLines);

  // Spawn lightning bolt animation
  spawn(
    lightning(ledSystem, screen, {
      randomSeed: 2,
      totalBolts: 300,
      totalDuration: 10,
      baseColor: LED_PURPLE,
    })
  );

  // Spawn chaos rectangles animation
  spawn(
    chaosRectangles(screen, {
      randomSeed: 66,
      quantity: 100, // Number of rectangles to spawn
      density: 4, // Max size: 1-4 grid units
      speed: 4, // 2x speed multiplier
      totalDuration: 10,
      baseColor: GRID_PURPLE,
    })
  );

  yield* waitFor(12);
});
