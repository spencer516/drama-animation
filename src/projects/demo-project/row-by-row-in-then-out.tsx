import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { Color, sequence, waitFor } from "@motion-canvas/core";
import { sequenceRows } from "@/lib/wall-coordinate-system";

export default makeScene2D(function* (view) {
  const { ledSystem } = setupLEDScene(view);

  ledSystem().fillAll(new Color("black"));

  yield* sequence(
    0.25,
    ...sequenceRows().map((row) =>
      ledSystem().fillRow(row, new Color("#699672ff"), 0.5)
    )
  );

  yield* waitFor(1);

  yield* sequence(
    0.25,
    ...sequenceRows().map((row) =>
      ledSystem().fillRow(row, new Color("black"), 0.5)
    )
  );
});
