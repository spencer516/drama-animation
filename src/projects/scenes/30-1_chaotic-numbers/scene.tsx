import { makeScene2D, Txt } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, createRef, spawn, waitFor } from "@motion-canvas/core";
import { GRID_BLACK, GRID_BLUE, LED_BLUE, LED_OFF } from "@/lib/design-system";
import makeChaoticNumbers from "@/lib/effects/chaotic-numbers";

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

  const chaoticNumbers = makeChaoticNumbers({
    numbers: NUMBERS_AND_FORMULAS,
    randomSeed: 12345112,
  });

  const addressRef = createRef<Txt>();

  screen().add([
    <Txt
      ref={addressRef}
      text="451c Chapter Road, London, NW2 5NG"
      fontSize={60}
      fill="white"
      opacity={0}
    />,
    ...chaoticNumbers.components,
  ]);

  yield* chaoticNumbers.animateIn();

  yield* waitFor(10);

  yield* all(
    addressRef().opacity(1, 2),
    addressRef().scale(1.2, 2),
    chaoticNumbers.animateOut()
  );

  yield* waitFor(3);
});
