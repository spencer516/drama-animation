import { Color, Reference, ThreadGenerator, tween } from "@motion-canvas/core";
import { LEDSystem } from "../LEDSystem";
import { sequenceColumns, sequenceRows } from "../wall-coordinate-system";

type Params = {
  ledSystem: Reference<LEDSystem>;
  initialColor: Color;
  colorStops: Color[];
  horizontalDirection: "left-to-right" | "right-to-left" | "static";
  verticalDirection: "top-to-bottom" | "bottom-to-top" | "static";
  durationPerStop: number;
  spread: number;
  numLoops: number;
};

export default function ledGradientMovement({
  ledSystem,
  colorStops,
  horizontalDirection,
  verticalDirection,
  durationPerStop,
  spread,
}: Params): () => ThreadGenerator {
  const allColorStops = [
    ...colorStops,
    ...Array.from(colorStops).reverse().slice(1),
  ];
  const totalDurationPerLoop = durationPerStop * allColorStops.length;

  return () => {
    return tween(totalDurationPerLoop, (progress) => {
      const colorOffset = progress * allColorStops.length;

      sequenceRows().forEach((row) => {
        sequenceColumns().forEach((column) => {
          // Calculate positional offsets based on direction
          let positionalOffset = 0;

          // Vertical contribution
          if (verticalDirection === "bottom-to-top") {
            positionalOffset += (row / 5) * spread;
          } else if (verticalDirection === "top-to-bottom") {
            positionalOffset += ((5 - row) / 5) * spread;
          }

          // Horizontal contribution
          if (horizontalDirection === "right-to-left") {
            positionalOffset += (column / 15) * spread;
          } else if (horizontalDirection === "left-to-right") {
            positionalOffset += ((15 - column) / 15) * spread;
          }

          // Calculate the color index for this LED
          const colorIndex =
            (colorOffset + positionalOffset) % allColorStops.length;

          const lowerIndex = Math.floor(colorIndex) % allColorStops.length;
          const upperIndex = Math.ceil(colorIndex) % allColorStops.length;
          const localProgress = colorIndex - Math.floor(colorIndex);

          const lowerColor = new Color(allColorStops[lowerIndex]);
          const upperColor = new Color(allColorStops[upperIndex]);
          const ledColor = Color.lerp(lowerColor, upperColor, localProgress);

          ledSystem().fillAt([column, row], ledColor);
        });
      });
    });
  };
}
