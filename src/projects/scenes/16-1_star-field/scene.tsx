import { Circle, makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  Color,
  createRef,
  createRefArray,
  easeInOutCubic,
  easeInOutQuad,
  loop,
  spawn,
  useRandom,
  waitFor,
} from "@motion-canvas/core";
import {
  GRID_BLACK,
  GRID_BLUE,
  GRID_GREEN,
  GRID_WHITE,
  LED_BLUE,
  LED_OFF,
  LED_ON,
} from "@/lib/design-system";

Color.createLerp;

// Animation timing parameters
const INTRO_DURATION = 5; // Duration for stars to appear initially
const LOOP_DURATION = 10; // Duration of the looping segment
const FADE_OUT_DURATION = 2; // Duration to fade out grid
const STAR_COUNT = 400; // Number of stars in the sky
const COMET_INTERVAL = 1; // Seconds between comets

// Star appearance parameters
const STAR_COLORS = [
  new Color("#ffffff"), // Pure white
  new Color("#f0f0f0"), // Light gray
  new Color("#e8e8e8"), // Medium gray
  new Color("#fffacd"), // Pale yellow
  new Color("#fff8dc"), // Cornsilk
  new Color("#fafafa"), // Very light gray
];

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom();

  // Helper to pick random from array
  function randomChoice<T>(array: T[]): T {
    const index = randomGenerator.nextInt(0, array.length - 1);
    return array[index];
  }

  const { fill, fillAnimated } = createFilledGrid(ledSystem, screen);

  // Start with blue grid - no animation needed at start
  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  yield* fillAnimated(
    { gridColor: GRID_WHITE, ledColor: LED_ON },
    FADE_OUT_DURATION
  );

  yield* waitFor(0.5);

  // Create stars (circles on the projector)
  const starRefs = createRefArray<Circle>();
  const starData: Array<{
    x: number;
    y: number;
    size: number;
    color: Color;
    twinkleSpeed: number;
    twinklePhase: number;
    opacity: number;
  }> = [];

  // Generate star data
  for (let i = 0; i < STAR_COUNT; i++) {
    const x = randomGenerator.nextFloat(-960, 960); // 1920 / 2 = 960
    const y = randomGenerator.nextFloat(-600, 600); // 1200 / 2 = 600
    const size = randomGenerator.nextFloat(2, 3.5);
    const color = randomChoice(STAR_COLORS);
    const twinkleSpeed = randomGenerator.nextFloat(1, 9); // Duration for one twinkle cycle
    const twinklePhase = randomGenerator.nextFloat(0, Math.PI * 2); // Random starting phase
    const opacity = randomGenerator.nextFloat(0.4, 0.9); // Base opacity varies

    starData.push({ x, y, size, color, twinkleSpeed, twinklePhase, opacity });

    screen().add(
      <Circle
        ref={starRefs}
        x={x}
        y={y}
        width={size}
        height={size}
        fill={color}
        opacity={0}
      />
    );
  }

  // Fade out grid and blue LEDs
  yield* fillAnimated(
    {
      ledColor: LED_OFF,
      gridColor: GRID_BLACK,
    },
    FADE_OUT_DURATION
  );

  // Fade in stars with staggered timing over INTRO_DURATION
  const starAppearances: Array<() => Generator<any, any, any>> = [];
  for (let i = 0; i < starRefs.length; i++) {
    const star = starRefs[i];
    const delay = randomGenerator.nextFloat(0, INTRO_DURATION * 0.8);
    const duration = randomGenerator.nextFloat(0.5, 1.5);

    starAppearances.push(function* () {
      yield* waitFor(delay);
      yield* star.opacity(starData[i].opacity, duration);
    });
  }

  yield* all(...starAppearances.map((fn) => fn()));

  // Helper function to create twinkling effect for a star
  function* twinkleStar(index: number) {
    const star = starRefs[index];
    const data = starData[index];
    const baseOpacity = data.opacity;
    yield* loop(function* () {
      yield* all(
        star.opacity(baseOpacity * 0.2, data.twinkleSpeed / 2, easeInOutQuad),
        star.width(data.size * 0.8, data.twinkleSpeed / 2, easeInOutQuad),
        star.height(data.size * 0.8, data.twinkleSpeed / 2, easeInOutQuad)
      );
      yield* all(
        star.opacity(baseOpacity, data.twinkleSpeed / 2, easeInOutQuad),
        star.width(data.size, data.twinkleSpeed / 2, easeInOutQuad),
        star.height(data.size, data.twinkleSpeed / 2, easeInOutQuad)
      );
    });
  }

  // Helper function to create a comet
  function* createComet() {
    const cometRef = createRef<Circle>();
    const startX = randomGenerator.nextInt(-960, 960);
    const startY = randomGenerator.nextInt(-700, -600); // Start from top
    const endX = startX + randomGenerator.nextInt(300, 800);
    const endY = randomGenerator.nextInt(600, 700); // End at bottom
    const size = randomGenerator.nextInt(3, 5);

    screen().add(
      <Circle
        ref={cometRef}
        x={startX}
        y={startY}
        width={size}
        height={size}
        fill={new Color("#ffffff")}
        opacity={0}
      />
    );

    // Fade in, move, fade out
    yield* all(
      cometRef().opacity(1, 0.2),
      cometRef().x(endX, 0.3, easeInOutCubic),
      cometRef().y(endY, 0.3, easeInOutCubic)
    );

    yield* cometRef().opacity(0, 0.3);
    cometRef().remove();
  }

  // Run twinkling for all stars concurrently during the loop
  starRefs.map((_, i) => spawn(twinkleStar(i)));

  // Create comets at intervals
  spawn(
    loop(function* () {
      yield* waitFor(COMET_INTERVAL);
      yield* createComet();
    })
  );

  yield* waitFor(LOOP_DURATION);
});
