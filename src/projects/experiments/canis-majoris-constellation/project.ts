import { makeProject } from "@motion-canvas/core";
import scene from "./scene?scene";

export default makeProject({
  name: "Canis Majoris Constellation",
  scenes: [scene],
  experimentalFeatures: true,
});
