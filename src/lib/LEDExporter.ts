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

const ACTIVE_EXPORTERS: Set<LEDExporter> = new Set();

export default class LEDExporter {
  private lightState: Map<LightID, Color> = new Map();

  private frames: Frame[] = [];

  public constructor() {
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
    this.lightState.set(lightID, color);
  }

  static start(renderer: Renderer) {
    const exporter = new LEDExporter();

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

  public finalize() {
    const frames = this.frames.map((frame) => {
      const currentFrame: SerializedFrame = {};

      let index = 0;
      for (const [, color] of this.lightState) {
        const channel = index * 3;
        const [r, g, b] = color.rgb();

        currentFrame[channel] = rgbToChannel(r);
        currentFrame[channel + 1] = rgbToChannel(g);
        currentFrame[channel + 2] = rgbToChannel(b);

        index++;
      }

      return currentFrame;
    });

    console.log("EXPORTING FRAMES JSON");
    console.log(frames);
  }
}

function rgbToChannel(value: number): number {
  const { round, min, max } = Math;
  return max(0, min(100, round((100 * value) / 255)));
}
