import { makeScene2D } from "@motion-canvas/2d";
import { schoolToStreet } from "@/lib/transitions/school-to-street";

export default makeScene2D(function* (view) {
  yield* schoolToStreet(view, {
    transitionDuration: 1,
  });
});
