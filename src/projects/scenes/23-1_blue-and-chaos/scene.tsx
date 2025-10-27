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
import { GRID_BLUE, LED_BLUE } from "@/lib/design-system";
import lightning from "@/lib/effects/lightning";
import chaosRectangles from "@/lib/effects/chaos-rectangles";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom();

  const { fill, horizontalLines, verticalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  // Initial state: Everything blue with grid
  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

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
        new Color(GRID_BLUE).brighten(2),
        flickerDuration,
        easeOutQuad
      );

      // Fade away
      yield* line.opacity(0, fadeDuration, easeInQuad);
    });
  });

  // Spawn lightning bolt animation
  spawn(
    lightning(ledSystem, screen, {
      randomSeed: 2,
      totalBolts: 300,
      totalDuration: 10,
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
    })
  );

  yield* waitFor(12);
});
