import { makeProject } from "@motion-canvas/core";
import scene from "./scene?scene";
import audio from "./Preface B (aac).aac";

export default makeProject({
  name: "38-2_three-squares-to-chaos",
  scenes: [scene],
  experimentalFeatures: true,
  audio,
});
