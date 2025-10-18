import { Layout, Node, NodeProps } from "@motion-canvas/2d";
import { LightID, LightsArray } from "./lights-array";
import { Color, createRef, Reference } from "@motion-canvas/core";
import { Light } from "./Light";
import {
  ColumnPosition,
  Coordinates,
  Position,
  positionToCoordinates,
  RowPosition,
} from "./coordinate-system";
import lightsQuery from "./lights-query";

export interface LEDSystemProps extends NodeProps {}

type LightRefMap = Map<
  LightID,
  { ref: Reference<Light>; coordinates: Coordinates }
>;

export class LEDSystem extends Node {
  private readonly lights: LightRefMap = new Map();

  public constructor(props?: LEDSystemProps) {
    super({
      ...props,
    });

    const lights = [];

    for (const [lightID, position] of Object.entries(LightsArray)) {
      const ref = createRef<Light>();
      const coordinates = positionToCoordinates(position);

      this.lights.set(lightID as LightID, { ref, coordinates });

      lights.push(
        <Light
          ref={ref}
          lightID={lightID as LightID}
          coordinates={coordinates}
        />
      );
    }

    this.add(<Layout>{lights}</Layout>);
  }

  private *iterate(): Iterable<[Reference<Light>, Coordinates, LightID]> {
    for (const [maybeLightID, { ref, coordinates }] of this.lights) {
      const lightID = maybeLightID as LightID;
      yield [ref, coordinates, lightID];
    }
  }

  public fillID(lightID: LightID, color: Color) {
    const lightRef = this.lights.get(lightID).ref;
    lightRef().fill(color);
  }

  public fillAt(position: Position, color: Color) {
    const lightID = lightsQuery(position).at(0);
    this.fillID(lightID, color);
  }

  public fillRow(rowPosition: RowPosition, color: Color) {
    this.fillInRange([0, rowPosition], [15, rowPosition], color);
  }

  public fillColumn(columnPosition: ColumnPosition, color: Color) {
    this.fillInRange([columnPosition, 0], [columnPosition, 5], color);
  }

  public fillInRange(topLeft: Position, bottomRight: Position, color: Color) {
    for (const lightID of lightsQuery(topLeft, bottomRight)) {
      this.fillID(lightID, color);
    }
  }

  public fillAll(color: Color) {
    for (const [light] of this.iterate()) {
      light().fill(color);
    }
  }
}
