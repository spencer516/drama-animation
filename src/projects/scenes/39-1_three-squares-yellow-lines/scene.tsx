import { Line, makeScene2D, Rect } from "@motion-canvas/2d";
import { LEDSystem, setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  createRef,
  loop,
  Random,
  Reference,
  sequence,
  spawn,
  useRandom,
  waitFor,
} from "@motion-canvas/core";
import {
  GRID_BLACK,
  GRID_LINE_WIDTH,
  GRID_WHITE,
  GRID_YELLOW,
  LED_ON,
} from "@/lib/design-system";
import {
  Position,
  positionsToDistance,
  positionToCoordinates,
  positionToRect,
} from "@/lib/wall-coordinate-system";

const TARGET_DURATION = 1.5;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const random = useRandom();

  const square1 = makeSquare([1, 1], screen);
  const square2 = makeSquare([6, 1], screen);
  const square3 = makeSquare([11, 1], screen);

  square1.lightPoints.map((position) => ledSystem().fillAt(position, LED_ON));
  square2.lightPoints.map((position) => ledSystem().fillAt(position, LED_ON));
  square3.lightPoints.map((position) => ledSystem().fillAt(position, LED_ON));

  const yellow1Ref = createRef<Line>();
  const yellow2Ref = createRef<Line>();

  screen().add(
    <>
      <Line
        ref={yellow1Ref}
        points={[positionToCoordinates([0, 1]), positionToCoordinates([15, 1])]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_YELLOW}
        start={0}
        end={0}
      />
      <Line
        ref={yellow2Ref}
        points={[positionToCoordinates([0, 4]), positionToCoordinates([15, 4])]}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_YELLOW}
        start={0}
        end={0}
      />
    </>
  );

  spawn(makeBolt(yellow1Ref, random));
  spawn(makeBolt(yellow2Ref, random));

  yield* waitFor(10);
});

type SquareDeets = {
  pathRef: Reference<Line>;
  squareRef: Reference<Rect>;
  lightPoints: Position[];
  pathDistance: number;
};

function makeBolt(line: Reference<Line>, random: Random) {
  return function* () {
    yield* loop(function* () {
      yield* waitFor(random.nextFloat(0.2, 1));
      yield* sequence(
        random.nextFloat(0.05, 0.2),
        line().start(1, random.nextFloat(0.1, 0.3)),
        line().end(1, random.nextFloat(0.1, 0.3))
      );

      line().start(0).end(0);
    });
  };
}

function makeSquare(position: Position, screen: Reference<Rect>): SquareDeets {
  const pathRef = createRef<Line>();
  const squareRef = createRef<Rect>();

  const [column, row] = position;

  const lightPoints: Position[] = [
    position,
    [column + 1, row] as Position,
    [column + 2, row] as Position,
    [column + 3, row] as Position,
    [column + 3, row + 1] as Position,
    [column + 3, row + 2] as Position,
    [column + 3, row + 3] as Position,
    [column + 2, row + 3] as Position,
    [column + 1, row + 3] as Position,
    [column, row + 3] as Position,
    [column, row + 2] as Position,
    [column, row + 1] as Position,
  ];

  const points: Position[] = [
    position,
    [column + 3, row] as Position,
    [column + 3, row + 3] as Position,
    [column, row + 3] as Position,
  ];

  const rect = positionToRect(position, 3, 3);
  const pathDistance = positionsToDistance([...points, position]);

  screen().add(
    <>
      <Line
        ref={pathRef}
        points={points.map(positionToCoordinates)}
        lineWidth={GRID_LINE_WIDTH}
        stroke={GRID_WHITE}
        closed={true}
      />
      <Rect
        ref={squareRef}
        x={rect.x}
        y={rect.y}
        height={rect.height}
        width={rect.width}
        fill={GRID_WHITE}
      />
    </>
  );

  return { pathRef, squareRef, lightPoints, pathDistance };
}
