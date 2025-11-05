import { Layout, makeScene2D, Txt } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  createRefArray,
  sequence,
  useRandom,
  waitFor,
} from "@motion-canvas/core";
import makeStreet from "@/lib/scenes/street";
import {
  allPositions,
  Position,
  positionToRect,
} from "@/lib/wall-coordinate-system";
import shuffleArray from "@/lib/shuffle-array";

// Animation constants
const FADE_IN_DURATION = 0.5;
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
  const random = useRandom();

  const boxRefs = createRefArray<Layout>();

  makeStreet(ledSystem);

  screen().add(
    allPositions(false).map((position, num) => {
      const { x, y } = positionToRect(position, 1, 1);

      return (
        <Layout ref={boxRefs} opacity={0} scale={1.5}>
          <Txt
            fontSize={80}
            x={x}
            y={y + 12}
            fill="white"
            text={(num + 1).toString()}
          />
        </Layout>
      );
    })
  );

  // Fade in all numbers
  yield* waitFor(0.5);
  yield* sequence(
    0.02,
    ...shuffleArray(random, boxRefs).map((ref) =>
      all(ref.scale(1, FADE_IN_DURATION), ref.opacity(1, FADE_IN_DURATION))
    )
  );

  // Pause
  yield* waitFor(PAUSE_DURATION);

  // Fade out non-prime numbers
  const fadeOutAnimations = [];
  for (let i = 0; i < boxRefs.length; i++) {
    const num = i + 1;
    if (!isPrime(num)) {
      const box = boxRefs[i];
      fadeOutAnimations.push(
        all(
          box.scale(0.5, FADE_OUT_NON_PRIMES_DURATION),
          box.opacity(0, FADE_OUT_NON_PRIMES_DURATION)
        )
      );
    }
  }
  yield* sequence(0.02, ...shuffleArray(random, fadeOutAnimations));

  // Pause before final fade out
  yield* waitFor(PAUSE_DURATION);

  // Fade out remaining prime numbers
  yield* sequence(
    0.02,
    ...shuffleArray(random, boxRefs).map((ref) =>
      all(
        ref.opacity(0, FINAL_FADE_OUT_DURATION),
        ref.scale(1.5, FINAL_FADE_OUT_DURATION * 1.2)
      )
    )
  );

  yield* waitFor(1);
});
