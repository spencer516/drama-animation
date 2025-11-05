import { View2D } from "@motion-canvas/2d";
import { Line, makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  chain,
  createRef,
  createRefArray,
  delay,
  Random,
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
  ColumnPosition,
  Position,
  positionToCoordinates,
  RowPosition,
  sequenceColumns,
  sequenceRows,
  truncateAsColumn,
} from "@/lib/wall-coordinate-system";

type TransitionLine = {
  start: Position;
  end: Position;
  ref: Reference<Line>;
};

type Params = {
  lineDuration: number;
  stagger: number;
  randomSeed: number;
  direction: "home-to-school" | "school-to-home" | "top-to-bottom";
};

export default function* homeToSchool(
  view: View2D,
  { lineDuration, stagger, randomSeed, direction }: Params
) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom(randomSeed);

  const isHorizontal = direction === "top-to-bottom";

  const { fill } = createFilledGrid(ledSystem, screen);

  const LINES: TransitionLine[] = isHorizontal
    ? makeHorizontalLines(randomGenerator)
    : makeVerticalLines(randomGenerator);

  // console.log(LINES);

  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  screen().add(
    LINES.map(({ start, end, ref }) => (
      <Line
        ref={ref}
        points={[positionToCoordinates(start), positionToCoordinates(end)]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_WHITE.alpha(0)}
      />
    ))
  );

  const orderedLines = direction === "home-to-school" ? LINES : LINES.reverse();
  const lineDurationThird = lineDuration / 3;

  yield* all(
    ...orderedLines.map(({ ref, start, end }, index) =>
      delay(
        index * stagger,
        chain(
          all(
            ref().stroke(GRID_WHITE, lineDurationThird),
            ledSystem().fillInRange(start, end, LED_ON, lineDurationThird)
          ),
          waitFor(lineDurationThird),
          all(
            ref().stroke(GRID_WHITE.alpha(0), lineDurationThird),
            ledSystem().fillInRange(start, end, LED_BLUE, lineDurationThird)
          )
        )
      )
    )
  );

  yield* waitFor(0.2);
}

function makeHorizontalLines(randomGenerator: Random): TransitionLine[] {
  const rows = sequenceRows().reverse();
  const sequence = [...rows, ...Array.from(rows).reverse().slice(1)];

  return sequence.map((row, index) => {
    const ref = createRef<Line>();
    const segment = (index / sequence.length) * 6;
    const midpoint = randomGenerator.nextInt(3 + segment, 9 + segment);
    const width = randomGenerator.nextInt(3, 6);

    const start = truncateAsColumn(
      Math.round(midpoint - width / 2)
    ) as ColumnPosition;

    const end = truncateAsColumn(
      Math.round(midpoint + width / 2)
    ) as ColumnPosition;

    if (row === 5) {
      console.log({ row, start, end, midpoint, width });
    }

    return {
      start: [start, row],
      end: [end, row],
      ref,
    };
  });
}

function makeVerticalLines(randomGenerator: Random): TransitionLine[] {
  return sequenceColumns().map((column) => {
    const ref = createRef<Line>();
    if (column === 0) {
      return {
        start: [column, 0],
        end: [column, 1],
        ref,
      };
    }

    if (column === 15) {
      return {
        start: [column, 4],
        end: [column, 5],
        ref,
      };
    }

    const segment = Math.floor(column / 5);
    const start = randomGenerator.nextInt(segment, 2 + segment) as RowPosition;
    const height = randomGenerator.nextInt(1, 6 - start);
    const end = Math.min(start + height, 5) as RowPosition;

    return {
      start: [column, start],
      end: [column, end],
      ref,
    };
  });
}
