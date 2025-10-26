/* @jsxImportSource preact */

import {
  Pane,
  PhotoCamera,
  PluginTabConfig,
  PluginTabProps,
  Separator,
  Tab,
} from "@motion-canvas/ui";

function TabComponent({ tab }: PluginTabProps) {
  return (
    <Tab title="My Tab" id="custom-tab" tab={tab}>
      <PhotoCamera />
    </Tab>
  );
}

function PaneComponent() {
  return (
    <Pane title="My Pane" id="custom-pane">
      <Separator size={1} />
      Hello <strong>World</strong>!
    </Pane>
  );
}

export const LEDUIConfig: PluginTabConfig = {
  name: "inspector",
  tabComponent: TabComponent,
  paneComponent: PaneComponent,
};
