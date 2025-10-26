import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  Color,
  waitFor,
  useRandom,
  spawn,
  all,
  easeInQuad,
  easeOutQuad,
} from "@motion-canvas/core";
import { GRID_BLUE, GRID_YELLOW, LED_BLUE } from "@/lib/design-system";
import lightning from "@/lib/effects/lightning";
import chaosRectangles from "@/lib/effects/chaos-rectangles";
import makePolice from "@/lib/scenes/police";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom();

  const { horizontalLines, verticalLines, rects } = makePolice(
    ledSystem,
    screen
  );

  // Spawn chaotic line removal animation
  const allLines = [...horizontalLines, ...verticalLines];
  const lineCount = allLines.length;

  // Create a shuffled array of indices for random removal
  const indices = Array.from({ length: lineCount }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(randomGenerator.nextFloat() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Animate each line with slight time offsets for chaos
  indices.map((idx, order) => {
    const line = allLines[idx];
    const delay = (order / lineCount) * 0.3; // Spread over 0.3s
    const flickerDuration = 0.05 + randomGenerator.nextFloat() * 0.05; // 0.05-0.1s
    const fadeDuration = 0.1 + randomGenerator.nextFloat() * 0.1; // 0.1-0.2s

    spawn(function* () {
      yield* waitFor(delay);

      // Quick flicker to bright blue
      yield* line.stroke(
        new Color(GRID_YELLOW).brighten(2),
        flickerDuration,
        easeOutQuad
      );

      // Fade away
      yield* line.opacity(0, fadeDuration, easeInQuad);
    });
  });

  // Spawn chaotic rect fill flickering animation
  const rectCount = rects.length;

  // Create a shuffled array of indices for random removal
  const rectIndices = Array.from({ length: rectCount }, (_, i) => i);
  for (let i = rectIndices.length - 1; i > 0; i--) {
    const j = Math.floor(randomGenerator.nextFloat() * (i + 1));
    [rectIndices[i], rectIndices[j]] = [rectIndices[j], rectIndices[i]];
  }

  // Animate each rect with slight time offsets for chaos
  rectIndices.map((idx, order) => {
    const rect = rects[idx];
    const delay = (order / rectCount) * 0.3; // Spread over 0.3s
    const flickerDuration = 0.05 + randomGenerator.nextFloat() * 0.05; // 0.05-0.1s
    const fadeDuration = 0.1 + randomGenerator.nextFloat() * 0.1; // 0.1-0.2s

    spawn(function* () {
      yield* waitFor(delay);

      // Quick flicker to bright yellow
      yield* rect.fill(
        new Color(GRID_YELLOW).brighten(2),
        flickerDuration,
        easeOutQuad
      );

      // Fade away
      yield* rect.opacity(0, fadeDuration, easeInQuad);
    });
  });

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
