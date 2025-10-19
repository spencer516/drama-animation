import { Circle, makeScene2D } from "@motion-canvas/2d";
import {
  Color,
  createRef,
  easeInOutCubic,
  linear,
  tween,
  waitFor,
} from "@motion-canvas/core";
import { LEDSystem } from "../../../lib/LEDSystem";

export default makeScene2D(function* (view) {
  const ledSystem = createRef<LEDSystem>();

  view.add(<LEDSystem ref={ledSystem} />);

  const red = { r: 255, g: 0, b: 0, a: 1 };
  const black = { r: 255, g: 0, b: 0, a: 0 };

  yield* waitFor(0);

  yield ledSystem().fillAll(new Color(black));

  yield* ledSystem().fillRow(2, new Color(red), 2);
  // yield* ledSystem().fillID("L25", new Color(black), 2);

  // yield* tween(1, (value) => {
  //   const color = Color.lerp(
  //     new Color(red),
  //     new Color(black),
  //     easeInOutCubic(value)
  //   );

  //   // ledSystem().fillID("L1", color);
  //   ledSystem().fillInRange([0, 0], [8, 5], color);
  // });

  // yield* tween(2, (value) => {
  //   const color = Color.lerp(
  //     new Color("#e6a700"),
  //     new Color("#e13238"),
  //     easeInOutCubic(value)
  //   );

  //   ledSystem().fillInRange([0, 0], [8, 5], color);

  //   const color2 = Color.lerp(
  //     new Color("blue"),
  //     new Color("white"),
  //     easeInOutCubic(value)
  //   );

  //   ledSystem().fillAt([9, 2], color2);
  // });

  // yield* tween(2, (value) => {
  //   const color = Color.lerp(
  //     new Color("pink"),
  //     new Color("black"),
  //     easeInOutCubic(value)
  //   );

  //   ledSystem().fillColumn(2, color);
  //   ledSystem().fillRow(2, color);
  // });
});
