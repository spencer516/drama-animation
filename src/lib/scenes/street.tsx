import { Reference } from "@motion-canvas/core";
import { LEDSystem } from "../LEDSystem";
import { Rect } from "@motion-canvas/2d";
import { LED_YELLOW } from "../design-system";
import { Position } from "../wall-coordinate-system";

export const STREET_LIGHT_POSITIONS: Position[] = [
  [0, 0],
  [0, 1],
  [1, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [15, 0],
  [15, 1],
  [14, 2],
  [14, 3],
  [13, 4],
  [12, 5],
];

export default function makeStreet(ledSystem: Reference<LEDSystem>): void {
  STREET_LIGHT_POSITIONS.map((position) =>
    ledSystem().fillAt(position, LED_YELLOW)
  );
}
