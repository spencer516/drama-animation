import { makePlugin, RendererResult, RendererState } from "@motion-canvas/core";
import LEDExporter from "../lib/LEDExporter";

export default makePlugin({
  name: "led-runtime",
  renderer(renderer) {
    renderer.onStateChanged.subscribe((renderState) => {
      if (renderState === RendererState.Working) {
        LEDExporter.start(renderer);
      }
    });
  },
  player(player) {
    // player.onFrameChanged.subscribe((number) => {
    //   console.log("Player Frame!", number);
    // });
  },
});
