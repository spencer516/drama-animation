import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { waitFor } from "@motion-canvas/core";
import { setupTrainStructure } from "@/lib/scenes/train";

export default makeScene2D(function* (view) {
  const { screen } = setupLEDScene(view);

  setupTrainStructure(screen);

  yield* waitFor(2);
});
