import { Coordinates } from "./lights-array";

const translateX = -900;
const translateY = -300;
const scale = 120;

export function transformCoordinates({ x, y }: Coordinates): Coordinates {
  const newX = x * scale + translateX;
  const newY = y * scale + translateY;

  return { x: newX, y: newY };
}
