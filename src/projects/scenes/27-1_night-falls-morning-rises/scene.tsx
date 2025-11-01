import { Gradient, makeScene2D, Rect } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  Color,
  createRef,
  createRefArray,
  linear,
  waitFor,
} from "@motion-canvas/core";
import {
  GRID_BLACK,
  GRID_BLUE,
  GRID_GREEN,
  GRID_LINE_WIDTH,
  GRID_RED,
  LED_BLUE,
  LED_OFF,
} from "@/lib/design-system";
import {
  positionsToDistance,
  positionToCoordinates,
  positionToRect,
  sequenceColumns,
  sequenceRows,
} from "@/lib/wall-coordinate-system";

const GRADIENT_COLORS = [
  GRID_BLUE,
  GRID_BLUE,
  "#4B00FF",
  "#8A00FF",
  "#FF00AA",
  "#FF5500",
  "#FF2200",
  "#000000",
  "#000000",
  "#000000",
  "#000000",
  "#220000",
  "#FF2200",
  "#FF5500",
  "#FFAA33",
  "#FFDFFF",
  GRID_BLUE,
  GRID_BLUE,
];

const SUNSET_SUNRISE_DURATION = 10;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const rect = createRef<Rect>();
  const rects = createRefArray<Rect>();
  const { x, y, width, height } = positionToRect([0, 0], 15, 5);

  const blackRects = sequenceRows(false).flatMap((row) =>
    sequenceColumns(false).map((column) => positionToRect([column, row], 1, 1))
  );

  const halfLineWidth = GRID_LINE_WIDTH / 2;
  const [ogX, ogY] = positionToCoordinates([0, 0]);
  const topLeft = [ogX - halfLineWidth, ogY - halfLineWidth] as [
    number,
    number
  ];

  const totalGradientHeight = height * (GRADIENT_COLORS.length - 1);
  const halfHeight = totalGradientHeight / 2;

  const stops = GRADIENT_COLORS.map((color, index) => ({
    offset: index / (GRADIENT_COLORS.length - 1),
    color,
  }));

  screen().add([
    <Rect
      x={x}
      y={y}
      width={width + GRID_LINE_WIDTH}
      height={height + GRID_LINE_WIDTH}
      clip
    >
      <Rect
        ref={rect}
        topLeft={topLeft}
        width={width + GRID_LINE_WIDTH}
        height={totalGradientHeight + GRID_LINE_WIDTH}
        clip
        fill={
          new Gradient({
            type: "linear",
            from: [0, y - halfHeight],
            to: [0, y + halfHeight],
            stops,
          })
        }
      />
    </Rect>,
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

  const currentY = rect().y();
  yield* rect().y(
    currentY - totalGradientHeight + height,
    SUNSET_SUNRISE_DURATION,
    linear
  );
});
