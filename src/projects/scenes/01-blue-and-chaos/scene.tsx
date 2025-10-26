import { Line, makeScene2D, Rect } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  Color,
  createRef,
  waitFor,
  useRandom,
  spawn,
  all,
  easeInQuad,
  easeOutQuad,
  easeOutCubic,
  easeInOutQuad,
} from "@motion-canvas/core";
import {
  positionToCoordinates,
  Position,
  ColumnPosition,
  RowPosition,
  coordinatesToDistance,
} from "@/lib/wall-coordinate-system";
import {
  GRID_BLUE,
  GRID_LINE_WIDTH,
  LED_BLUE,
  LED_OFF,
} from "@/lib/design-system";
import lightning from "@/lib/effects/lightning";

// White color palette for chaos - varying brightness
const WHITE_BRIGHT = new Color("#ffffff");
const WHITE_HIGH = new Color("#e6e6e6");
const WHITE_MID = new Color("#cccccc");
const WHITE_LOW = new Color("#999999");
const WHITE_DIM = new Color("#666666");

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
  spawn(function* () {
    const allLines = [...horizontalLines, ...verticalLines];
    const lineCount = allLines.length;

    // Create a shuffled array of indices for random removal
    const indices = Array.from({ length: lineCount }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(randomGenerator.nextFloat() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Animate each line with slight time offsets for chaos
    yield* all(
      ...indices.map((idx, order) => {
        const line = allLines[idx];
        const delay = (order / lineCount) * 0.3; // Spread over 0.3s
        const flickerDuration = 0.05 + randomGenerator.nextFloat() * 0.05; // 0.05-0.1s
        const fadeDuration = 0.1 + randomGenerator.nextFloat() * 0.1; // 0.1-0.2s

        return spawn(function* () {
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
      })
    );
  });

  // Spawn lightning bolt animation
  spawn(
    lightning(ledSystem, screen, {
      randomSeed: 17,
      totalBolts: 200,
      totalDuration: 10,
    })
  );

  yield* waitFor(12);
});
