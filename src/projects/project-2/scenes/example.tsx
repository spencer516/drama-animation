import { makeScene2D } from "@motion-canvas/2d";
import { Color, createRef, easeInOutCubic, tween } from "@motion-canvas/core";
import { LEDSystem } from "../../../lib/LEDSystem";

export default makeScene2D(function* (view) {
  const ledSystem = createRef<LEDSystem>();

  view.add(<LEDSystem ref={ledSystem} />);

  yield* tween(2, (value) => {
    const color = Color.lerp(
      new Color("#e6a700"),
      new Color("#e13238"),
      easeInOutCubic(value)
    );

    ledSystem().fillInRange([0, 0], [8, 5], color);

    const color2 = Color.lerp(
      new Color("blue"),
      new Color("white"),
      easeInOutCubic(value)
    );

    ledSystem().fillAt([9, 2], color2);
  });

  yield* tween(2, (value) => {
    const color = Color.lerp(
      new Color("pink"),
      new Color("black"),
      easeInOutCubic(value)
    );

    ledSystem().fillColumn(2, color);
    ledSystem().fillRow(2, color);
  });
});
