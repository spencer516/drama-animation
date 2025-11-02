import { Img, Line, makeScene2D, Node, Path } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  createRef,
  createRefArray,
  delay,
  linear,
  waitFor,
} from "@motion-canvas/core";
import {
  GRID_BLUE,
  GRID_LINE_WIDTH,
  GRID_WHITE,
  LED_BLUE,
  LED_OFF,
} from "@/lib/design-system";
import {
  Position,
  positionsToDistance,
  positionToCoordinates,
  sequenceColumns,
  sequenceRows,
} from "@/lib/wall-coordinate-system";
import extractSplines from "@/lib/extract-splines";

const DOG_SPLINE = extractSplines(`
  <?xml version="1.0" encoding="UTF-8"?>
  <svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650.11 336.63">
    <path d="M495.08,35.47c82.24,45.55,98.28,83.33,103.44,131.09,2.59,3.32,45.69,53.93,46.55,74.67,1.3,57.73-31.48,96.52-121.54,89.61,46.04-49.55,98.58-62.69,50.86-124.45-15.14,11.86-35.53,24.3-54.31,25.72,1.71,8.85,12.2,28.47-4.31,37.34-12.07,6.64-123.27,35.68-133.61,36.51-10.34.83-30.17-7.47-31.89-19.91s8.62-19.91,18.96-23.23c10.34-3.32,69.82-14.93,74.13-17.42s3.45-13.28-6.03-16.59c-9.48-3.32-35.34-14.93-37.93-19.08s-47.86-1.66-56.69-1.66-21.76-1.66-26.07.83-32.76,30.7-57.76,41.48c25,7.47,40.51,6.64,46.55,13.28,43.49,52.17-85.25,35.36-98.27,26.55-11.21-5.81-35.34-24.89-18.97-41.48,16.38-16.59,54.31-32.36,56.03-43.14,1.72-10.79-10.34-12.45-33.62-5.81s-52.58,18.25-61.2,24.06c-8.62,5.81-36.2,34.85-45.69,42.31s-18.96,29.04-56.03,24.89-50-18.25-38.79-35.68c11.21-17.42,25.86-43.14,25.86-50.61s-7.76-27.12-7.76-34.72c0-7.6,4.31-43.27,14.65-52.4s36.2-34.02,56.89-42.31c20.69-8.3,72.41-31.53,90.51-40.65,87.44-31.31,182.68-47.29,306.02.83Z" style="fill: none; stroke: #000; stroke-miterlimit: 10; stroke-width: 10px;"/>
  </svg>
`).at(0);

const PERM_VERT = [0, 1, 2, 3, 4, 11, 12, 13, 14, 15];
const PARTIAL_VERT = sequenceColumns().filter(
  (column) => !PERM_VERT.includes(column)
);

const PERM_HORIZ = [0, 1, 4, 5];
const PARTIAL_HORIZ = sequenceRows().filter((row) => !PERM_HORIZ.includes(row));

