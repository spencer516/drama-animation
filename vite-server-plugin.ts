import { Plugin, PLUGIN_OPTIONS } from "@motion-canvas/vite-plugin";
import { json } from "body-parser";
import { IncomingMessage } from "connect";
import { promises as fs } from "fs";
import path from "path";

interface BodyRequest extends IncomingMessage {
  body?: { projectName: string; frames: any[] };
}

export default function myVitePlugin(): Plugin {
  return {
    name: "led-server-plugin",
    configureServer(server) {
      server.middlewares.use("/persist-led-json", json({ limit: "50mb" }));
      server.middlewares.use(
        "/persist-led-json",
        async (req: BodyRequest, res) => {
          res.end();
          const { projectName, frames } = req.body;
          await writeFileSafe(
            path.join("output", `${projectName} [LED].json`),
            JSON.stringify(frames)
          );
        }
      );
    },
    [PLUGIN_OPTIONS]: {
      entryPoint: "@/led-plugin/runtime-plugin.ts",
    },
  };
}

async function writeFileSafe(filePath: string, data: string) {
  const dir = path.dirname(filePath);

  // Ensure the directory exists
  await fs.mkdir(dir, { recursive: true });

  // Write the file
  await fs.writeFile(filePath, data, "utf8");
}
