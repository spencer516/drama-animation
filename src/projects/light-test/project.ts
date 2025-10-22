import { makeProject } from "@motion-canvas/core";
import lightByLight from "./light-by-light?scene";

export default makeProject({
  name: "Demo Project",
  scenes: [lightByLight],
});
