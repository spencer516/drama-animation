import { Line, makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  Color,
  createRefArray,
  delay,
  sequence,
  waitFor,
} from "@motion-canvas/core";
import {
  positionsToDistance,
  positionToCoordinates,
  sequenceRows,
} from "@/lib/wall-coordinate-system";

export default makeScene2D(function* (view) {
  const { screen, ledSystem } = setupLEDScene(view);

  ledSystem().fillAll(new Color("black"));

  const lines = createRefArray<Line>();

  const lineWidth = positionsToDistance([
    [0, 0],
    [15, 0],
  ]);

  screen().add(
    sequenceRows().map((row) => (
      <Line
        ref={lines}
        points={[
          positionToCoordinates([0, row]),
          positionToCoordinates([15, row]),
        ]}
        lineWidth={8}
        stroke="white"
        endOffset={lineWidth}
        startOffset={0}
      />
    ))
  );

  yield* all(
    ...lines.map((line, index) =>
      delay(
        index * 0.1,
        all(line.endOffset(0, 1), delay(0.3, line.startOffset(lineWidth, 1)))
      )
    )
  );
});
