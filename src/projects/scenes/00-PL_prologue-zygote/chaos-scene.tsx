import { Line, Rect, makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  Color,
  spawn,
  waitFor,
  useRandom,
  all,
  createRef,
  easeInQuad,
  easeOutQuad,
  easeInCubic,
  easeOutCubic,
} from "@motion-canvas/core";
import {
  Position,
  ColumnPosition,
  RowPosition,
  positionToCoordinates,
  coordinatesToDistance,
} from "@/lib/wall-coordinate-system";
import { LED_OFF, GRID_LINE_WIDTH } from "@/lib/design-system";
import lightning from "@/lib/effects/lightning";
import chaosRectangles from "@/lib/effects/chaos-rectangles";

// Red color palette for chaos
const RED_BRIGHT = new Color("#ff0000");
const RED_ORANGE = new Color("#ff3300");
const RED_CRIMSON = new Color("#dc143c");
const RED_DARK = new Color("#8b0000");
const RED_PINK = new Color("#ff1744");
const RED_BLOOD = new Color("#660000");

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom();

  // INITIAL SHOCK: Everything blazes red instantly
  yield* all(
    ...Array.from({ length: 16 }, (_, col) =>
      ledSystem().fillColumn(col as ColumnPosition, RED_BRIGHT, 0.05)
    )
  );

  // Draw all grid lines
  const gridLines: Line[] = [];

  // Vertical lines
  for (let col = 0; col <= 15; col++) {
    const lineRef = createRef<Line>();
    const startCoords = positionToCoordinates([col as ColumnPosition, 0]);
    const endCoords = positionToCoordinates([col as ColumnPosition, 5]);

    screen().add(
      <Line
        ref={lineRef}
        points={[startCoords, endCoords]}
        stroke={RED_BRIGHT}
        lineWidth={GRID_LINE_WIDTH}
        lineCap="round"
      />
    );
    gridLines.push(lineRef());
  }

  // Horizontal lines
  for (let row = 0; row <= 5; row++) {
    const lineRef = createRef<Line>();
    const startCoords = positionToCoordinates([0, row as RowPosition]);
    const endCoords = positionToCoordinates([15, row as RowPosition]);

    screen().add(
      <Line
        ref={lineRef}
        points={[startCoords, endCoords]}
        stroke={RED_BRIGHT}
        lineWidth={GRID_LINE_WIDTH}
        lineCap="round"
      />
    );
    gridLines.push(lineRef());
  }

  // Hold the shock
  yield* waitFor(0.5);

  // Fade out the grid lines as chaos begins
  spawn(function* () {
    yield* all(...gridLines.map((line) => line.opacity(0, 1.5)));
    gridLines.forEach((line) => line.remove());
  });

  // Begin the devolution into chaos
  yield* waitFor(0.3);

  spawn(
    lightning(ledSystem, screen, {
      randomSeed: 98,
      totalBolts: 1000,
      totalDuration: 27,
      baseColor: new Color("red"),
    })
  );

  spawn(
    chaosRectangles(screen, {
      randomSeed: 2,
      quantity: 400, // Number of rectangles to spawn
      density: 4, // Max size: 1-4 grid units
      speed: 4, // 2x speed multiplier
      totalDuration: 27,
      baseColor: new Color("red"),
    })
  );

  yield* waitFor(27);
});
