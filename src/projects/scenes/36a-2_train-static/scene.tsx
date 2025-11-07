import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { waitFor } from "@motion-canvas/core";
import { setupTrainStructure } from "@/lib/scenes/train";

export default makeScene2D(function* (view) {
  const { screen, ledSystem } = setupLEDScene(view);

  setupTrainStructure(screen, ledSystem);

  yield* waitFor(2);
});
