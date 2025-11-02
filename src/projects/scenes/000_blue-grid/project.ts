import { makeProject } from "@motion-canvas/core";
import scene from "./scene?scene";

export default makeProject({
  name: "000_blue-grid",
  scenes: [scene],
  experimentalFeatures: true,
});
