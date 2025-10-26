import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { waitFor } from "@motion-canvas/core";
import makePolice from "@/lib/scenes/police";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const {} = makePolice(ledSystem, screen);

  // TODO: Add transition to school

  yield* waitFor(10);
});
