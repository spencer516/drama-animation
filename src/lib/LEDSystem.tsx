import { Layout, Node, NodeProps } from "@motion-canvas/2d";
import { Coordinates, LightID, LightsArray } from "./lights-array";
import { Color, createRef, Reference } from "@motion-canvas/core";
import { Light } from "./Light";
import { transformCoordinates } from "./coordinate-system";

export interface LEDSystemProps extends NodeProps {}

type LightRefMap = Map<LightID, Reference<Light>>;

export class LEDSystem extends Node {
  private readonly lights: LightRefMap = new Map();

  public constructor(props?: LEDSystemProps) {
    super({
      ...props,
    });

    const lights = [];

    for (const [lightID, coordinates] of Object.entries(LightsArray)) {
      const ref = createRef<Light>();

      this.lights.set(lightID as LightID, ref);

      lights.push(
        <Light
          ref={ref}
          lightID={lightID as LightID}
          coordinates={transformCoordinates(coordinates)}
        />
      );
    }

    this.add(<Layout>{lights}</Layout>);
  }

  private *iterate(): Iterable<[Reference<Light>, LightID, Coordinates]> {
    for (const [maybeLightID, coords] of Object.entries(LightsArray)) {
      const lightID = maybeLightID as LightID;
      yield [this.lights.get(lightID), lightID, coords];
    }
  }

  public fillAll(color: Color) {
    for (const [light] of this.iterate()) {
      light().fill(color);
    }
  }
}
