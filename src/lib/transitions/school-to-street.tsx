import { View2D } from "@motion-canvas/2d";
import { Line } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { all, createRefArray, delay, waitFor } from "@motion-canvas/core";
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

export function* schoolToStreet(view: View2D, { transitionDuration }: Params) {
  const { ledSystem, screen } = setupLEDScene(view);

  const verticalLines = createRefArray<Line>();
  const rightHorizontalLines = createRefArray<Line>();
  const leftHorizontalLines = createRefArray<Line>();

  const fullWidth = positionsToDistance([
    [0, 0],
    [15, 0],
  ]);
  const halfWidth = fullWidth / 2;

  const fullWidthPadded = fullWidth + 5;

  const fullHeight = positionsToDistance([
    [0, 0],
    [0, 5],
  ]);

  const fullHeightPadded = fullHeight + 5;

  const allLights = allPositions();

  const lightsToTurnToStreet = intersectPositions(
    STREET_LIGHT_POSITIONS,
    allLights
  );

  const lightsToFadeOut = excludePositions(allLights, STREET_LIGHT_POSITIONS);

  ledSystem().fillAll(LED_BLUE);

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
        startOffset={halfWidth}
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
        endOffset={halfWidth}
      />
    )),
  ]);

  yield* all(
    ...verticalLines.map((line) =>
      line.startOffset(fullHeightPadded, transitionDuration)
    ),
    ...rightHorizontalLines.map((line, index) =>
      delay(
        rowToDelay(index, transitionDuration),
        line.startOffset(fullWidthPadded, transitionDuration)
      )
    ),
    ...leftHorizontalLines.map((line, index) =>
      delay(
        rowToDelay(index, transitionDuration),
        line.endOffset(fullWidthPadded, transitionDuration)
      )
    ),
    ...lightsToFadeOut.map((position) =>
      ledSystem().fillAt(position, LED_OFF, transitionDuration)
    ),
    ...lightsToTurnToStreet.map((position) =>
      ledSystem().fillAt(position, LED_YELLOW, transitionDuration)
    )
  );

  yield* waitFor(0.1);
}

function rowToDelay(row: number, totalDuration: number): number {
  const durationPerSquare = totalDuration / 15;

  switch (row) {
    case 0:
    case 1:
      return 0;
    case 2:
    case 3:
      return durationPerSquare;
    case 4:
      return durationPerSquare * 2;
    case 5:
      return durationPerSquare * 3;
  }
}
