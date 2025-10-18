import {
  Circle,
  colorSignal,
  Node,
  NodeProps,
  signal,
} from "@motion-canvas/2d";
import {
  Color,
  ColorSignal,
  createEffect,
  createRef,
} from "@motion-canvas/core";

const lights = {
  "1": { x: 20, y: 20 },
  "2": { x: 60, y: 20 },
  "3": { x: 100, y: 20 },
};

type LightID = keyof typeof lights;

export interface LightProps extends NodeProps {
  lightID: LightID;
}

export class Light extends Node {
  @signal()
  public declare readonly lightID: LightID;

  private readonly circle = createRef<Circle>();

  @colorSignal()
  private declare readonly color: ColorSignal<this>;

  public constructor(props?: LightProps) {
    super({
      ...props,
    });

    // const { x, y } = lights[this.lightID()];
    const x = 0;
    const y = 0;

    this.add(
      <Circle ref={this.circle} size={25} x={x} y={y} fill={this.color()} />
    );

    createEffect(() => {
      console.log("Color changed", this.color()?.rgb());
    });
  }

  public fill(color: Color): void {
    this.circle().fill(color);
    this.color(color);
  }
}
