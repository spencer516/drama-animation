import { makeProject } from "@motion-canvas/core";
import scene from "./scene?scene";

export default makeProject({
  name: "Light Test",
  scenes: [scene],
  experimentalFeatures: true,
});
