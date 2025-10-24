import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { Color, sequence, waitFor } from "@motion-canvas/core";
import { sequenceRows } from "@/lib/wall-coordinate-system";

export default makeScene2D(function* (view) {
  const { ledSystem } = setupLEDScene(view);

  ledSystem().fillAll(new Color("black"));

  const oneFrame = 1 / 60;

  yield* waitFor(oneFrame * 2);

  for (const [light] of ledSystem().iterate()) {
    light().fill(new Color("red"));
    yield* waitFor(oneFrame);
  }
});
