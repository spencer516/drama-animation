import {
  Circle,
  colorSignal,
  initial,
  Node,
  NodeProps,
  signal,
} from "@motion-canvas/2d";
import {
  Color,
  ColorSignal,
  createDeferredEffect,
  createRef,
  linear,
  SimpleSignal,
  ThreadGenerator,
} from "@motion-canvas/core";
import { LightID } from "./lights-array";
import LEDExporter from "./LEDExporter";
import { Coordinates } from "./wall-coordinate-system";

export interface LightProps extends NodeProps {
  lightID: LightID;
  coordinates: Coordinates;
}

export class Light extends Node {
  @signal()
  public declare readonly lightID: SimpleSignal<LightID, this>;

  @signal()
  public declare readonly coordinates: SimpleSignal<Coordinates, this>;

  private readonly circle = createRef<Circle>();

  @initial("black")
  @colorSignal()
  private declare readonly color: ColorSignal<this>;

  public constructor(props?: LightProps) {
    super({
      ...props,
    });

    const [x, y] = this.coordinates();

    this.add(
      <Circle
        ref={this.circle}
        size={10}
        x={x}
        y={y}
        fill={this.color()}
        zIndex={100}
      />
    );

    const lightID = this.lightID();

    createDeferredEffect(() => {
      LEDExporter.updateLight(lightID, this.color());
    });
  }

  public fill(color: Color): void;
  public fill(color: Color, duration: number): ThreadGenerator;

  public fill(
    color: Color,
    duration: number | null = null
  ): void | ThreadGenerator {
    if (duration == null) {
      this.circle().fill(color);
      this.color(color);
    } else {
      return function* (this: Light) {
        for (const step of this.circle().fill(color, duration, linear)) {
          this.color(this.circle().fill() as Color);
          yield step;
        }
      }.apply(this);
    }
  }
}
