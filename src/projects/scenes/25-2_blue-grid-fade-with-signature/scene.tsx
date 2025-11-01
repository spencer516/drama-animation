import { Knot, Line, makeScene2D, Spline } from "@motion-canvas/2d";
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
  GRID_BLACK,
  GRID_LINE_WIDTH,
  LED_BLUE,
  LED_OFF,
  GRID_WHITE,
} from "@/lib/design-system";
import {
  Position,
  positionsToDistance,
  positionToCoordinates,
  sequenceColumns,
  sequenceRows,
} from "@/lib/wall-coordinate-system";

const PERM_VERT = [0, 1, 2, 3, 12, 13, 14, 15];
const PARTIAL_VERT = sequenceColumns().filter(
  (column) => !PERM_VERT.includes(column)
);

const PERM_HORIZ = [0, 1, 4, 5];
const PARTIAL_HORIZ = sequenceRows().filter((row) => !PERM_HORIZ.includes(row));

const ANIMATION_SPEED = 0.5;
const SIGNATURE_WRITE_SPEED = 5;
const SIGNATURE_FADE_SPEED = 1;
const INITIAL_FADE_IN_DURATION = 1;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const ledFadePositions = PARTIAL_VERT.flatMap((column) =>
    PARTIAL_HORIZ.map((row) => [column, row] as Position)
  );

  const permHorizontalLines = createRefArray<Line>();
  const leftHorizontalLines = createRefArray<Line>();
  const rightHorizontalLines = createRefArray<Line>();

  const halfWidth =
    positionsToDistance([
      [0, 0],
      [15, 0],
    ]) / 2;

  const openWidth = positionsToDistance([
    [0, 0],
    [12, 0],
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
  const signatureSpline = createRef<Spline>();

  screen().add([
    <Spline
      lineWidth={GRID_LINE_WIDTH}
      stroke={GRID_WHITE}
      ref={signatureSpline}
      end={0}
    >
      {/* "S" - starting stroke */}
      <Knot position={[-540, -180]} />
      <Knot
        position={[-516, -156]}
        startHandle={[20, -15]}
        endHandle={[-15, 10]}
      />
      <Knot
        position={[-540, -84]}
        startHandle={[15, -25]}
        endHandle={[-12, 20]}
      />
      <Knot
        position={[-564, -60]}
        startHandle={[18, -15]}
        endHandle={[-25, 18]}
      />

      {/* "io" - flowing into next letters */}
      <Knot
        position={[-528, -120]}
        startHandle={[28, 12]}
        endHandle={[-15, -8]}
      />
      <Knot
        position={[-480, -156]}
        startHandle={[12, -20]}
        endHandle={[-10, 18]}
      />
      <Knot
        position={[-480, -48]}
        startHandle={[8, -28]}
        endHandle={[-8, 20]}
      />
      <Knot
        position={[-444, -120]}
        startHandle={[10, -18]}
        endHandle={[-15, 8]}
      />
      <Knot
        position={[-372, -156]}
        startHandle={[20, -15]}
        endHandle={[-12, 10]}
      />
      <Knot
        position={[-348, -36]}
        startHandle={[8, -30]}
        endHandle={[-10, 18]}
      />

      {/* "bh" - connected stroke */}
      <Knot
        position={[-276, -144]}
        startHandle={[22, -20]}
        endHandle={[-12, 10]}
      />
      <Knot
        position={[-252, -84]}
        startHandle={[10, -18]}
        endHandle={[-8, 15]}
      />
      <Knot position={[-252, 0]} startHandle={[8, -25]} endHandle={[-8, 22]} />
      <Knot
        position={[-216, -120]}
        startHandle={[15, -12]}
        endHandle={[-18, 10]}
      />
      <Knot
        position={[-132, -156]}
        startHandle={[25, -12]}
        endHandle={[-12, 8]}
      />
      <Knot
        position={[-96, -84]}
        startHandle={[10, -18]}
        endHandle={[-10, 15]}
      />
      <Knot position={[-96, 12]} startHandle={[8, -28]} endHandle={[-8, 20]} />

      {/* "an" - finishing stroke with flourish */}
      <Knot
        position={[-36, -120]}
        startHandle={[18, -15]}
        endHandle={[-18, 10]}
      />
      <Knot
        position={[24, -156]}
        startHandle={[18, -15]}
        endHandle={[-10, 10]}
      />
      <Knot position={[60, -36]} startHandle={[8, -30]} endHandle={[-10, 15]} />
      <Knot
        position={[120, -96]}
        startHandle={[18, -12]}
        endHandle={[-12, 10]}
      />
      <Knot
        position={[168, -24]}
        startHandle={[12, -18]}
        endHandle={[-15, 20]}
      />

      {/* Final flourish */}
      <Knot position={[240, 36]} startHandle={[30, -12]} endHandle={[-18, 8]} />
      <Knot position={[276, 60]} startHandle={[15, -8]} />
    </Spline>,
    ...PERM_HORIZ.map((row) => (
      <Line
        ref={permHorizontalLines}
        points={[
          positionToCoordinates([0, row] as Position),
          positionToCoordinates([15, row] as Position),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_BLACK}
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
        stroke={GRID_BLACK}
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
        stroke={GRID_BLACK}
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
        stroke={GRID_BLACK}
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
        stroke={GRID_BLACK}
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
        stroke={GRID_BLACK}
        startOffset={halfHeight}
      />
    )),
  ]);

  const animations = [
    ...permHorizontalLines,
    ...rightHorizontalLines,
    ...leftHorizontalLines,
    ...permVerticalLines,
    ...topVerticalLines,
    ...bottomVerticalLines,
  ].map((line) => line.stroke(GRID_BLUE, INITIAL_FADE_IN_DURATION));

  yield* all(
    ledSystem().fillAll(LED_BLUE, INITIAL_FADE_IN_DURATION),
    ...animations
  );

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
    delay(
      ANIMATION_SPEED * 0.8,
      signatureSpline().end(1, SIGNATURE_WRITE_SPEED)
    )
  );

  yield* waitFor(1);

  yield* all(
    signatureSpline().opacity(0, SIGNATURE_FADE_SPEED),
    delay(
      SIGNATURE_FADE_SPEED * 0.8,
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
