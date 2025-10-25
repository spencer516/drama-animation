import { makeProject } from "@motion-canvas/core";
import scene from "./scene?scene";
import mathsAppendix from "./Maths Appendix.mp3";

export default makeProject({
  name: "1-Prologue",
  scenes: [scene],
  audio: mathsAppendix,
});
