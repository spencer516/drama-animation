import { makeProject } from "@motion-canvas/core";
import runtimePlugin from "../../led-plugin/runtime-plugin";
import example from "./scenes/example?scene";

export default makeProject({
  scenes: [example],
  plugins: [runtimePlugin()],
});
