import { Random } from "@motion-canvas/core";

export default function shuffleArray<T>(random: Random, list: T[]): T[] {
  const result = [...list];

  for (let i = result.length - 1; i > 0; i--) {
    const j = random.nextInt(0, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
