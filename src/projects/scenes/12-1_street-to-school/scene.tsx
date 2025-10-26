import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { waitFor } from "@motion-canvas/core";
import makeStreet from "@/lib/scenes/street";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const {} = makeStreet(ledSystem, screen);

  // TODO: Add transition to home

  yield* waitFor(10);
});
