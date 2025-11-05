import homeToSchool from "@/lib/transitions/home-to-school";
import { makeScene2D } from "@motion-canvas/2d";

export default makeScene2D(function* (view) {
  yield* homeToSchool(view, {
    lineDuration: 0.9,
    stagger: 0.1,
    randomSeed: 777,
    direction: "top-to-bottom",
  });
});
