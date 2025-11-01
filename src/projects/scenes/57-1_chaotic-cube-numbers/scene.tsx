import { makeScene2D, Txt } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, createRef, delay, spawn, waitFor } from "@motion-canvas/core";
import { GRID_BLACK, GRID_BLUE, LED_BLUE, LED_OFF } from "@/lib/design-system";
import makeChaoticNumbers from "@/lib/effects/chaotic-numbers";

const NUMBERS_AND_FORMULAS = [
  "1",
  "8",
  "27",
  "64",
  "125",
  "216",
  "343",
  "512",
  "729",
  "1000",
  "1331",
  // Chaotic elements after 1331
  "∇²ψ",
  "Σ∞",
  "e^πi = -1",
  "φ = 1.618...",
  "∫∞",
  "√-1",
  "∂/∂t",
  "λx.x",
  "∮",
  "Δt→0",
  "NaN",
  "lim→∞",
  "∞/0",
];

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, fillAnimated } = createFilledGrid(ledSystem, screen);

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
    randomSeed: 624987,
  });

  screen().add(chaoticNumbers.components);

  yield* chaoticNumbers.animateIn();

  yield* waitFor(0.3);

  yield* all(
    chaoticNumbers.animateOut(),
    delay(
      0.3,
      fillAnimated(
        {
          ledColor: LED_BLUE,
          gridColor: GRID_BLUE,
        },
        2
      )
    )
  );

  yield* waitFor(1);
});
