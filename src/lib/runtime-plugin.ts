import { makePlugin, RendererState } from "@motion-canvas/core";
import LEDExporter from "./LEDExporter";

export default makePlugin(() => {
  let projectName = "Unknown Project";

  return {
    name: "led-runtime",
    renderer(renderer) {
      renderer.onStateChanged.subscribe((renderState) => {
        if (renderState === RendererState.Working) {
          LEDExporter.start(projectName, renderer);
        }
      });
    },
    project(project) {
      projectName = project.name;
    },
    player(player) {
      // player.onFrameChanged.subscribe((number) => {
      //   console.log("Player Frame!", number);
      // });
    },
  };
});
