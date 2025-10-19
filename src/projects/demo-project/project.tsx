import { makeProject } from "@motion-canvas/core";
import rowByRowInThenOut from "./scenes/row-by-row-in-then-out?scene";
import columnByColumnInThenOut from "./scenes/column-by-column-in-then-out?scene";

export default makeProject({
  name: "Demo Project",
  scenes: [rowByRowInThenOut, columnByColumnInThenOut],
});
