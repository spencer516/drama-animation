import { Line, makeScene2D, Rect } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  createRef,
  Reference,
  spawn,
  useRandom,
  waitFor,
} from "@motion-canvas/core";
import {
  GRID_BLACK,
  GRID_BLUE,
  GRID_LINE_WIDTH,
  GRID_WHITE,
  LED_BLUE,
} from "@/lib/design-system";
import { setupTrainStructure } from "@/lib/scenes/train";
import {
  chaoticLineRemoval,
  chaoticRectRemoval,
} from "@/lib/effects/random-chaotic-removal";
import lightning from "@/lib/effects/lightning";
import chaosRectangles from "@/lib/effects/chaos-rectangles";
import {
  Position,
  positionsToDistance,
  positionToCoordinates,
  positionToRect,
} from "@/lib/wall-coordinate-system";

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom();

  const square1 = makeSquare([1, 1], screen);
  const square2 = makeSquare([6, 1], screen);
  const square3 = makeSquare([11, 1], screen);

  const allLines = [square1.pathRef(), square2.pathRef(), square3.pathRef()];

  chaoticLineRemoval(randomGenerator, allLines);

  const rects = [square1.squareRef(), square2.squareRef(), square3.squareRef()];

  chaoticRectRemoval(randomGenerator, rects);

  // Spawn lightning bolt animation
  spawn(
    lightning(ledSystem, screen, {
      randomSeed: 1099,
      totalBolts: 300,
      totalDuration: 10,
    })
  );

  // Spawn chaos rectangles animation
  spawn(
    chaosRectangles(screen, {
      randomSeed: 88,
      quantity: 100, // Number of rectangles to spawn
      density: 4, // Max size: 1-4 grid units
      speed: 4, // 2x speed multiplier
      totalDuration: 10,
    })
  );

  yield* waitFor(12);
});

type SquareDeets = {
  pathRef: Reference<Line>;
  squareRef: Reference<Rect>;
  lightPoints: Position[];
  pathDistance: number;
};

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
