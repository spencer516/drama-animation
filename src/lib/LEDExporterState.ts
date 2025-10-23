import { Color, Renderer, RendererResult } from "@motion-canvas/core";
import { LightID, LightsArray } from "./lights-array";

type LightAtFrame = {
  lightID: LightID;
  color: Color;
};

type Frame = {
  frameNumber: number;
  lights: LightAtFrame[];
};

type SerializedFrame = {
  [channel: string]: number;
};

const ACTIVE_EXPORTERS: Set<LEDExporterState> = new Set();

export default class LEDExporterState {
  private lightState: Map<LightID, Color> = new Map();
  private projectName: string;

  private frames: Frame[] = [];

  private static areLEDsVisible: boolean = true;

  static get shouldHideLEDs() {
    return !this.areLEDsVisible;
  }

  static hideLEDs() {
    this.areLEDsVisible = false;
  }

  static showLEDs() {
    this.areLEDsVisible = true;
  }

  public constructor(projectName: string) {
    this.projectName = projectName;

    for (const [lightID] of Object.entries(LightsArray)) {
      this.lightState.set(lightID as LightID, new Color("black"));
    }
  }

  static updateLight(lightID: LightID, color: Color) {
    for (const exporter of ACTIVE_EXPORTERS) {
      exporter.updateLight(lightID, color);
    }
  }

  private updateLight(lightID: LightID, color: Color) {
    if (lightID === "L1") {
      console.log("updating light", color.rgb());
    }
    this.lightState.set(lightID, color);
  }

  static start(projectName: string, renderer: Renderer) {
    const exporter = new LEDExporterState(projectName);

    ACTIVE_EXPORTERS.add(exporter);

    const unsubOnFrame = renderer.onFrameChanged.subscribe((frame) => {
      exporter.onFrame(frame);
    });

    const unsubFinished = renderer.onFinished.subscribe((result) => {
      if (result === RendererResult.Success) {
        exporter.finalize();
      }

      ACTIVE_EXPORTERS.delete(exporter);
      unsubFinished();
      unsubOnFrame();
    });
  }

  public onFrame(frameNumber: number) {
    const newFrame: Frame = { frameNumber, lights: [] };

    for (const [lightID, color] of this.lightState) {
      newFrame.lights.push({
        lightID,
        color,
      });
    }

    this.frames.push(newFrame);
  }

  public async finalize() {
    const frames = this.frames.map((frame) => {
      const currentFrame: SerializedFrame = {};

      let index = 0;
      for (const { color } of frame.lights) {
        const channel = index * 3;
        const [r, g, b] = color.rgb();

        currentFrame[channel] = rgbToChannel(r);
        currentFrame[channel + 1] = rgbToChannel(g);
        currentFrame[channel + 2] = rgbToChannel(b);

        index++;
      }

      return currentFrame;
    });

    await fetch("/persist-led-json", {
      method: "POST",
      body: JSON.stringify({ projectName: this.projectName, frames }),
      headers: { "Content-Type": "application/json" },
    }).catch((err) => {
      console.error(err);
    });
  }
}

function rgbToChannel(value: number): number {
  const { round, min, max } = Math;
  return max(0, min(100, round((100 * value) / 255)));
}
