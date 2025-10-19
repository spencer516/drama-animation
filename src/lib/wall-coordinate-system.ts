export type Coordinates = [number, number];

type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

export type ColumnPosition = Enumerate<16>;
export type RowPosition = Enumerate<6>;

export type Position = [ColumnPosition, RowPosition];
export type RelativePosition = [number, number];

const translateX = -900;
const translateY = -300;
const scale = 120;

export function positionToCoordinates([column, row]: Position): Coordinates {
  const x = column * scale + translateX;
  const y = row * scale + translateY;

  return [x, y];
}

export function positionsToDistance(positions: Position[]): number {
  if (positions.length < 2) {
    return 0;
  }

  const [firstPosition, ...rest] = positions;

  let [lastX, lastY] = positionToCoordinates(firstPosition);
  let totalDistance = 0;

  for (const nextPosition of rest) {
    const [nextX, nextY] = positionToCoordinates(nextPosition);
    const width = nextX - lastX;
    const height = nextY - lastY;
    totalDistance += Math.sqrt(width ** 2 + height ** 2);

    [lastX, lastY] = [nextX, nextY];
  }

  return totalDistance;
}

export function positionsToCoordinates(positions: Position[]): Coordinates[] {
  return positions.map(positionToCoordinates);
}

export function positionToRect(
  startPosition: Position,
  endPosition: Position
): { x: number; y: number; width: number; height: number } {
  const [sx, sy] = positionToCoordinates(startPosition);
  const [ex, ey] = positionToCoordinates(endPosition);

  const width = ex - sx;
  const height = ey - sy;
  const x = sx + width / 2;
  const y = sy + height / 2;

  return { x, y, width, height };
}
