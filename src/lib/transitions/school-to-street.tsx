import { Rect, View2D } from "@motion-canvas/2d";
import { Line } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  Color,
  createRefArray,
  delay,
  Reference,
  ReferenceArray,
  waitFor,
} from "@motion-canvas/core";
import { STREET_LIGHT_POSITIONS } from "@/lib/scenes/street";
import {
  GRID_BLUE,
  GRID_LINE_WIDTH,
  LED_BLUE,
  LED_OFF,
  LED_YELLOW,
} from "@/lib/design-system";
import {
  allPositions,
  excludePositions,
  intersectPositions,
  positionsToDistance,
  positionToCoordinates,
  sequenceColumns,
  sequenceRows,
} from "@/lib/wall-coordinate-system";

type Params = {
  transitionDuration: number;
};

export function* streetToSchool(view: View2D, { transitionDuration }: Params) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fullWidth, fullHeight } = getDimensions();

  const { verticalLines, rightHorizontalLines, leftHorizontalLines } =
    setupLines(screen, fullWidth, fullHeight);

  const { streetLights } = getLightPartitions();

  streetLights.map((position) => ledSystem().fillAt(position, LED_YELLOW));

  yield* all(
    ...verticalLines.map((line) => line.startOffset(0, transitionDuration)),
    ...rightHorizontalLines.map((line, index) =>
      delay(
        rowToDelay(index, transitionDuration, true),
        line.startOffset(0, transitionDuration)
      )
    ),
    ...leftHorizontalLines.map((line, index) =>
      delay(
        rowToDelay(index, transitionDuration, true),
        line.endOffset(0, transitionDuration)
      )
    ),
    ledSystem().fillAll(LED_BLUE, transitionDuration)
  );

  yield* waitFor(0.1);
}

export function* schoolToStreet(view: View2D, { transitionDuration }: Params) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fullWidth, halfWidth, fullHeight } = getDimensions();

  const { verticalLines, rightHorizontalLines, leftHorizontalLines } =
    setupLines(screen, halfWidth, 0);

  const { streetLights, otherLights } = getLightPartitions();

  ledSystem().fillAll(LED_BLUE);

  yield* all(
    ...verticalLines.map((line) =>
      line.startOffset(fullHeight, transitionDuration)
    ),
    ...rightHorizontalLines.map((line, index) =>
      delay(
        rowToDelay(index, transitionDuration),
        line.startOffset(fullWidth, transitionDuration)
      )
    ),
    ...leftHorizontalLines.map((line, index) =>
      delay(
        rowToDelay(index, transitionDuration),
        line.endOffset(fullWidth, transitionDuration)
      )
    ),
    ...otherLights.map((position) =>
      ledSystem().fillAt(position, LED_OFF, transitionDuration)
    ),
    ...streetLights.map((position) =>
      ledSystem().fillAt(position, LED_YELLOW, transitionDuration)
    )
  );

  yield* waitFor(0.1);
}

function getLightPartitions() {
  const allLights = allPositions();
  const streetLights = intersectPositions(STREET_LIGHT_POSITIONS, allLights);

  const otherLights = excludePositions(allLights, STREET_LIGHT_POSITIONS);

  return { streetLights, otherLights };
}

function rowToDelay(
  row: number,
  totalDuration: number,
  reverse: boolean = false
): number {
  const durationPerSquare = totalDuration / 15;

  switch (row) {
    case 0:
    case 1:
      return reverse ? durationPerSquare * 3 : 0;
    case 2:
    case 3:
      return reverse ? durationPerSquare * 2 : durationPerSquare;
    case 4:
      return reverse ? durationPerSquare : durationPerSquare * 2;
    case 5:
      return reverse ? 0 : durationPerSquare * 3;
  }
}

function getDimensions() {
  const fullWidth = positionsToDistance([
    [0, 0],
    [15, 0],
  ]);
  const halfWidth = fullWidth / 2;

  const fullHeight = positionsToDistance([
    [0, 0],
    [0, 5],
  ]);

  return { fullWidth, halfWidth, fullHeight };
}

function setupLines(
  screen: Reference<Rect>,
  widthOffset: number,
  heightOffset: number
): {
  verticalLines: ReferenceArray<Line>;
  rightHorizontalLines: ReferenceArray<Line>;
  leftHorizontalLines: ReferenceArray<Line>;
} {
  const verticalLines = createRefArray<Line>();
  const rightHorizontalLines = createRefArray<Line>();
  const leftHorizontalLines = createRefArray<Line>();

  screen().add([
    ...sequenceColumns().map((column) => (
      <Line
        ref={verticalLines}
        points={[
          positionToCoordinates([column, 0]),
          positionToCoordinates([column, 5]),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_BLUE}
        startOffset={heightOffset}
      />
    )),
    ...sequenceRows().map((row) => (
      <Line
        ref={rightHorizontalLines}
        points={[
          positionToCoordinates([0, row]),
          positionToCoordinates([15, row]),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_BLUE}
        startOffset={widthOffset}
      />
    )),
    ...sequenceRows().map((row) => (
      <Line
        ref={leftHorizontalLines}
        points={[
          positionToCoordinates([0, row]),
          positionToCoordinates([15, row]),
        ]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_BLUE}
        endOffset={widthOffset}
      />
    )),
  ]);

  return { verticalLines, rightHorizontalLines, leftHorizontalLines };
}
