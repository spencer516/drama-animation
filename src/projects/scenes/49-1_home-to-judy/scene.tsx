import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { waitFor } from "@motion-canvas/core";
import makeJudyHome from "@/lib/scenes/judyHome";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const {} = makeJudyHome(ledSystem, screen);

  // TODO: Add transition to home

  yield* waitFor(10);
});
