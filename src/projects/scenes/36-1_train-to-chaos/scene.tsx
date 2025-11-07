import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { spawn, useRandom, waitFor } from "@motion-canvas/core";
import { GRID_BLUE, LED_BLUE } from "@/lib/design-system";
import { setupTrainStructure } from "@/lib/scenes/train";
import {
  chaoticLineRemoval,
  chaoticRectRemoval,
} from "@/lib/effects/random-chaotic-removal";
import lightning from "@/lib/effects/lightning";
import chaosRectangles from "@/lib/effects/chaos-rectangles";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom();

  const { horizontalLines, verticalLines, rects } = setupTrainStructure(
    screen,
    ledSystem
  );

  const allLines = [...horizontalLines, ...verticalLines];

  chaoticLineRemoval(randomGenerator, allLines);

  chaoticRectRemoval(randomGenerator, rects);

  // Spawn lightning bolt animation
  spawn(
    lightning(ledSystem, screen, {
      randomSeed: 105,
      totalBolts: 300,
      totalDuration: 10,
    })
  );

  // Spawn chaos rectangles animation
  spawn(
    chaosRectangles(screen, {
      randomSeed: 88,
      quantity: 100, // Number of rectangles to spawn
      density: 4, // Max size: 1-4 grid units
      speed: 4, // 2x speed multiplier
      totalDuration: 10,
    })
  );

  yield* waitFor(12);
});
