import { makeScene2D, Rect } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  chain,
  Color,
  createRef,
  createRefArray,
  linear,
  loop,
  waitFor,
} from "@motion-canvas/core";
import { GRID_BLUE, GRID_LINE_WIDTH, LED_BLUE } from "@/lib/design-system";
import {
  positionToRect,
  sequenceColumns,
  sequenceRows,
} from "@/lib/wall-coordinate-system";

const INHALE_DURATION = 3;
const HOLD_DURATION = 3;
const EXHALE_DURATION = 3;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const rect = createRef<Rect>();
  const rects = createRefArray<Rect>();
  const { x, y, width, height } = positionToRect([0, 0], 15, 5);

  const blackRects = sequenceRows(false).flatMap((row) =>
    sequenceColumns(false).map((column) => positionToRect([column, row], 1, 1))
  );

  screen().add([
    <Rect
      x={x}
      y={y}
      width={width + GRID_LINE_WIDTH}
      height={height + GRID_LINE_WIDTH}
      fill={GRID_BLUE}
    />,
    ...blackRects.map(({ x, y, width, height }) => (
      <Rect
        ref={rects}
        x={x}
        y={y}
        width={width - GRID_LINE_WIDTH}
        height={height - GRID_LINE_WIDTH}
        fill={new Color("#000000ff")}
      />
    )),
  ]);

  yield* loop(10, () =>
    chain(
      all(
        ...rects.map((rect) => rect.scale(0.9, INHALE_DURATION, linear)),
        ledSystem().fillAll(LED_BLUE.brighten(3), INHALE_DURATION)
      ),
      waitFor(HOLD_DURATION),
      all(
        ...rects.map((rect) => rect.scale(1, EXHALE_DURATION, linear)),
        ledSystem().fillAll(LED_BLUE, EXHALE_DURATION)
      ),
      waitFor(1)
    )
  );
});
