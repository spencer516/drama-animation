import {
  Plugin,
  PLUGIN_OPTIONS,
  PluginConfig,
} from "@motion-canvas/vite-plugin";

export default function ledRuntimePlugin(): Plugin {
  return {
    name: "led-server-runtime-plugin",
    [PLUGIN_OPTIONS]: {
      entryPoint: "@/led-plugin/ui-plugin.ts",
    },
  };
}
