import { makeScene2D, Rect } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { Color, createRefArray, sequence, waitFor } from "@motion-canvas/core";
import { positionToRect, sequenceColumns } from "@/lib/wall-coordinate-system";

export default makeScene2D(function* (view) {
  const { screen, ledSystem } = setupLEDScene(view);

  const boxes = createRefArray<Rect>();
  const black = new Color("black");

  screen().add(
    sequenceColumns(false).map((column) => (
      <Rect
        ref={boxes}
        fill={black}
        stroke={black}
        lineWidth={5}
        {...positionToRect([column, 2])}
      />
    ))
  );

  ledSystem().fillAll(black);

  yield* sequence(
    0.25,
    ...sequenceColumns().map((column) =>
      ledSystem().fillColumn(column, new Color("#c05dbeff"), 0.5)
    )
  );

  yield* sequence(
    0.25,
    ...boxes.map((box) => box.fill(new Color("#6d4a6cff"), 0.5))
  );

  yield* waitFor(1);

  yield* sequence(0.25, ...boxes.map((box) => box.fill(black, 0.5)));

  yield* sequence(
    0.25,
    ...sequenceColumns().map((column) =>
      ledSystem().fillColumn(column, black, 0.5)
    )
  );
});
