export type Coordinates = { x: number; y: number };

type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

export type ColumnPosition = Enumerate<16>;
export type RowPosition = Enumerate<6>;

export type Position = [ColumnPosition, RowPosition];

const translateX = -900;
const translateY = -300;
const scale = 120;

export function positionToCoordinates([column, row]: Position): Coordinates {
  const x = column * scale + translateX;
  const y = row * scale + translateY;

  return { x, y };
}
