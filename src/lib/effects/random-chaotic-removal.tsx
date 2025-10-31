import { Line, Rect } from "@motion-canvas/2d";
import {
  Color,
  easeInQuad,
  easeOutQuad,
  Random,
  ReferenceArray,
  spawn,
  waitFor,
} from "@motion-canvas/core";

export function chaoticLineRemoval(random: Random, linesRef: Line[]) {
  for (const [line, order] of randomOrdering(random, linesRef)) {
    const delay = (order / linesRef.length) * 0.3; // Spread over 0.3s
    const flickerDuration = 0.05 + random.nextFloat() * 0.05; // 0.05-0.1s
    const fadeDuration = 0.1 + random.nextFloat() * 0.1; // 0.1-0.2s

    spawn(function* () {
      yield* waitFor(delay);

      const stroke = line.stroke() as Color;

      // Quick flicker to bright blue
      yield* line.stroke(stroke.brighten(2), flickerDuration, easeOutQuad);

      // Fade away
      yield* line.opacity(0, fadeDuration, easeInQuad);

      line.remove();
    });
  }
}

export function chaoticRectRemoval(random: Random, rects: Rect[]) {
  for (const [rect, order] of randomOrdering(random, rects)) {
    const delay = (order / rects.length) * 0.3; // Spread over 0.3s
    const flickerDuration = 0.05 + random.nextFloat() * 0.05; // 0.05-0.1s
    const fadeDuration = 0.1 + random.nextFloat() * 0.1; // 0.1-0.2s

    spawn(function* () {
      yield* waitFor(delay);

      const stroke = rect.fill() as Color;

      // Quick flicker to bright blue
      yield* rect.fill(stroke.brighten(2), flickerDuration, easeOutQuad);

      // Fade away
      yield* rect.opacity(0, fadeDuration, easeInQuad);

      rect.remove();
    });
  }
}

function* randomOrdering<T>(random: Random, items: T[]) {
  const length = items.length;

  const indices = Array.from({ length }, (_, i) => i);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random.nextFloat() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (let i = 0; i < length; i++) {
    const randomIndex = indices[i];
    yield [items[randomIndex], i] as const;
  }
}
