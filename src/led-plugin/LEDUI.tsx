/* @jsxImportSource preact */

import "./ui-plugin.css";
import useFetch from "@/lib/useFetch";
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
    <Tab title="Drama Scenes" id="custom-drama-scenes" tab={tab}>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4 h16 v16 h-16 z" transform="rotate(15 12 12)" />
      </svg>
    </Tab>
  );
}

type Project = {
  name: string;
  isValid: boolean;
};

function CheckIcon() {
  return (
    <svg
      className="led-ui-icon"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M2 6 L5 9 L10 3"
        stroke="green"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      className="led-ui-icon"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M2 2 L10 10 M10 2 L2 10"
        stroke="red"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  );
}

function PaneComponent() {
  const { data } = useFetch<Project[]>("/led/list-projects");

  return (
    <Pane title="Jesuit Drama Settings" id="custom-drama-scenes-pane">
      <h4 className="ui-plugin-header">Scenes</h4>
      <ul className="ui-plugin-list">
        {data != null &&
          data.map(({ name, isValid }) => (
            <li key={name}>
              {isValid ? <CheckIcon /> : <XIcon />}
              <a
                className="ui-plugin-link"
                href={`/src/projects/scenes/${name}/project`}
              >
                {name}
              </a>
            </li>
          ))}
      </ul>
    </Pane>
  );
}

export const LEDUIConfig: PluginTabConfig = {
  name: "inspector",
  tabComponent: TabComponent,
  paneComponent: PaneComponent,
};
