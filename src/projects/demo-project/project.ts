import { makeProject } from "@motion-canvas/core";
import rowByRowInThenOut from "./row-by-row-in-then-out?scene";
import columnByColumnInThenOut from "./column-by-column-in-then-out?scene";

export default makeProject({
  name: "Demo Project",
  scenes: [rowByRowInThenOut, columnByColumnInThenOut],
});
