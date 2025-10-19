import { defineConfig } from "vite";
import motionCanvas from "@motion-canvas/vite-plugin";
import ffmpeg from "@motion-canvas/ffmpeg";
import ledPlugin from "./vite-server-plugin";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    motionCanvas({
      project: ["./src/projects/*/project.tsx"],
    }),
    ffmpeg(),
    ledPlugin(),
  ],
});
