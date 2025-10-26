import { Plugin, PLUGIN_OPTIONS } from "@motion-canvas/vite-plugin";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

export default function ledRuntimePlugin(): Plugin {
  return {
    name: "led-server-runtime-plugin",
    configureServer(server) {
      server.middlewares.use("/led/list-projects", async (req, res) => {
        const scenesDir = join(__dirname, "../projects/scenes");
        const projects = [];

        try {
          const entries = await readdir(scenesDir);

          for (const entry of entries) {
            const entryPath = join(scenesDir, entry);

            // Check if it's a directory
            const stats = await stat(entryPath);
            if (stats.isDirectory()) {
              const projectFilePath = join(entryPath, "project.ts");
              let isValid = false;

              try {
                const projectContent = await readFile(projectFilePath, "utf-8");
                // Check if the file contains name: "directoryName"
                isValid = projectContent.includes(`name: "${entry}"`);
              } catch (err) {
                // project.ts doesn't exist or can't be read
                isValid = false;
              }

              projects.push({ name: entry, isValid });
            }
          }
        } catch (err) {
          console.error("Error reading projects directory:", err);
        }

        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(projects));
      });
    },
    [PLUGIN_OPTIONS]: {
      entryPoint: "@/led-plugin/ui-plugin.ts",
    },
  };
}
