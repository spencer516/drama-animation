import { makeScene2D, Txt } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  createRefArray,
  delay,
  Random,
  spawn,
  useRandom,
  waitFor,
} from "@motion-canvas/core";
import {
  GRID_BLACK,
  GRID_BLUE,
  GRID_WHITE,
  LED_BLUE,
  LED_OFF,
} from "@/lib/design-system";
import { easeOutBounce, easeOutCubic } from "@motion-canvas/core";

const NUMBERS_AND_FORMULAS = [
  "2",
  "4",
  "8",
  "16",
  "32",
  "64",
  "128",
  "256",
  "512",
  "1024",
  "2048",
  "4096",
  // Chaotic elements after 4096
  "∫∞",
  "e^πi = -1",
  "∇²ψ",
  "while(true)",
  "Σ∞",
  "√-1",
  "φ = 1.618...",
  "∂/∂t",
  "lim→∞",
  "∮",
  "λx.x",
  "NaN",
  "∞/0",
  "console.log()",
  "Δt→0",
];

// Configuration for each number/formula
type ItemConfig = {
  text: string;
  fontSize: number;
  x: number;
  y: number;
  rotation: number;
  batchSize: number; // how many animate together
  delay: number; // seconds to wait before this batch
};

// Generate positions and configs for each item
function generateConfigs(random: Random): ItemConfig[] {
  const configs: ItemConfig[] = [];
  let totalDelay = 0;

  NUMBERS_AND_FORMULAS.forEach((text, index) => {
    const isPowerOfTwo = index <= 11; // First 12 are powers of 2
    const isChaotic = !isPowerOfTwo;

    // Batch size increases as we go
    let batchSize = 1;
    if (index >= 4) batchSize = 2;
    if (index >= 8) batchSize = 3;
    if (isChaotic) batchSize = random.nextInt(2, 4);

    // Delay between batches
    const delayPerBatch = index < 4 ? 0.8 : index < 8 ? 0.5 : 0.3;
    if (index === 0 || (index > 0 && configs[index - 1].delay !== totalDelay)) {
      // Continue same batch
    } else {
      totalDelay += delayPerBatch;
    }

    // Font size - varied considerably
    let fontSize: number;
    if (index < 3) {
      fontSize = random.nextInt(80, 120);
    } else if (index < 6) {
      fontSize = random.nextInt(120, 200);
    } else if (index < 9) {
      fontSize = random.nextInt(200, 350);
    } else if (isPowerOfTwo) {
      fontSize = random.nextInt(300, 700);
    } else {
      fontSize = random.nextInt(100, 700);
    }

    // Position and rotation
    let x: number, y: number, rotation: number;

    if (index < 2) {
      // First couple - in specific positions (boxes)
      x = index === 0 ? -400 : 400;
      y = index === 0 ? -200 : 200;
      rotation = 0;
    } else if (index < 6) {
      // Still somewhat organized
      x = random.nextInt(-600, 600);
      y = random.nextInt(-300, 300);
      rotation = random.nextInt(-15, 15);
    } else {
      // Getting wild!
      x = random.nextInt(-960, 960);
      y = random.nextInt(-600, 600);
      rotation = isChaotic
        ? random.nextInt(-180, 180)
        : random.nextInt(-90, 90);
    }

    configs.push({
      text,
      fontSize,
      x,
      y,
      rotation,
      batchSize,
      delay: totalDelay,
    });
  });

  return configs;
}

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, fillAnimated, horizontalLines, verticalLines } =
    createFilledGrid(ledSystem, screen);

  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  spawn(
    fillAnimated(
      {
        ledColor: LED_OFF,
        gridColor: GRID_BLACK,
      },
      5
    )
  );

  const randomGenerator = useRandom(15);

  const numberRefs = createRefArray<Txt>();
  const configs = generateConfigs(randomGenerator);

  screen().add(
    configs.map((config) => (
      <Txt
        ref={numberRefs}
        text={config.text}
        fontSize={config.fontSize}
        fill={GRID_WHITE}
        x={config.x}
        y={config.y}
        rotation={config.rotation}
        opacity={0}
        scale={3}
      />
    ))
  );

  yield* all(
    ...numberRefs.map((txtRef, i) =>
      delay(
        configs[i].delay,
        all(
          txtRef.scale(1, 0.6, easeOutBounce),
          txtRef.opacity(0.8, 0.4, easeOutCubic)
        )
      )
    )
  );

  yield* waitFor(0.3);

  numberRefs.map((number) => number.remove());

  yield* waitFor(3);
});
