import { Layout, Node, NodeProps, Rect, View2D } from "@motion-canvas/2d";
import { LightID, LightsArray } from "./lights-array";
import {
  all,
  Color,
  createRef,
  Reference,
  ThreadGenerator,
} from "@motion-canvas/core";
import { Light } from "./Light";
import {
  ColumnPosition,
  Coordinates,
  Position,
  positionToCoordinates,
  RowPosition,
} from "./wall-coordinate-system";
import lightsQuery from "./lights-query";
import { LED_OFF } from "./design-system";

export interface LEDSystemProps extends NodeProps {}

type LightRefMap = Map<
  LightID,
  { ref: Reference<Light>; coordinates: Coordinates }
>;

export function setupLEDScene(view: View2D): {
  ledSystem: Reference<LEDSystem>;
  screen: Reference<Rect>;
} {
  const screen = createRef<Rect>();
  const ledSystem = createRef<LEDSystem>();

  view.add(
    <>
      <Rect ref={screen} width="100%" height="100%" />
      <LEDSystem ref={ledSystem} />
    </>
  );

  ledSystem().fillAll(LED_OFF);

  return { ledSystem, screen };
}

export class LEDSystem extends Node {
  private readonly lights: LightRefMap = new Map();

  public constructor(props: LEDSystemProps) {
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

  public *iterate(): Iterable<[Reference<Light>, Coordinates, LightID]> {
    for (const [maybeLightID, { ref, coordinates }] of this.lights) {
      const lightID = maybeLightID as LightID;
      yield [ref, coordinates, lightID];
    }
  }

  public lightRefAt(position: Position): Reference<Light> {
    const lightID = lightsQuery(position).at(0);
    return this.lights.get(lightID).ref;
  }

  public fillID(lightID: LightID, color: Color): void;

  public fillID(
    lightID: LightID,
    color: Color,
    duration: number
  ): ThreadGenerator;

  public fillID(
    lightID: LightID,
    color: Color,
    duration: number | null = null
  ): void | ThreadGenerator {
    const lightRef = this.lights.get(lightID).ref;

    if (duration == null) {
      lightRef().fill(color);
    } else {
      return function* (this: LEDSystem) {
        yield* lightRef().fill(color, duration);
      }.apply(this);
    }
  }

  public fillAt(position: Position, color: Color): void;

  public fillAt(
    position: Position,
    color: Color,
    duration: number
  ): ThreadGenerator;

  public fillAt(
    position: Position,
    color: Color,
    duration: number | null = null
  ): void | ThreadGenerator {
    const lightID = lightsQuery(position).at(0);

    if (duration == null) {
      this.fillID(lightID, color);
    } else {
      return function* (this: LEDSystem) {
        yield* this.fillID(lightID, color, duration);
      }.apply(this);
    }
  }

  public fillRow(rowPosition: RowPosition, color: Color): void;

  public fillRow(
    rowPosition: RowPosition,
    color: Color,
    duration: number
  ): ThreadGenerator;

  public fillRow(
    rowPosition: RowPosition,
    color: Color,
    duration: number | null = null
  ): void | ThreadGenerator {
    if (duration == null) {
      this.fillInRange([0, rowPosition], [15, rowPosition], color);
    } else {
      return function* (this: LEDSystem) {
        yield* this.fillInRange(
          [0, rowPosition],
          [15, rowPosition],
          color,
          duration
        );
      }.apply(this);
    }
  }

  public fillColumn(columnPosition: ColumnPosition, color: Color): void;

  public fillColumn(
    columnPosition: ColumnPosition,
    color: Color,
    duration: number
  ): ThreadGenerator;

  public fillColumn(
    columnPosition: ColumnPosition,
    color: Color,
    duration: number | null = null
  ): void | ThreadGenerator {
    if (duration == null) {
      this.fillInRange([columnPosition, 0], [columnPosition, 5], color);
    } else {
      return function* (this: LEDSystem) {
        yield* this.fillInRange(
          [columnPosition, 0],
          [columnPosition, 5],
          color,
          duration
        );
      }.apply(this);
    }
  }

  public fillInRange(
    topLeft: Position,
    bottomRight: Position,
    color: Color
  ): void;

  public fillInRange(
    topLeft: Position,
    bottomRight: Position,
    color: Color,
    duration: number
  ): ThreadGenerator;

  public fillInRange(
    topLeft: Position,
    bottomRight: Position,
    color: Color,
    duration: number | null = null
  ): void | ThreadGenerator {
    if (duration == null) {
      for (const lightID of lightsQuery(topLeft, bottomRight)) {
        this.fillID(lightID, color);
      }
    } else {
      return function* (this: LEDSystem) {
        const generators = [];
        for (const lightID of lightsQuery(topLeft, bottomRight)) {
          generators.push(this.fillID(lightID, color, duration));
        }
        yield* all(...generators);
      }.apply(this);
    }
  }

  public fillAll(color: Color): void;

  public fillAll(color: Color, duration: number): ThreadGenerator;

  public fillAll(
    color: Color,
    duration: number | null = null
  ): void | ThreadGenerator {
    if (duration == null) {
      for (const [light] of this.iterate()) {
        light().fill(color);
      }
    } else {
      return function* (this: LEDSystem) {
        const generators = [];

        for (const [light] of this.iterate()) {
          generators.push(light().fill(color, duration));
        }

        yield* all(...generators);
      }.apply(this);
    }
  }
}
