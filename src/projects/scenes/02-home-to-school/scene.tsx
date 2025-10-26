import { Line, makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  chain,
  createRef,
  createRefArray,
  delay,
  Reference,
  useRandom,
  waitFor,
} from "@motion-canvas/core";
import {
  GRID_BLUE,
  GRID_LINE_WIDTH,
  GRID_WHITE,
  LED_BLUE,
  LED_ON,
} from "@/lib/design-system";
import {
  Position,
  positionToCoordinates,
  RowPosition,
  sequenceColumns,
} from "@/lib/wall-coordinate-system";

type TransitionLine = {
  top: Position;
  bottom: Position;
  ref: Reference<Line>;
};

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom(7);

  const { fill } = createFilledGrid(ledSystem, screen);

  const LINES: TransitionLine[] = sequenceColumns().map((column) => {
    const ref = createRef<Line>();
    if (column === 0) {
      return {
        top: [column, 0],
        bottom: [column, 1],
        ref,
      };
    }

    if (column === 15) {
      return {
        top: [column, 4],
        bottom: [column, 5],
        ref,
      };
    }

    const segment = Math.floor(column / 5);
    const top = randomGenerator.nextInt(segment, 2 + segment) as RowPosition;
    const height = randomGenerator.nextInt(1, 6 - top);
    const bottom = Math.min(top + height, 5) as RowPosition;

    return {
      top: [column, top],
      bottom: [column, bottom],
      ref,
    };
  });

  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  screen().add(
    LINES.map(({ top, bottom, ref }) => (
      <Line
        ref={ref}
        points={[positionToCoordinates(top), positionToCoordinates(bottom)]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_WHITE.alpha(0)}
      />
    ))
  );

  yield* all(
    ...LINES.map(({ ref, top, bottom }, index) =>
      delay(
        index * 0.05,
        chain(
          all(
            ref().stroke(GRID_WHITE, 0.2),
            ledSystem().fillInRange(top, bottom, LED_ON, 0.2)
          ),
          waitFor(0.2),
          all(
            ref().stroke(GRID_WHITE.alpha(0), 0.2),
            ledSystem().fillInRange(top, bottom, LED_BLUE, 0.2)
          )
        )
      )
    )
  );

  yield* waitFor(0.2);
});
