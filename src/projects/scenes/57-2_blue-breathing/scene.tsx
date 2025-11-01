import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, chain, linear, loop, waitFor } from "@motion-canvas/core";
import { GRID_BLUE, GRID_LINE_WIDTH, LED_BLUE } from "@/lib/design-system";

const INHALE_DURATION = 3;
const HOLD_DURATION = 3;
const EXHALE_DURATION = 3;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, fillAnimated, horizontalLines, verticalLines } =
    createFilledGrid(ledSystem, screen);

  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  const allLines = [...horizontalLines, ...verticalLines];

  yield* loop(10, () =>
    chain(
      all(
        ...allLines.map((line) =>
          line.lineWidth(GRID_LINE_WIDTH * 3, INHALE_DURATION, linear)
        ),
        ledSystem().fillAll(LED_BLUE.brighten(3), INHALE_DURATION)
      ),
      waitFor(HOLD_DURATION),
      all(
        ...allLines.map((line) =>
          line.lineWidth(GRID_LINE_WIDTH, EXHALE_DURATION, linear)
        ),
        ledSystem().fillAll(LED_BLUE, EXHALE_DURATION)
      ),
      waitFor(1)
    )
  );
});
