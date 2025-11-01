import { makeScene2D, Txt } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  chain,
  createRefArray,
  easeOutBounce,
  loop,
  sequence,
  spawn,
  waitFor,
} from "@motion-canvas/core";
import { GRID_WHITE } from "@/lib/design-system";
import {
  ColumnPosition,
  columnToXCoordinate,
  positionsToDistance,
  rowToYCoordinate,
} from "@/lib/wall-coordinate-system";
import makeBreathingBlue from "@/lib/effects/breathing-blue";

const NUMBERS = [
  "1",
  "8",
  "27",
  "64",
  "125",
  "216",
  "343",
  "512",
  "729",
  "1000",
  "1331",
];

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const breathing = makeBreathingBlue(ledSystem);

  screen().add(breathing.components);

  const texts = createRefArray<Txt>();
  const segmentLength = positionsToDistance([
    [0, 0],
    [1, 0],
  ]);
  const textY = rowToYCoordinate(2) + segmentLength / 2;

  screen().add(
    NUMBERS.map((num, i) => (
      <Txt
        ref={texts}
        text={num}
        fontSize={28}
        fill={GRID_WHITE}
        y={textY}
        x={columnToXCoordinate((i + 2) as ColumnPosition) + segmentLength / 2}
        opacity={0}
        scale={2}
      />
    ))
  );

  const halfCount = Math.floor(NUMBERS.length / 2);

  const left = texts.slice(0, halfCount);
  const right = texts.slice(halfCount).reverse();

  const animateOut = (text: Txt) =>
    all(text.opacity(0, 0.5), text.scale(2, 0.5));

  yield* all(
    loop(3, breathing.animate),
    chain(
      sequence(
        0.7,
        ...texts.map((text) => all(text.opacity(1, 1.5), text.scale(1, 1)))
      ),
      waitFor(3),
      all(
        sequence(0.3, ...left.map(animateOut)),
        sequence(0.3, ...right.map(animateOut))
      )
    )
  );

  yield* waitFor(0.2);
});
