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
      let isLEDExporter = false;
      renderer.render = function (settings: RendererSettings) {
        isLEDExporter = settings?.exporter.name === LEDExporter.id;

        if (!isLEDExporter) {
          LEDExporterState.hideLEDs();
        }

        return prevRenderer.call(this, settings);
      };

      renderer.onStateChanged.subscribe((renderState) => {
        if (isLEDExporter && renderState === RendererState.Working) {
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
