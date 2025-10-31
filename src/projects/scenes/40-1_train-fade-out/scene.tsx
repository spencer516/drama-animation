import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { all, waitFor } from "@motion-canvas/core";
import { setupTrainStructure } from "@/lib/scenes/train";

const TRANSITION_DURATION = 0.5;

export default makeScene2D(function* (view) {
  const { screen } = setupLEDScene(view);

  const { horizontalLines, verticalLines, rects } = setupTrainStructure(screen);

  yield* all(
    ...[...horizontalLines, ...verticalLines, ...rects].map((obj) =>
      obj.opacity(0, TRANSITION_DURATION)
    )
  );

  yield* waitFor(0.2);
});
