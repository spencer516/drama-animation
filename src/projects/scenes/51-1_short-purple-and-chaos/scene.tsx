import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { waitFor, useRandom, spawn } from "@motion-canvas/core";
import {
  GRID_PURPLE,
  GRID_RED,
  LED_OFF,
  LED_PURPLE,
  LED_RED,
} from "@/lib/design-system";
import lightning from "@/lib/effects/lightning";
import chaosRectangles from "@/lib/effects/chaos-rectangles";
import { chaoticLineRemoval } from "@/lib/effects/random-chaotic-removal";
import { positionsToDistance } from "@/lib/wall-coordinate-system";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom();

  const { fill, horizontalLines, verticalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  const excludedHLines = horizontalLines.slice(0, 2);
  const remainHLines = horizontalLines.slice(2);

  const offset = positionsToDistance([
    [0, 0],
    [0, 2],
  ]);

  verticalLines.map((line) => line.startOffset(offset));

  excludedHLines.map((line) => line.remove());

  // Initial state: Everything blue with grid
  fill({
    ledColor: LED_PURPLE,
    gridColor: GRID_PURPLE,
  });

  ledSystem().fillRow(0, LED_OFF);
  ledSystem().fillRow(1, LED_OFF);

  const allLines = [...remainHLines, ...verticalLines];
  chaoticLineRemoval(randomGenerator, allLines);

  // Spawn lightning bolt animation
  spawn(
    lightning(ledSystem, screen, {
      randomSeed: 9901,
      totalBolts: 400,
      totalDuration: 5,
      baseColor: LED_RED,
    })
  );

  // Spawn chaos rectangles animation
  spawn(
    chaosRectangles(screen, {
      randomSeed: 234,
      quantity: 200, // Number of rectangles to spawn
      density: 4, // Max size: 1-4 grid units
      speed: 4, // 2x speed multiplier
      totalDuration: 5,
      baseColor: GRID_RED,
    })
  );

  yield* waitFor(6);
});
