import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { loop } from "@motion-canvas/core";
import makeBreathingBlue from "@/lib/effects/breathing-blue";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const breathing = makeBreathingBlue(ledSystem);

  screen().add(breathing.components);

  yield* loop(10, breathing.animate);
});
