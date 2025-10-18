import { Circle, makeScene2D, View2D } from "@motion-canvas/2d";
import { Color, createRef, easeInOutCubic, tween } from "@motion-canvas/core";
import { Light } from "../../../lib/Light";

export default makeScene2D(function* (view) {
  const light = createRef<Light>();

  view.add(<Light ref={light} lightID={"1"} />);

  yield* tween(2, (value) => {
    light().fill(
      Color.lerp(
        new Color("#e6a700"),
        new Color("#e13238"),
        easeInOutCubic(value)
      )
    );
  });
});
