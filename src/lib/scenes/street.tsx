import { Reference } from "@motion-canvas/core";
import { LEDSystem } from "../LEDSystem";
import { Rect } from "@motion-canvas/2d";
import { LED_YELLOW } from "../design-system";
import { Position } from "../wall-coordinate-system";

export const STREET_LIGHT_POSITIONS: Position[] = [
  [1, 0],
  [1, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [1, 5],
  [14, 0],
  [14, 1],
  [14, 2],
  [14, 3],
  [14, 4],
  [14, 5],
];

export default function makeStreet(ledSystem: Reference<LEDSystem>): void {
  STREET_LIGHT_POSITIONS.map((position) =>
    ledSystem().fillAt(position, LED_YELLOW)
  );
}
