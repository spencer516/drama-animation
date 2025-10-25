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

export function sequenceRows(includeLast: boolean = true): RowPosition[] {
  return includeLast ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4];
}

export function sequenceColumns(includeLast: boolean = true): ColumnPosition[] {
  return includeLast
    ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
}

export function positionToCoordinates([column, row]: Position): Coordinates {
  const x = column * scale + translateX;
  const y = row * scale + translateY;

  return [x, y];
}

export function positionsToDistance(positions: Position[]): number {
  return coordinatesToDistance(positions.map(positionToCoordinates));
}

export function coordinatesToDistance(coordinates: Coordinates[]) {
  if (coordinates.length < 2) {
    return 0;
  }

  const [firstCoordinates, ...rest] = coordinates;

  let [lastX, lastY] = firstCoordinates;
  let totalDistance = 0;

  for (const [nextX, nextY] of rest) {
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
  offsetWidth: number = 1,
  offsetHeight: number = 1
): { x: number; y: number; width: number; height: number } {
  const [sx, sy] = positionToCoordinates(startPosition);
  const [ex, ey] = positionToCoordinates([
    startPosition[0] + offsetWidth,
    startPosition[1] + offsetHeight,
  ] as Position);

  const width = ex - sx;
  const height = ey - sy;
  const x = sx + width / 2;
  const y = sy + height / 2;

  return { x, y, width, height };
}
