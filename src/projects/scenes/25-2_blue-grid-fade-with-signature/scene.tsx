import { Line, makeScene2D, Node, Path, Spline } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  chain,
  createRefArray,
  delay,
  linear,
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
import extractSplines from "@/lib/extract-splines";

const PERM_VERT = [0, 1, 2, 3, 12, 13, 14, 15];
const PARTIAL_VERT = sequenceColumns().filter(
  (column) => !PERM_VERT.includes(column)
);

const SIGNATURE_SPLINES = extractSplines(`
  <?xml version="1.0" encoding="UTF-8"?>
  <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1536 1024">
    <image width="1536" height="1024" xlink:href="../Downloads/Sionhan signature.png" style="opacity: .1;"/>
    <path d="M444.99,374.43c17.87-28.16,49.27-87.07,25.12-117.27-22.5-22.19-60.61-16.79-87.42-7.79-60.64,19.34-126.87,45.96-149.36,116.6-9.55,31.17,5.46,42.14,27.58,61.12,25.69,21.99,56.64,45.98,84.71,66.24,16.42,11.65,33.87,25.95,45.17,42.56,9.41,12.73,13.32,27.54,12.63,42.97.3,25.87-8.81,60.97-28.11,83.32-29.41,34.48-91.71,80.84-132.84,91.12-16.8,4.15-35.35,6.43-52.16,1.77-23.5-6.18-30.94-30.12-22.36-51.43,4.4-12.36,13.48-21.22,22.51-30.3,12.59-12.51,23.86-22.57,39.17-33.8,57.38-43.98,171.74-71.85,225.85-93.54,11.64-3.62,24.74-17.6,31.42-25.36,1.63-1.71,2.02-1.89,1.18-.06-9.94,19.62-22.69,43.65-24.38,64.88-1.73,22.56,8.35,29.71,27.43,23.3,44.24-12.19,71.33-57.89,94.94-91.87.17-.25.28-.42.34-.52-.41.79-2.29,3.04-3.34,4.87-10.43,16.1-22.76,36.6-24.82,55.8-3.19,42.02,32.64,39.73,58.73,20.31,21.13-14.66,42.64-62.86,23.09-84-14.28-17.03-46.57-11.45-49.75,11.47-1.24,11.65,7.89,21.69,17.72,26.74,26.47,12.16,56.21-.76,81.26-13.01,29.11-13.75,53.62-35.29,71.31-61.77,14.72-20.75,59.47-88.94,47.67-112.36-7.65-6.44-19.47,9.66-25.03,16.8-29.18,41.59-42.17,85.97-54.77,129.84-6.66,23.76-14.76,54.14-21.14,78.27-1.1,5.4-8.28,26.94-.88,12.41,11.48-21.79,36.07-65.15,62.85-80.62,40.38-27.29,39.24,25.98,30.33,51.85-4.44,12.96-10.99,22.18-20.75,28.37-8.98,7.17-47.33,17.32-30.29-5.68,18.43-21.29,49.32-37.97,74.64-50.81,16.2-8.06,30.14-13.21,45.04-22.5,30.47-18.23,58.9-43.9,78.03-75.18,11.58-17.59,22.34-35.97,26.15-56.33,2.55-14.07.24-27.32-13.49-18.39-9.52,6.51-17.94,18.58-24.55,29.68-6.98,11.87-11.65,23.44-16.98,35.87-16.92,40.86-40.55,88.18-55.31,130.02-1.12,4.14-15.68,46.12-8.78,36.53,4.78-6.74,11.04-16.08,16.58-23.46,15.16-20.72,33.15-40.16,54.62-54.81,9.11-5.57,21.43-15.4,32.04-13.18,10.61,5.17.47,31.15-1.87,42.74-2.76,13.44-10.94,33.93-1.27,45.15,9.32,7.85,20.82,4.19,32.09-2.39,24.18-15.37,35.84-45.35,50.77-67.73,8.6-12.72,20.95-22.54,34.93-28.96,11.55-5.77,28.71-8.37,34.81,5.59,2.76,4.14,3.77,16.11,2.57,18.2-.71-9.41.51-26.72-16.24-28.37-26.62-.35-53.79,27.75-66.52,49.87-5.07,8.71-9.5,18.52-12.21,28.34-7.47,26.98,2,46.87,26.14,29.34,19.33-13.12,39.66-37.72,54.89-57.02,8.69-11.08,12.69-13.73,8.96,2.29-17.02,67,7.86,59.29,53.17,26.36,16.04-12.54,27.2-30.73,41.28-45.81,18.56-21,29.79-25,15.82,8.33-5.22,12.59-11.76,26.15-17,38.88-.28,1.66-7.52,16.26-3.93,15.13,19.93-19.71,40.21-57.48,66.02-74.09,24.83-16.55,43.76-17.74,41.26,17.96-.17,15.87-3.21,33.25,1.2,48.79,8.5,26.84,34.81,24.97,56.02,14.84,19.41-8.53,39.52-20.96,56.59-31.65" style="fill: none; stroke: #000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 8px;"/>
    <path d="M522.76,438.17c7.25-11.2,20.42-23.05,20.42-23.05" style="fill: none; stroke: #000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 8px;"/>
  </svg>
`);

const PERM_HORIZ = [0, 1, 4, 5];
const PARTIAL_HORIZ = sequenceRows().filter((row) => !PERM_HORIZ.includes(row));

const ANIMATION_SPEED = 0.5;
const SIGNATURE_WRITE_SPEED = 2;
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
  const signatureSplines = createRefArray<Spline>();

  screen().add([
    <Node position={[-400, -250]} scale={0.5}>
      {SIGNATURE_SPLINES.map((spline) => (
        <Path
          ref={signatureSplines}
          data={spline}
          lineWidth={GRID_LINE_WIDTH * 2}
          stroke={GRID_WHITE}
          end={0}
        />
      ))}
    </Node>,
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

  [
    ...permHorizontalLines,
    ...rightHorizontalLines,
    ...leftHorizontalLines,
    ...permVerticalLines,
    ...topVerticalLines,
    ...bottomVerticalLines,
  ].map((line) => line.stroke(GRID_BLUE));

  ledSystem().fillAll(LED_BLUE);

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
      chain(
        signatureSplines.at(0).end(1, SIGNATURE_WRITE_SPEED, linear),
        delay(0.3, signatureSplines.at(1).end(1, 0.1, linear))
      )
    )
  );

  yield* waitFor(1);

  yield* all(
    ...signatureSplines.map((spline) =>
      spline.opacity(0, SIGNATURE_FADE_SPEED)
    ),
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

  yield* waitFor(0.2);
});
