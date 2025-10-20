import { defineConfig } from "vite";
import motionCanvas from "@motion-canvas/vite-plugin";
import ffmpeg from "@motion-canvas/ffmpeg";
import ledPlugin from "./vite-server-plugin";
import { resolve } from "node:path";
import os from "os";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    motionCanvas({
      project: ["./src/projects/*/project.ts"],
      output: path.join(os.homedir(), "desktop", "drama-animation"),
    }),
    ffmpeg(),
    ledPlugin(),
  ],
});
