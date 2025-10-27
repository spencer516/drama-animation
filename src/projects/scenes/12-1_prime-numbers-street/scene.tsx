import { Code, Layout, makeScene2D, Rect } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { all, createRefArray, waitFor } from "@motion-canvas/core";
import makeStreet from "@/lib/scenes/street";
import {
  allPositions,
  Position,
  positionToRect,
} from "@/lib/wall-coordinate-system";

// Animation constants
const FADE_IN_DURATION = 1;
const PAUSE_DURATION = 1;
const FADE_OUT_NON_PRIMES_DURATION = 1;
const FINAL_FADE_OUT_DURATION = 1;

// Check if a number is prime
function isPrime(num: number): boolean {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const boxRefs = createRefArray<Layout>();

  makeStreet(ledSystem);

  screen().add(
    allPositions().map((position, num) => {
      const { x, y, width, height } = positionToRect(position, 1, 1);

      return (
        <Layout ref={boxRefs} opacity={0}>
          <Rect x={x} y={y} width={width} height={height} fill="white" />
          <Code
            fontSize={90}
            x={x}
            y={y + 12}
            fill="black"
            code={(num + 1).toString()}
          />
        </Layout>
      );
    })
  );

  // Fade in all numbers
  yield* waitFor(0.5);
  yield* all(...boxRefs.map((ref) => ref.opacity(1, FADE_IN_DURATION)));

  // Pause
  yield* waitFor(PAUSE_DURATION);

  // Fade out non-prime numbers
  const fadeOutAnimations = [];
  for (let i = 0; i < boxRefs.length; i++) {
    const num = i + 1;
    if (!isPrime(num)) {
      fadeOutAnimations.push(
        boxRefs[i].opacity(0, FADE_OUT_NON_PRIMES_DURATION)
      );
    }
  }
  yield* all(...fadeOutAnimations);

  // Pause before final fade out
  yield* waitFor(PAUSE_DURATION);

  // Fade out remaining prime numbers
  yield* all(...boxRefs.map((ref) => ref.opacity(0, FINAL_FADE_OUT_DURATION)));

  yield* waitFor(1);
});
