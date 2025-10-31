import { makeProject } from "@motion-canvas/core";
import scene from "./scene?scene";
import audio from "./Preface B (aac).aac";

export default makeProject({
  name: "36-1_train-to-chaos",
  scenes: [scene],
  experimentalFeatures: true,
  audio,
});
