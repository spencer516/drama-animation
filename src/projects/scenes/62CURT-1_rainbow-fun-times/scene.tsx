import { Line, makeScene2D, Rect } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  chain,
  Color,
  createRef,
  createRefArray,
  linear,
  loop,
  Reference,
  sequence,
  spawn,
  useRandom,
  waitFor,
} from "@motion-canvas/core";
import { GRID_LINE_WIDTH, LED_OFF } from "@/lib/design-system";
import {
  allPositions,
  ColumnPosition,
  positionsToDistance,
  positionToCoordinates,
  positionToRect,
  RowPosition,
  sequenceColumns,
  sequenceRows,
} from "@/lib/wall-coordinate-system";

const COLORS = [
  "#FF0000FF",
  "#FF7F00FF",
  "#FFFF00FF",
  "#00FF00FF",
  "#0000FFFF",
  "#8B00FFFF",
];

const HEIGHT = positionsToDistance([
  [0, 0],
  [0, 5],
]);
const WIDTH = positionsToDistance([
  [0, 0],
  [15, 0],
]);

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const random = useRandom();

  const horizontalLines = createRefArray<Line>();
  const verticalLines = createRefArray<Line>();
  const { rects, boxColumnRefs, boxRowRefs } = makeBoxes();

  screen().add([
    ...sequenceColumns().map((column) => (
      <Line
        ref={verticalLines}
        points={[
          positionToCoordinates([column, 0]),
          positionToCoordinates([column, 5]),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={getColorForRelativeColumn(column)}
        startOffset={HEIGHT}
      />
    )),
    ...sequenceRows().map((row) => (
      <Line
        ref={horizontalLines}
        points={[
          positionToCoordinates([0, row]),
          positionToCoordinates([15, row]),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={getColorForRelativeRow(row)}
        endOffset={WIDTH}
      />
    )),
    ...rects,
  ]);

  yield* sequence(
    0.13,
    ...horizontalLines.reverse().map((line) => line.endOffset(0, 0.1))
  );

  const leftVertical = verticalLines.slice(0, 8);
  const rightVertical = verticalLines.slice(8).reverse();

  yield* all(
    sequence(0.13, ...leftVertical.map((line) => line.startOffset(0, 0.1))),
    sequence(0.13, ...rightVertical.map((line) => line.startOffset(0, 0.1)))
  );

  allPositions().map((position) =>
    spawn(function* () {
      const color = getColorForRelativePosition(...position);
      yield* waitFor(random.nextFloat(0, 2));
      yield* loop(function* () {
        yield* chain(
          ledSystem().fillAt(position, color, random.nextFloat(0.3, 0.6)),
          waitFor(0.2),
          ledSystem().fillAt(position, LED_OFF, random.nextFloat(0.3, 0.6)),
          waitFor(random.nextFloat(0.05, 0.3))
        );
      });
    })
  );

  for (const [, refs] of boxColumnRefs) {
    const sortedRefs = [...refs].reverse();

    spawn(function* () {
      yield* loop(function* () {
        yield* waitFor(random.nextFloat(0, 2));
        yield* sequence(
          random.nextFloat(0.05, 0.3),
          ...sortedRefs.map((ref) =>
            chain(
              ref().opacity(1, random.nextFloat(0.3, 0.6), linear),
              waitFor(0.2),
              ref().opacity(0, random.nextFloat(0.3, 0.6), linear)
            )
          )
        );
      });
    });
  }

  yield* waitFor(30);
});

function makeBoxes() {
  const allBoxes = sequenceRows(false).flatMap((row) =>
    sequenceColumns(false).map((column) => makeBox(column, row))
  );
  const rects = allBoxes.map((box) => box.rect);

  const boxColumnRefs: Map<ColumnPosition, Reference<Rect>[]> = allBoxes.reduce(
    (map, box) => {
      const list = map.get(box.column) ?? [];
      map.set(box.column, [...list, box.ref]);
      return map;
    },
    new Map()
  );

  const boxRowRefs: Map<RowPosition, Reference<Rect>[]> = allBoxes.reduce(
    (map, box) => {
      const list = map.get(box.row) ?? [];
      map.set(box.row, [...list, box.ref]);
      return map;
    },
    new Map()
  );

  const allBoxRefs = allBoxes.map((box) => box.ref);

  return { rects, boxColumnRefs, boxRowRefs, allBoxRefs };
}

function makeBox(column: ColumnPosition, row: RowPosition) {
  const ref = createRef<Rect>();
  const { x, y, width, height } = positionToRect([column, row], 1, 1);

  const rect = (
    <Rect
      ref={ref}
      x={x}
      y={y}
      width={width}
      height={height}
      fill={getColorForRelativePosition(column + 0.5, row + 0.5)}
      opacity={0}
    />
  );

  return { ref, rect, column, row };
}

const COLOR_LEN = COLORS.length;
const COLOR_INTERPOLATION = "hsl";

function getColorForRelativePosition(column: number, row: number) {
  const columnColor = getColorForRelativeColumn(column);
  const rowColor = getColorForRelativeRow(row);

  return Color.lerp(columnColor, rowColor, 0.5, COLOR_INTERPOLATION);
}

function getColorForRelativeColumn(column: number) {
  return getColorForPercent(column / 16);
}

function getColorForRelativeRow(row: number) {
  return getColorForPercent(row / 6);
}

function getColorForPercent(percent: number) {
  const colorIndex = percent * COLOR_LEN;

  const lowerIndex = Math.floor(colorIndex);
  const upperIndex = Math.ceil(colorIndex);
  const localProgress = colorIndex - lowerIndex;

  const lowerColor = COLORS[lowerIndex];
  const upperColor = COLORS[upperIndex];

  return Color.lerp(lowerColor, upperColor, localProgress, COLOR_INTERPOLATION);
}
