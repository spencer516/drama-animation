import { makeProject } from "@motion-canvas/core";
import tetrisFallingScene from './tetris-falling-scene?scene';

export default makeProject({
  name: "Tetris",
  scenes: [tetrisFallingScene],
});
