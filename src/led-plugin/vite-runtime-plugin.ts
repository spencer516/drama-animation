import {
  Plugin,
  PLUGIN_OPTIONS,
  PluginConfig,
} from "@motion-canvas/vite-plugin";
import { json } from "body-parser";
import { IncomingMessage } from "connect";
import { promises as fs } from "fs";
import path from "path";

interface BodyRequest extends IncomingMessage {
  body?: { projectName: string; frames: number[] };
}

export default function ledRuntimePlugin(): Plugin {
  let config: PluginConfig;
  return {
    name: "led-server-runtime-plugin",
    configureServer(server) {
      server.middlewares.use("/persist-led-json", json({ limit: "50mb" }));
      server.middlewares.use(
        "/persist-led-json",
        async (req: BodyRequest, res) => {
          res.end();
          const { projectName, frames } = req.body;

          const framesBuffer = new Int16Array(frames);

          await writeFileSafe(
            path.join(config.output, `${projectName}.bin`),
            Buffer.from(framesBuffer.buffer)
          );
        }
      );
    },
    [PLUGIN_OPTIONS]: {
      entryPoint: "@/led-plugin/runtime-plugin.ts",
      async config(value) {
        config = value;
      },
    },
  };
}

async function writeFileSafe(filePath: string, data: Buffer<ArrayBuffer>) {
  const dir = path.dirname(filePath);

  // Ensure the directory exists
  await fs.mkdir(dir, { recursive: true });

  // Write the file
  await fs.writeFile(filePath, data);
}
