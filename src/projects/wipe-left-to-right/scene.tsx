import { Line, makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  chain,
  Color,
  createRefArray,
  delay,
  sequence,
  waitFor,
} from "@motion-canvas/core";
import {
  Position,
  positionsToDistance,
  positionToCoordinates,
  sequenceColumns,
  sequenceRows,
} from "@/lib/wall-coordinate-system";

const PER_ROW_DURATION = 0.8;
const LINE_DELAY = 0.1;

const LED_COLOR = new Color("red");
const LINE_COLOR = new Color("white");

export default makeScene2D(function* (view) {
  const { screen, ledSystem } = setupLEDScene(view);
  const black = new Color("black");

  ledSystem().fillAll(black);

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
        stroke={LINE_COLOR}
        endOffset={lineWidth}
        startOffset={0}
      />
    ))
  );

  const linesOfLightIDs = sequenceRows().map((row) =>
    sequenceColumns().map((column) => [column, row] as Position)
  );

  yield* all(
    ...lines.map((line, index) =>
      delay(
        index * LINE_DELAY,
        all(
          line.endOffset(0, PER_ROW_DURATION),
          delay(0.2, line.startOffset(lineWidth, PER_ROW_DURATION))
        )
      )
    ),
    ...linesOfLightIDs.map((lineOfLightIDs, index) =>
      delay(
        index * LINE_DELAY,
        sequence(
          PER_ROW_DURATION * 0.05,
          ...lineOfLightIDs.map((lightID) =>
            chain(
              ledSystem().fillAt(lightID, LED_COLOR, PER_ROW_DURATION * 0.15),
              waitFor(PER_ROW_DURATION * 0.2),
              ledSystem().fillAt(lightID, black, PER_ROW_DURATION * 0.15)
            )
          )
        )
      )
    )
  );
});
