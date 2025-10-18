import { makeScene2D } from "@motion-canvas/2d";
import { Color, createRef, easeInOutCubic, tween } from "@motion-canvas/core";
import { LEDSystem } from "../../../lib/LEDSystem";

export default makeScene2D(function* (view) {
  const ledSystem = createRef<LEDSystem>();

  view.add(<LEDSystem ref={ledSystem} />);

  yield* tween(0.25, (value) => {
    ledSystem().fillAll(
      Color.lerp(
        new Color("#e6a700"),
        new Color("#e13238"),
        easeInOutCubic(value)
      )
    );
  });

  // yield* tween(2, (value) => {
  //   ledSystem().fillAll(
  //     Color.lerp(
  //       new Color("#e13238"),
  //       new Color("black"),
  //       easeInOutCubic(value)
  //     )
  //   );
  // });
});
