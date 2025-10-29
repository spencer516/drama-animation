import type {
  Exporter,
  MetaField,
  Project,
  RendererResult,
  RendererSettings,
} from "@motion-canvas/core";
import { ObjectMetaField } from "@motion-canvas/core";

export class LEDExporter implements Exporter {
  public static readonly id = "leds-exporter";
  public static readonly displayName = "LEDs Binary";

  public static meta(project: Project): MetaField<any> {
    return new ObjectMetaField(this.displayName, {});
  }

  public static async create(project: Project, settings: RendererSettings) {
    return new LEDExporter(project, settings);
  }

  public constructor(
    private readonly project: Project,
    private readonly settings: RendererSettings
  ) {}

  public async start(): Promise<void> {
    // Do nothing!
  }

  public async handleFrame(canvas: HTMLCanvasElement): Promise<void> {
    // Do nothing! All handled client side.
  }

  public async stop(result: RendererResult): Promise<void> {
    // Do nothing! Handled client side
    console.log("Done with LED Export!");
  }
}
