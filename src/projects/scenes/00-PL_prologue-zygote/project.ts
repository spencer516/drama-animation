import { makeProject } from "@motion-canvas/core";
import scene from "./scene?scene";
import prefaceAudio from "./Preface.mp3";
import chaosScene from "./chaos-scene?scene";

export default makeProject({
  name: "00-PL_prologue-zygote",
  scenes: [scene, chaosScene],
  audio: prefaceAudio,
  experimentalFeatures: true,
});
