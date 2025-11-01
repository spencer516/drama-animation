import { makeProject } from "@motion-canvas/core";
import scene from "./scene?scene";
import audio from "./Preface B (aac).aac";

export default makeProject({
  name: "51-1_short-purple-and-chaos",
  scenes: [scene],
  audio,
  experimentalFeatures: true,
});