const ANIMATION_SPEED = 0.5;
const DOG_FADE_SPEED = 0.2;
const DOG_DRAW_SPEED = 2;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  ledSystem().fillAll(LED_BLUE);

  const ledFadePositions = PARTIAL_VERT.flatMap((column) =>
    PARTIAL_HORIZ.map((row) => [column, row] as Position)
  );

  const permHorizontalLines = createRefArray<Line>();
  const leftHorizontalLines = createRefArray<Line>();
  const rightHorizontalLines = createRefArray<Line>();
  const dogOutline = createRef<Path>();

  const halfWidth =
    positionsToDistance([
      [0, 0],
      [15, 0],
    ]) / 2;

  const openWidth = positionsToDistance([
    [0, 0],
    [11, 0],
  ]);

  const halfHeight =
    positionsToDistance([
      [0, 0],
      [0, 5],
    ]) / 2;

  const openHeight = positionsToDistance([
    [0, 0],
    [0, 4],
  ]);

  const permVerticalLines = createRefArray<Line>();
  const topVerticalLines = createRefArray<Line>();
  const bottomVerticalLines = createRefArray<Line>();

  screen().add([
    <Node position={[-230, -120]} scale={0.7}>
      <Path
        ref={dogOutline}
        data={DOG_SPLINE}
        lineWidth={15}
        stroke={GRID_WHITE}
        start={1}
        lineCap="round"
      />
    </Node>,
    ...PERM_HORIZ.map((row) => (
      <Line
        ref={permHorizontalLines}
        points={[
          positionToCoordinates([0, row] as Position),
          positionToCoordinates([15, row] as Position),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_BLUE}
      />
    )),
    ...PARTIAL_HORIZ.map((row) => (
      <Line
        ref={leftHorizontalLines}
        points={[
          positionToCoordinates([0, row] as Position),
          positionToCoordinates([15, row] as Position),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_BLUE}
        endOffset={halfWidth}
        lineCap="round"
      />
    )),
    ...PARTIAL_HORIZ.map((row) => (
      <Line
        ref={rightHorizontalLines}
        points={[
          positionToCoordinates([0, row] as Position),
          positionToCoordinates([15, row] as Position),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_BLUE}
        startOffset={halfWidth}
        lineCap="round"
      />
    )),
    ...PERM_VERT.map((column) => (
      <Line
        ref={permVerticalLines}
        points={[
          positionToCoordinates([column, 0] as Position),
          positionToCoordinates([column, 5] as Position),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_BLUE}
        lineCap="round"
      />
    )),
    ...PARTIAL_VERT.map((column) => (
      <Line
        ref={topVerticalLines}
        points={[
          positionToCoordinates([column, 0] as Position),
          positionToCoordinates([column, 5] as Position),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_BLUE}
        endOffset={halfHeight}
        lineCap="round"
      />
    )),
    ...PARTIAL_VERT.map((column) => (
      <Line
        ref={bottomVerticalLines}
        points={[
          positionToCoordinates([column, 0] as Position),
          positionToCoordinates([column, 5] as Position),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_BLUE}
        startOffset={halfHeight}
      />
    )),
  ]);

  yield* all(
    ...ledFadePositions.map((position) =>
      ledSystem().fillAt(position, LED_OFF, ANIMATION_SPEED)
    ),
    ...leftHorizontalLines.map((line) =>
      line.endOffset(openWidth, ANIMATION_SPEED)
    ),
    ...rightHorizontalLines.map((line) =>
      line.startOffset(openWidth, ANIMATION_SPEED)
    ),
    ...topVerticalLines.map((line) =>
      line.endOffset(openHeight, ANIMATION_SPEED)
    ),
    ...bottomVerticalLines.map((line) =>
      line.startOffset(openHeight, ANIMATION_SPEED)
    ),
    delay(ANIMATION_SPEED * 0.8, dogOutline().start(0, DOG_DRAW_SPEED, linear))
  );

  yield* waitFor(1);

  yield* all(
    dogOutline().opacity(0, DOG_FADE_SPEED),
    delay(
      DOG_FADE_SPEED * 0.8,
      all(
        ...ledFadePositions.map((position) =>
          ledSystem().fillAt(position, LED_BLUE, ANIMATION_SPEED)
        ),
        ...leftHorizontalLines.map((line) =>
          line.endOffset(halfWidth, ANIMATION_SPEED)
        ),
        ...rightHorizontalLines.map((line) =>
          line.startOffset(halfWidth, ANIMATION_SPEED)
        ),
        ...topVerticalLines.map((line) =>
          line.endOffset(halfHeight, ANIMATION_SPEED)
        ),
        ...bottomVerticalLines.map((line) =>
          line.startOffset(halfHeight, ANIMATION_SPEED)
        )
      )
    )
  );

  yield* waitFor(0.2);
});
