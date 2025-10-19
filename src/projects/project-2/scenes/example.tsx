import { Circle, Line, makeScene2D, Rect } from "@motion-canvas/2d";
import {
  Color,
  createRef,
  easeInOutCubic,
  linear,
  tween,
  waitFor,
} from "@motion-canvas/core";
import { LEDSystem } from "../../../lib/LEDSystem";
import {
  Position,
  positionsToCoordinates,
  positionsToDistance,
  positionToCoordinates,
  positionToRect,
} from "../../../lib/wall-coordinate-system";

export default makeScene2D(function* (view) {
  const ledSystem = createRef<LEDSystem>();
  const rect = createRef<Rect>();
  const line = createRef<Line>();

  view.add(
    <Rect ref={rect} fill={"white"} {...positionToRect([1, 0], [3, 2])} />
  );

  const points: Position[] = [
    [1, 1],
    [1, 5],
    [3, 5],
    [3, 2],
    [9, 2],
    [9, 3],
    [10, 3],
  ];

  view.add(
    <Line
      ref={line}
      stroke={"blue"}
      lineWidth={8}
      endOffset={positionsToDistance(points)}
      radius={3}
      points={positionsToCoordinates(points)}
    />
  );

  view.add(<LEDSystem ref={ledSystem} />);

  const red = { r: 255, g: 0, b: 0, a: 1 };
  const black = { r: 255, g: 0, b: 0, a: 0 };

  ledSystem().fillAll(new Color(black));

  ledSystem().fillRow(0, new Color(red));
  ledSystem().fillRow(1, new Color(red));
  ledSystem().fillRow(2, new Color(red));
  ledSystem().fillRow(3, new Color(red));
  ledSystem().fillRow(4, new Color(red));
  ledSystem().fillRow(5, new Color(red));

  yield* line().endOffset(0, 2);

  yield* rect().topLeft(positionToCoordinates([5, 2]), 2);

  yield* ledSystem().fillRow(0, new Color("blue"), 2);
});
