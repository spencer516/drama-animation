import { makeProject } from "@motion-canvas/core";
import scene from "./scene?scene";
import audio from "./Preface B (aac).aac";

export default makeProject({
  name: "23-1_blue-and-chaos",
  scenes: [scene],
  audio,
  experimentalFeatures: true,
});
