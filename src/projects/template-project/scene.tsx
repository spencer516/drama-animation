import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { Color, sequence, waitFor } from "@motion-canvas/core";
import { sequenceRows } from "@/lib/wall-coordinate-system";

export default makeScene2D(function* (view) {
  const { ledSystem } = setupLEDScene(view);

  ledSystem().fillAll(new Color("black"));
});
