import { Line, makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { Color, waitFor } from "@motion-canvas/core";
import {
  sequenceRows,
  sequenceColumns,
  positionToCoordinates,
} from "@/lib/wall-coordinate-system";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  ledSystem().fillAll(new Color("red"));

  // Render horizontal lines for each row
  for (const row of sequenceRows()) {
    const [startX, y] = positionToCoordinates([0, row]);
    const [endX] = positionToCoordinates([15, row]);

    screen().add(
      <Line
        points={[
          [startX, y],
          [endX, y],
        ]}
        stroke={new Color("white")}
        lineWidth={8}
      />
    );
  }

  // Render vertical lines for each column
  for (const col of sequenceColumns()) {
    const [x, startY] = positionToCoordinates([col, 0]);
    const [, endY] = positionToCoordinates([col, 5]);

    screen().add(
      <Line
        points={[
          [x, startY],
          [x, endY],
        ]}
        stroke={new Color("white")}
        lineWidth={8}
      />
    );
  }

  yield* waitFor(10);
});
