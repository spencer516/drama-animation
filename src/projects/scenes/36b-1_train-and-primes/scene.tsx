import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import { all, waitFor } from "@motion-canvas/core";
import { LED_OFF, LED_RED } from "@/lib/design-system";
import { setupTrainStructure } from "@/lib/scenes/train";
import {
  ColumnPosition,
  Position,
  RowPosition,
} from "@/lib/wall-coordinate-system";

const LIGHT_FADE_DURATION = 0.2;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  setupTrainStructure(screen);

  const base4Primes = base4PrimesUpTo(281);
  const lightPositions = getBase4LightPositions();

  for (const primes of base4Primes) {
    const positions = positionsForPrimes(lightPositions, primes);

    yield* all(
      ...positions.map((position) =>
        ledSystem().fillAt(position, LED_RED, LIGHT_FADE_DURATION)
      )
    );

    yield* all(
      ...positions.map((position) =>
        ledSystem().fillAt(position, LED_OFF, LIGHT_FADE_DURATION)
      )
    );

    yield* waitFor(LIGHT_FADE_DURATION / 6);
  }

  yield* waitFor(0.2);
});

function positionsForPrimes(
  lightPositions: Position[][],
  primes: number[]
): Position[] {
  const positions: Position[] = [];

  for (let offset = 0; offset < primes.length; offset++) {
    const curPrime = primes[offset];
    const curPositions = lightPositions[offset].slice(0, curPrime + 1);
    positions.push(...curPositions);
  }

  return positions;
}

function getBase4LightPositions(): Position[][] {
  const row: RowPosition = 3;
  const startColumn: ColumnPosition = 14;

  return [
    sequenceFromTopRight([startColumn, row] as Position),
    sequenceFromTopRight([startColumn - 2, row] as Position),
    sequenceFromTopRight([startColumn - 4, row] as Position),
    sequenceFromTopRight([startColumn - 4, row] as Position),
    sequenceFromTopRight([startColumn - 6, row] as Position),
    sequenceFromTopRight([startColumn - 8, row] as Position),
    sequenceFromTopRight([startColumn - 10, row] as Position),
  ];
}

function sequenceFromTopRight([x, y]: Position): Position[] {
  return [
    [x, y] as Position,
    [x, y + 1] as Position,
    [x - 1, y + 1] as Position,
    [x - 1, y] as Position,
  ];
}

function base4PrimesUpTo(max: number): number[][] {
  const primes = [];

  for (const prime of generatePrimes(max)) {
    primes.push(toBase4Array(prime));
  }

  return primes;
}

function toBase4Array(num: number): number[] {
  // Handle the special case of 0
  if (num === 0) {
    return [0];
  }

  const result: number[] = [];
  let current = num;

  // Convert to base 4 by repeatedly dividing by 4
  while (current > 0) {
    result.push(current % 4);
    current = Math.floor(current / 4);
  }

  return result;
}

function* generatePrimes(max: number): Generator<number> {
  if (max < 2) {
    return;
  }

  // 2 is the only even prime
  yield 2;

  // Check odd numbers starting from 3
  for (let num = 3; num <= max; num += 2) {
    let isPrime = true;

    // Only need to check divisors up to sqrt(num)
    const limit = Math.sqrt(num);
    for (let divisor = 3; divisor <= limit; divisor += 2) {
      if (num % divisor === 0) {
        isPrime = false;
        break;
      }
    }

    if (isPrime) {
      yield num;
    }
  }
}
