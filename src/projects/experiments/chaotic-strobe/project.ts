import { makeProject } from "@motion-canvas/core";
import scene from "./scene?scene";

export default makeProject({
  name: "Chaotic Strobe",
  scenes: [scene],
  experimentalFeatures: true,
});
