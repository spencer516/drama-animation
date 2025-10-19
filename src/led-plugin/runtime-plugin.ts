import {
  makePlugin,
  RendererSettings,
  RendererState,
} from "@motion-canvas/core";
import LEDExporterState from "../lib/LEDExporterState";
import { LEDExporter } from "./LEDExporter";

export default makePlugin(() => {
  let projectName = "Unknown Project";

  return {
    name: "led-runtime",
    renderer(renderer) {
      const prevRenderer = renderer.render;
      renderer.render = function (settings: RendererSettings) {
        if (settings?.exporter.name !== LEDExporter.id) {
          LEDExporterState.hideLEDs();
        }

        return prevRenderer.call(this, settings);
      };

      renderer.onStateChanged.subscribe((renderState) => {
        if (renderState === RendererState.Working) {
          LEDExporterState.start(projectName, renderer);
        }
      });

      renderer.onFinished.subscribe((hander) => {
        LEDExporterState.showLEDs();
      });
    },
    project(project) {
      projectName = project.name;
    },
    exporters() {
      return [LEDExporter];
    },
  };
});
