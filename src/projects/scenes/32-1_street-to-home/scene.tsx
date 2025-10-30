import { makeScene2D } from "@motion-canvas/2d";
import { streetToSchool } from "@/lib/transitions/school-to-street";

export default makeScene2D(function* (view) {
  yield* streetToSchool(view, {
    transitionDuration: 1,
  });
});
