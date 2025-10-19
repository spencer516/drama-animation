import Flatbush from "flatbush";
import { LightID, LightsArray } from "./lights-array";
import { Position } from "./wall-coordinate-system";

const lightRefs = Object.entries(LightsArray).map(([lightID, coordinates]) => ({
  lightID,
  x: coordinates[0],
  y: coordinates[1],
}));

const index = new Flatbush(lightRefs.length);

for (const { x, y } of lightRefs) {
  index.add(x, y, x, y);
}

index.finish();

export default function lightsQuery(
  topLeft: Position,
  bottomRight: Position | undefined = null
): LightID[] {
  const [minX, minY] = topLeft;
  const [maxX, maxY] = bottomRight ?? topLeft;

  return index
    .search(minX, minY, maxX, maxY)
    .map((index) => lightRefs.at(index)?.lightID ?? null)
    .filter(Boolean);
}
