import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { waitFor } from "@motion-canvas/core";
import { GRID_WHITE, LED_RED, LED_ON, LED_YELLOW } from "@/lib/design-system";
import ledGradientMovement from "@/lib/effects/led-gradient-movement";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill } = createFilledGrid(ledSystem, screen);

  fill({
    ledColor: LED_ON,
    gridColor: GRID_WHITE,
  });

  yield* ledGradientMovement({
    ledSystem,
    initialColor: LED_ON,
    finalColor: LED_ON,
    loopingColorStops: [LED_RED, LED_ON],
    horizontalDirection: "static",
    verticalDirection: "top-to-bottom",
    durationPerStop: 0.165,
    numLoops: 14,
  });

  yield* waitFor(2);

  yield* ledGradientMovement({
    ledSystem,
    initialColor: LED_ON,
    finalColor: LED_ON,
    loopingColorStops: [LED_RED, LED_ON],
    horizontalDirection: "static",
    verticalDirection: "bottom-to-top",
    durationPerStop: 0.165,
    numLoops: 14,
  });

  yield* waitFor(2);

  yield* ledGradientMovement({
    ledSystem,
    initialColor: LED_ON,
    finalColor: LED_ON,
    loopingColorStops: [LED_YELLOW, LED_ON],
    horizontalDirection: "left-to-right",
    verticalDirection: "static",
    durationPerStop: 0.165,
    numLoops: 14,
  });

  yield* waitFor(2);

  yield* ledGradientMovement({
    ledSystem,
    initialColor: LED_ON,
    finalColor: LED_ON,
    loopingColorStops: [LED_YELLOW, LED_ON],
    horizontalDirection: "right-to-left",
    verticalDirection: "static",
    durationPerStop: 0.165,
    numLoops: 14,
  });

  yield* waitFor(2);

  yield* ledGradientMovement({
    ledSystem,
    initialColor: LED_ON,
    finalColor: LED_ON,
    loopingColorStops: [LED_YELLOW, LED_RED],
    horizontalDirection: "left-to-right",
    verticalDirection: "static",
    durationPerStop: 0.165,
    numLoops: 14,
  });

  yield* waitFor(2);

  yield* ledGradientMovement({
    ledSystem,
    initialColor: LED_ON,
    finalColor: LED_ON,
    loopingColorStops: [LED_YELLOW, LED_RED],
    horizontalDirection: "right-to-left",
    verticalDirection: "static",
    durationPerStop: 0.165,
    numLoops: 14,
  });

  yield* ledGradientMovement({
    ledSystem,
    initialColor: LED_ON,
    finalColor: LED_ON,
    loopingColorStops: [LED_YELLOW, LED_ON, LED_RED],
    horizontalDirection: "left-to-right",
    verticalDirection: "bottom-to-top",
    durationPerStop: 0.165,
    numLoops: 14,
  });

  yield* waitFor(2);

  yield* ledGradientMovement({
    ledSystem,
    initialColor: LED_ON,
    finalColor: LED_ON,
    loopingColorStops: [LED_YELLOW, LED_ON, LED_RED],
    horizontalDirection: "right-to-left",
    verticalDirection: "top-to-bottom",
    durationPerStop: 0.165,
    numLoops: 14,
  });

  yield* waitFor(0.05);
});
