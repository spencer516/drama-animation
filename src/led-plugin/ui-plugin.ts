import { makeEditorPlugin } from "@motion-canvas/ui";
import { LEDUIConfig } from "./LEDUI";

export default makeEditorPlugin({
  name: "editor-test",
  tabs: [LEDUIConfig],
});
