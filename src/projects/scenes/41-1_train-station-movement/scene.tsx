import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { loop, waitFor } from "@motion-canvas/core";
import {
  GRID_BLACK,
  GRID_BLUE,
  GRID_WHITE,
  LED_BLUE,
  LED_ON,
  LED_PURPLE,
} from "@/lib/design-system";
import ledGradientMovement from "@/lib/effects/led-gradient-movement";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, horizontalLines, verticalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  fill({
    ledColor: LED_ON,
    gridColor: GRID_BLACK,
  });

  const tweenGradient = ledGradientMovement({
    ledSystem,
    colorStops: [LED_ON, LED_BLUE, LED_PURPLE],
    horizontalDirection: "left-to-right",
    verticalDirection: "static",
    durationPerStop: 0.2,
    spread: 2,
    numLoops: 4,
  });

  yield* loop(4, tweenGradient);

  yield* waitFor(0.05);
});
