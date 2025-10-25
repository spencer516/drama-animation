import { Line, makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  chain,
  Color,
  createRef,
  sequence,
  waitFor,
} from "@motion-canvas/core";
import {
  Position,
  positionsToDistance,
  positionToCoordinates,
  sequenceRows,
} from "@/lib/wall-coordinate-system";

const POSITIONS: Position[] = [
  [0, 0],
  [1, 0],
  [2, 0],
  [2, 1],
  [2, 2],
  [3, 2],
  [4, 3],
  [5, 4],
  [6, 4],
  [7, 4],
  [8, 4],
  [8, 3],
  [8, 2],
  [9, 1],
  [9, 2],
  [9, 3],
  [10, 4],
  [11, 5],
  [12, 5],
  [13, 5],
  [14, 5],
  [15, 5],
];

const BASE_PATH_COLOR = new Color("#525252ff");
const TRAIN_PATH = new Color("red");
const LIGHT_COLOR = new Color("white");
const BLACK = new Color("black");
const TRAIN_LENGTH = 80;
const TRAVEL_SPEED = 0.5;
const STATION_WAIT_TIME = 0.2;

const totalTrainDistance = positionsToDistance(POSITIONS);

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  ledSystem().fillAll(BLACK);

  const basePathRef = createRef<Line>();
  const trainPathRef = createRef<Line>();

  screen().add(
    <>
      <Line
        ref={basePathRef}
        points={POSITIONS.map(positionToCoordinates)}
        stroke={BLACK}
        lineWidth={8}
        radius={2}
      />
      <Line
        ref={trainPathRef}
        points={POSITIONS.map(positionToCoordinates)}
        stroke={TRAIN_PATH}
        startOffset={TRAIN_LENGTH * -1}
        endOffset={totalTrainDistance}
        lineWidth={20}
        radius={2}
        lineCap="round"
      />
    </>
  );

  yield* basePathRef().stroke(BASE_PATH_COLOR, 0.5);

  for (let i = 1; i < POSITIONS.length; i++) {
    const [startOffset, endOffset] = getOffsetsForStep(i);
    const position = POSITIONS.at(i);

    yield* chain(
      all(
        trainPathRef().startOffset(startOffset, TRAVEL_SPEED),
        trainPathRef().endOffset(endOffset, TRAVEL_SPEED)
      ),
      ledSystem().fillAt(position, LIGHT_COLOR, STATION_WAIT_TIME),
      waitFor(STATION_WAIT_TIME * 2),
      ledSystem().fillAt(position, BLACK, STATION_WAIT_TIME)
    );

    ledSystem().fillAt(position, BLACK);
  }

  yield* trainPathRef().startOffset(totalTrainDistance, TRAVEL_SPEED);

  yield* waitFor(1);
});

function getOffsetsForStep(index: number): [number, number] {
  const positions = POSITIONS.slice(0, index + 1);
  const distance = positionsToDistance(positions);

  const startOffset = distance - TRAIN_LENGTH / 2;
  const endOffset = totalTrainDistance - (distance + TRAIN_LENGTH / 2);

  return [startOffset, endOffset];
}
