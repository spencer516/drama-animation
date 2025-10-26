import { Reference } from "@motion-canvas/core";
import { LEDSystem } from "../LEDSystem";
import { Rect } from "@motion-canvas/2d";
import { LED_YELLOW } from "../design-system";

export default function makeStreet(
  ledSystem: Reference<LEDSystem>,
  _screen: Reference<Rect>
): {
  // topPath: Reference<Line>;
  // middlePath: Reference<Line>;
  // bottomPath: Reference<Line>;
} {
  // Second row is mixed
  ledSystem().fillAt([0, 0], LED_YELLOW);
  ledSystem().fillAt([0, 1], LED_YELLOW);
  ledSystem().fillAt([1, 2], LED_YELLOW);
  ledSystem().fillAt([1, 3], LED_YELLOW);
  ledSystem().fillAt([2, 4], LED_YELLOW);
  ledSystem().fillAt([3, 5], LED_YELLOW);

  ledSystem().fillAt([15, 0], LED_YELLOW);
  ledSystem().fillAt([15, 1], LED_YELLOW);
  ledSystem().fillAt([14, 2], LED_YELLOW);
  ledSystem().fillAt([14, 3], LED_YELLOW);
  ledSystem().fillAt([13, 4], LED_YELLOW);
  ledSystem().fillAt([12, 5], LED_YELLOW);

  return {};
}
