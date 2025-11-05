import {
  all,
  Color,
  createRef,
  easeInQuad,
  easeOutQuad,
  Reference,
  spawn,
  useRandom,
  waitFor,
  ThreadGenerator,
} from "@motion-canvas/core";
import { Rect } from "@motion-canvas/2d";
import {
  ColumnPosition,
  Position,
  positionToRect,
  RowPosition,
} from "../wall-coordinate-system";

type Params = {
  randomSeed: number;
  quantity: number; // Base number of rectangles to spawn
  density: number; // Multiplier for quantity (more density = more rectangles)
  speed: number; // Speed multiplier (higher = faster flicker/fade)
  totalDuration: number;
  baseColor?: Color;
};

// White color palette for chaos rectangles
const WHITE_BRIGHT = new Color("#ffffff");

function makeColors(color: Color) {
  return [
    color,
    color.darken(0.49),
    color.darken(1),
    color.darken(1.91),
    color.darken(3.15),
  ];
}

export default function* chaosRectangles(
  screen: Reference<Rect>,
  { randomSeed, quantity, density, speed, totalDuration, baseColor }: Params
): ThreadGenerator {
  const randomGenerator = useRandom(randomSeed);
  const COLORS = makeColors(baseColor ?? WHITE_BRIGHT);

  // Generate a random 1x1 rectangle position
  const generateRandomRect = (): {
    position: Position;
    width: number;
    height: number;
  } => {
    // Always 1x1 grid unit
    const widthUnits = 1;
    const heightUnits = 1;

    // Random position
    const col = Math.floor(randomGenerator.nextFloat() * 15) as ColumnPosition;
    const row = Math.floor(randomGenerator.nextFloat() * 5) as RowPosition;

    return {
      position: [col, row],
      width: widthUnits,
      height: heightUnits,
    };
  };

  // Create a single chaos rectangle that flickers and fades
  const createChaosRect = function* () {
    const { position, width, height } = generateRandomRect();
    const rectData = positionToRect(position, width, height);

    // Random white color
    const color =
      COLORS[Math.floor(randomGenerator.nextFloat() * COLORS.length)];

    const rect = createRef<Rect>();
    screen().add(
      <Rect
        ref={rect}
        x={rectData.x}
        y={rectData.y}
        width={rectData.width}
        height={rectData.height}
        fill={color}
        opacity={0}
      />
    );

    // Random durations based on speed
    const fadeInDuration = (0.05 + randomGenerator.nextFloat() * 0.1) / speed; // 0.05-0.15s
    const flickerCount = 1 + Math.floor(randomGenerator.nextFloat() * 3); // 1-3 flickers
    const flickerDuration = (0.03 + randomGenerator.nextFloat() * 0.05) / speed; // 0.03-0.08s
    const holdDuration = (0.1 + randomGenerator.nextFloat() * 0.2) / speed; // 0.1-0.3s
    const fadeOutDuration = (0.1 + randomGenerator.nextFloat() * 0.2) / speed; // 0.1-0.3s

    // Fade in
    yield* rect().opacity(1, fadeInDuration, easeOutQuad);

    // Flicker
    for (let i = 0; i < flickerCount; i++) {
      yield* rect().opacity(0.3, flickerDuration, easeInQuad);
      yield* rect().opacity(1, flickerDuration, easeOutQuad);
    }

    // Hold
    yield* waitFor(holdDuration);

    // Fade out
    yield* rect().opacity(0, fadeOutDuration, easeInQuad);

    // Remove
    rect().remove();
  };

  // Calculate total rectangles based on quantity * density
  const totalRectangles = quantity * density;
  const spawnInterval = totalDuration / totalRectangles;

  for (let i = 0; i < totalRectangles; i++) {
    spawn(function* () {
      // Stagger spawns with some randomness
      yield* waitFor(i * spawnInterval + randomGenerator.nextFloat() * 0.2);
      yield* createChaosRect();
    });
  }
}
