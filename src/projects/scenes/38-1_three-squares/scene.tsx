import { Line, makeScene2D, Rect } from "@motion-canvas/2d";
import { LEDSystem, setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  createRef,
  Reference,
  sequence,
  waitFor,
} from "@motion-canvas/core";
import {
  GRID_BLACK,
  GRID_LINE_WIDTH,
  GRID_WHITE,
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

  const square1 = makeSquare([1, 1], screen);
  const square2 = makeSquare([6, 1], screen);
  const square3 = makeSquare([11, 1], screen);

  yield* all(
    sequence(
      TARGET_DURATION * 0.2,
      animateInSquare(ledSystem, square1),
      animateInSquare(ledSystem, square2),
      animateInSquare(ledSystem, square3)
    )
  );

  yield* waitFor(1);
});

type SquareDeets = {
  pathRef: Reference<Line>;
  squareRef: Reference<Rect>;
  lightPoints: Position[];
  pathDistance: number;
};

function* animateInSquare(
  ledSystem: Reference<LEDSystem>,
  { pathRef, squareRef, lightPoints, pathDistance }: SquareDeets
) {
  pathRef().stroke(GRID_WHITE).endOffset(pathDistance);
  squareRef().fill(GRID_WHITE).opacity(0);

  yield* all(
    sequence(
      TARGET_DURATION * 0.03,
      ...lightPoints.map((position) =>
        ledSystem().fillAt(position, LED_ON, TARGET_DURATION * 0.2)
      )
    ),
    pathRef().endOffset(0, TARGET_DURATION * 0.65),
    squareRef().opacity(1, TARGET_DURATION * 0.8)
  );
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
        stroke={GRID_BLACK}
        closed={true}
      />
      <Rect
        ref={squareRef}
        x={rect.x}
        y={rect.y}
        height={rect.height}
        width={rect.width}
        fill={GRID_BLACK}
      />
    </>
  );

  return { pathRef, squareRef, lightPoints, pathDistance };
}
