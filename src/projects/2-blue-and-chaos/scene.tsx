import { Line, makeScene2D, Rect } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { Color, createRefArray, sequence, waitFor } from "@motion-canvas/core";
import {
  positionToCoordinates,
  positionToRect,
  sequenceRows,
} from "@/lib/wall-coordinate-system";
import {
  GRID_BLUE,
  GRID_LINE_WIDTH,
  GRID_WHITE,
  LED_BLUE,
} from "@/lib/design-system";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill } = createFilledGrid(ledSystem, screen);

  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  const randomLines = createRefArray<Line>();
  const randomBoxes = createRefArray<Rect>();

  const rect = positionToRect([4, 3], 2, 1);

  screen().add(
    <>
      <Line
        ref={randomLines}
        points={[positionToCoordinates([2, 0]), positionToCoordinates([2, 1])]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_WHITE}
      />
      <Rect
        ref={randomBoxes}
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        stroke={GRID_WHITE}
        fill={GRID_WHITE}
        lineWidth={GRID_LINE_WIDTH}
      />
    </>
  );

  yield* waitFor(15);
});
