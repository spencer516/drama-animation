import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { waitFor, useRandom, spawn } from "@motion-canvas/core";
import lightning from "@/lib/effects/lightning";
import chaosRectangles from "@/lib/effects/chaos-rectangles";
import makePolice from "@/lib/scenes/police";
import {
  chaoticLineRemoval,
  chaoticRectRemoval,
} from "@/lib/effects/random-chaotic-removal";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom();

  const { horizontalLines, verticalLines, rects } = makePolice(
    ledSystem,
    screen
  );

  const allLines = [...horizontalLines, ...verticalLines];

  chaoticLineRemoval(randomGenerator, allLines);
  chaoticRectRemoval(randomGenerator, rects);

  // Spawn lightning bolt animation
  spawn(
    lightning(ledSystem, screen, {
      randomSeed: 10,
      totalBolts: 400,
      totalDuration: 10,
    })
  );

  // Spawn chaos rectangles animation
  spawn(
    chaosRectangles(screen, {
      randomSeed: 99,
      quantity: 200, // Number of rectangles to spawn
      density: 4, // Max size: 1-4 grid units
      speed: 4, // 2x speed multiplier
      totalDuration: 10,
    })
  );

  yield* waitFor(12);
});
