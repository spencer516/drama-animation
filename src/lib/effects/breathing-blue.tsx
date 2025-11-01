import { Rect } from "@motion-canvas/2d";
import {
  all,
  chain,
  Color,
  createRef,
  createRefArray,
  linear,
  Reference,
  waitFor,
} from "@motion-canvas/core";
import {
  positionToRect,
  sequenceColumns,
  sequenceRows,
} from "../wall-coordinate-system";
import { GRID_BLUE, GRID_LINE_WIDTH, LED_BLUE } from "../design-system";
import { LEDSystem } from "../LEDSystem";

const INHALE_DURATION = 3;
const HOLD_DURATION = 0.2;
const EXHALE_DURATION = 2;

export default function makeBreathingBlue(ledSystem: Reference<LEDSystem>) {
  const rect = createRef<Rect>();
  const rects = createRefArray<Rect>();
  const { x, y, width, height } = positionToRect([0, 0], 15, 5);

  const blackRects = sequenceRows(false).flatMap((row) =>
    sequenceColumns(false).map((column) => positionToRect([column, row], 1, 1))
  );

  const components = [
    <Rect
      ref={rect}
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
  ];

  const animate = () =>
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
      waitFor(HOLD_DURATION)
    );

  return { components, animate };
}
