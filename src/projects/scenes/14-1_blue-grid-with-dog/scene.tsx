import { Img, Line, makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  createRef,
  createRefArray,
  delay,
  waitFor,
} from "@motion-canvas/core";
import {
  GRID_BLUE,
  GRID_LINE_WIDTH,
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
import dogOutline from "./DogOutline_WhiteOnBlack.png";

const PERM_VERT = [0, 1, 2, 3, 4, 11, 12, 13, 14, 15];
const PARTIAL_VERT = sequenceColumns().filter(
  (column) => !PERM_VERT.includes(column)
);

const PERM_HORIZ = [0, 1, 4, 5];
const PARTIAL_HORIZ = sequenceRows().filter((row) => !PERM_HORIZ.includes(row));

const ANIMATION_SPEED = 0.5;
const DOG_FADE_SPEED = 0.2;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  ledSystem().fillAll(LED_BLUE);

  const ledFadePositions = PARTIAL_VERT.flatMap((column) =>
    PARTIAL_HORIZ.map((row) => [column, row] as Position)
  );

  const permHorizontalLines = createRefArray<Line>();
  const leftHorizontalLines = createRefArray<Line>();
  const rightHorizontalLines = createRefArray<Line>();
  const dogImage = createRef<Img>();

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
    <Img
      ref={dogImage}
      src={dogOutline}
      scale={0.15}
      rotation={-5}
      opacity={0}
    />,
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
    delay(ANIMATION_SPEED * 0.8, dogImage().opacity(1, DOG_FADE_SPEED))
  );

  yield* waitFor(1);

  yield* all(
    dogImage().opacity(0, DOG_FADE_SPEED),
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
});
