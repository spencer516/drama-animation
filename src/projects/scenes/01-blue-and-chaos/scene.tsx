import { Line, makeScene2D, Rect } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  Color,
  createRef,
  waitFor,
  useRandom,
  spawn,
  all,
  easeInQuad,
  easeOutQuad,
  easeOutCubic,
  easeInOutQuad,
} from "@motion-canvas/core";
import {
  positionToCoordinates,
  coordinatesToDistance,
  Position,
  ColumnPosition,
  RowPosition,
} from "@/lib/wall-coordinate-system";
import {
  GRID_BLUE,
  GRID_LINE_WIDTH,
  LED_BLUE,
  LED_OFF,
} from "@/lib/design-system";

// White color palette for chaos - varying brightness
const WHITE_BRIGHT = new Color("#ffffff");
const WHITE_HIGH = new Color("#e6e6e6");
const WHITE_MID = new Color("#cccccc");
const WHITE_LOW = new Color("#999999");
const WHITE_DIM = new Color("#666666");

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom();

  const { fill, horizontalLines, verticalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  // Initial state: Everything blue with grid
  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  // Hold the peaceful blue state briefly
  yield* waitFor(0.5);

  // BEGIN CHAOS - The police officer grabs his shoulder
  // Everything descends into white-themed chaos

  // CHAOS START: Grid lines disappear chaotically
  spawn(function* () {
    // Get all line elements from both arrays
    const allLines = [...horizontalLines, ...verticalLines];
    const shuffledIndices = [...Array(allLines.length).keys()].sort(
      () => randomGenerator.nextFloat(-1, 1)
    );

    for (let i = 0; i < shuffledIndices.length; i++) {
      spawn(function* () {
        const line = allLines[shuffledIndices[i]];
        yield* line.opacity(0, randomGenerator.nextFloat(0.03, 0.1));
      });
      yield* waitFor(randomGenerator.nextFloat(0.005, 0.02));
    }
  });

  // Sub-animation 1: LED Flicker Partitions (0.5-10.5s) - FASTER & MORE
  // Partition LEDs into 4 zones to avoid conflicts
  spawn(function* () {
    const zones = [
      { cols: [0, 3], name: "left-top" },
      { cols: [4, 7], name: "left-mid" },
      { cols: [8, 11], name: "right-mid" },
      { cols: [12, 15], name: "right-bottom" },
    ];

    for (let flicker = 0; flicker < 150; flicker++) {
      const zone = zones[randomGenerator.nextInt(0, 4)];
      spawn(function* () {
        const positions: Position[] = [];
        const numLights = randomGenerator.nextInt(4, 10);

        for (let i = 0; i < numLights; i++) {
          positions.push([
            randomGenerator.nextInt(
              zone.cols[0],
              zone.cols[1] + 1
            ) as ColumnPosition,
            randomGenerator.nextInt(0, 6) as RowPosition,
          ]);
        }

        const color =
          flicker % 5 === 0
            ? WHITE_BRIGHT
            : flicker % 5 === 1
            ? WHITE_HIGH
            : flicker % 5 === 2
            ? WHITE_MID
            : flicker % 5 === 3
            ? WHITE_LOW
            : WHITE_DIM;

        yield* all(
          ...positions.map((pos) =>
            ledSystem().lightRefAt(pos)().fill(color, 0.015)
          )
        );

        yield* waitFor(randomGenerator.nextFloat(0.015, 0.04));

        yield* all(
          ...positions.map((pos) =>
            ledSystem().lightRefAt(pos)().fill(LED_OFF, 0.01)
          )
        );
      });
      yield* waitFor(randomGenerator.nextFloat(0.04, 0.08));
    }
  });

  // Sub-animation 2: Vertical Lightning Strikes (0.5-10.5s) - FASTER & MORE
  spawn(function* () {
    for (let strike = 0; strike < 60; strike++) {
      const col = randomGenerator.nextInt(0, 16) as ColumnPosition;
      spawn(function* () {
        const lineRef = createRef<Line>();
        const fromTop = randomGenerator.nextFloat(0, 1) > 0.5;
        const startRow = fromTop ? 0 : 5;
        const endRow = fromTop ? 5 : 0;
        const startCoords = positionToCoordinates([
          col,
          startRow as RowPosition,
        ]);
        const endCoords = positionToCoordinates([col, endRow as RowPosition]);
        const linePoints = [startCoords, endCoords];
        const lineLength = coordinatesToDistance(linePoints);

        screen().add(
          <Line
            ref={lineRef}
            points={linePoints}
            stroke={WHITE_BRIGHT}
            lineWidth={GRID_LINE_WIDTH}
            startOffset={lineLength}
            endOffset={lineLength}
            lineCap="round"
          />
        );

        yield* all(
          lineRef().startOffset(0, 0.08, easeOutCubic),
          lineRef().endOffset(0, 0.08, easeOutCubic)
        );

        yield* waitFor(0.015);
        yield* lineRef().opacity(0, 0.05);
        lineRef().remove();
      });
      yield* waitFor(randomGenerator.nextFloat(0.1, 0.25));
    }
  });

  // Sub-animation 3: Horizontal Racing Lines (0.7-10.5s) - FASTER & MORE
  spawn(function* () {
    yield* waitFor(0.2);
    for (let race = 0; race < 50; race++) {
      const row = randomGenerator.nextInt(0, 6) as RowPosition;
      const leftToRight = randomGenerator.nextFloat(0, 1) > 0.5;

      spawn(function* () {
        const lineRef = createRef<Line>();
        const startPos: Position = leftToRight ? [0, row] : [15, row];
        const endPos: Position = leftToRight ? [15, row] : [0, row];
        const startCoords = positionToCoordinates(startPos);
        const endCoords = positionToCoordinates(endPos);
        const linePoints = [startCoords, endCoords];
        const lineLength = coordinatesToDistance(linePoints);

        screen().add(
          <Line
            ref={lineRef}
            points={linePoints}
            stroke={WHITE_HIGH}
            lineWidth={GRID_LINE_WIDTH}
            startOffset={lineLength}
            endOffset={lineLength}
            lineCap="round"
          />
        );

        yield* all(
          lineRef().startOffset(0, 0.1, easeInQuad),
          lineRef().endOffset(0, 0.1, easeInQuad)
        );

        lineRef().remove();
      });
      yield* waitFor(randomGenerator.nextFloat(0.12, 0.3));
    }
  });

  // Sub-animation 4: Vertical Racing Lines (0.9-10.5s) - NEW: More vertical movement
  spawn(function* () {
    yield* waitFor(0.4);
    for (let race = 0; race < 50; race++) {
      const col = randomGenerator.nextInt(0, 16) as ColumnPosition;
      const topToBottom = randomGenerator.nextFloat(0, 1) > 0.5;

      spawn(function* () {
        const lineRef = createRef<Line>();
        const startPos: Position = topToBottom ? [col, 0] : [col, 5];
        const endPos: Position = topToBottom ? [col, 5] : [col, 0];
        const startCoords = positionToCoordinates(startPos);
        const endCoords = positionToCoordinates(endPos);
        const linePoints = [startCoords, endCoords];
        const lineLength = coordinatesToDistance(linePoints);

        screen().add(
          <Line
            ref={lineRef}
            points={linePoints}
            stroke={WHITE_MID}
            lineWidth={GRID_LINE_WIDTH}
            startOffset={lineLength}
            endOffset={lineLength}
            lineCap="round"
          />
        );

        yield* all(
          lineRef().startOffset(0, 0.1, easeInQuad),
          lineRef().endOffset(0, 0.1, easeInQuad)
        );

        lineRef().remove();
      });
      yield* waitFor(randomGenerator.nextFloat(0.12, 0.3));
    }
  });

  // Sub-animation 5: Random White Rectangles (1-10.5s) - FASTER & MORE
  spawn(function* () {
    yield* waitFor(0.5);
    const rectConfigs = [
      { col: 0, row: 0, width: 2, height: 1 },
      { col: 3, row: 1, width: 3, height: 2 },
      { col: 6, row: 0, width: 2, height: 2 },
      { col: 9, row: 2, width: 2, height: 1 },
      { col: 11, row: 3, width: 3, height: 2 },
      { col: 1, row: 4, width: 2, height: 1 },
      { col: 5, row: 3, width: 2, height: 2 },
      { col: 13, row: 1, width: 2, height: 2 },
      { col: 8, row: 4, width: 3, height: 1 },
      { col: 2, row: 2, width: 2, height: 1 },
      { col: 0, row: 2, width: 1, height: 1 },
      { col: 7, row: 0, width: 1, height: 2 },
      { col: 14, row: 4, width: 2, height: 1 },
    ];

    for (let pulse = 0; pulse < 80; pulse++) {
      const config =
        rectConfigs[randomGenerator.nextInt(0, rectConfigs.length)];
      spawn(function* () {
        const rectRef = createRef<Rect>();
        const topLeft = positionToCoordinates([
          config.col as ColumnPosition,
          config.row as RowPosition,
        ]);
        const bottomRight = positionToCoordinates([
          (config.col + config.width) as ColumnPosition,
          (config.row + config.height) as RowPosition,
        ]);

        const [x1, y1] = topLeft;
        const [x2, y2] = bottomRight;

        const fillColor =
          pulse % 4 === 0
            ? WHITE_BRIGHT
            : pulse % 4 === 1
            ? WHITE_HIGH
            : pulse % 4 === 2
            ? WHITE_MID
            : WHITE_LOW;

        screen().add(
          <Rect
            ref={rectRef}
            x={(x1 + x2) / 2}
            y={(y1 + y2) / 2}
            width={Math.abs(x2 - x1)}
            height={Math.abs(y2 - y1)}
            stroke={fillColor}
            fill={fillColor}
            lineWidth={GRID_LINE_WIDTH}
            opacity={0}
          />
        );

        yield* rectRef().opacity(randomGenerator.nextFloat(0.6, 1), 0.04);
        yield* waitFor(randomGenerator.nextFloat(0.05, 0.12));
        yield* rectRef().opacity(0, 0.04);
        rectRef().remove();
      });
      yield* waitFor(randomGenerator.nextFloat(0.08, 0.2));
    }
  });

  // Sub-animation 6: LED Explosion Bursts (1-10.5s) - FASTER & MORE
  spawn(function* () {
    yield* waitFor(0.5);
    for (let burst = 0; burst < 70; burst++) {
      spawn(function* () {
        const centerCol = randomGenerator.nextInt(2, 14) as ColumnPosition;
        const centerRow = randomGenerator.nextInt(1, 5) as RowPosition;

        const positions: Position[] = [
          [centerCol, centerRow],
          [(centerCol - 1) as ColumnPosition, centerRow],
          [(centerCol + 1) as ColumnPosition, centerRow],
          [centerCol, (centerRow - 1) as RowPosition],
          [centerCol, (centerRow + 1) as RowPosition],
        ];

        const color =
          burst % 3 === 0
            ? WHITE_BRIGHT
            : burst % 3 === 1
            ? WHITE_HIGH
            : WHITE_MID;

        yield* ledSystem()
          .lightRefAt([centerCol, centerRow])()
          .fill(color, 0.01);
        yield* waitFor(0.01);

        yield* all(
          ...positions.slice(1).map((pos) => {
            if (pos[0] >= 0 && pos[0] <= 15 && pos[1] >= 0 && pos[1] <= 5) {
              return ledSystem().lightRefAt(pos)().fill(color, 0.015);
            }
            return waitFor(0);
          })
        );

        yield* waitFor(0.03);

        yield* all(
          ...positions.map((pos) => {
            if (pos[0] >= 0 && pos[0] <= 15 && pos[1] >= 0 && pos[1] <= 5) {
              return ledSystem().lightRefAt(pos)().fill(LED_OFF, 0.01);
            }
            return waitFor(0);
          })
        );
      });
      yield* waitFor(randomGenerator.nextFloat(0.08, 0.2));
    }
  });

  // Sub-animation 7: Cascading Waves (1.5-10.5s) - FASTER & MORE
  spawn(function* () {
    yield* waitFor(1);
    for (let wave = 0; wave < 20; wave++) {
      const upward = randomGenerator.nextFloat(0, 1) > 0.5;
      const rows = upward ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];

      for (const row of rows) {
        spawn(function* () {
          yield* ledSystem().fillRow(row as RowPosition, WHITE_MID, 0.02);
          yield* waitFor(0.03);
          yield* ledSystem().fillRow(row as RowPosition, LED_OFF, 0.02);
        });
        yield* waitFor(0.04);
      }
      yield* waitFor(randomGenerator.nextFloat(0.2, 0.5));
    }
  });

  // Sub-animation 8: Column Thrashing (1.5-10.5s) - FASTER & MORE
  spawn(function* () {
    yield* waitFor(1);
    for (let thrash = 0; thrash < 70; thrash++) {
      const col = randomGenerator.nextInt(0, 16) as ColumnPosition;
      const color =
        thrash % 3 === 0
          ? WHITE_BRIGHT
          : thrash % 3 === 1
          ? WHITE_HIGH
          : WHITE_LOW;

      spawn(function* () {
        yield* ledSystem().fillColumn(col, color, 0.02);
        yield* waitFor(randomGenerator.nextFloat(0.03, 0.08));
        yield* ledSystem().fillColumn(col, LED_OFF, 0.02);
      });

      yield* waitFor(randomGenerator.nextFloat(0.08, 0.2));
    }
  });

  // Sub-animation 9: Horizontal Line Sweeps (2-10.5s) - NEW: Lines sweeping across
  spawn(function* () {
    yield* waitFor(1.5);
    for (let sweep = 0; sweep < 40; sweep++) {
      const row = randomGenerator.nextInt(0, 6) as RowPosition;
      spawn(function* () {
        const lineRef = createRef<Line>();
        const startCoords = positionToCoordinates([0, row]);
        const endCoords = positionToCoordinates([15, row]);
        const linePoints = [startCoords, endCoords];

        screen().add(
          <Line
            ref={lineRef}
            points={linePoints}
            stroke={WHITE_BRIGHT}
            lineWidth={GRID_LINE_WIDTH}
            lineCap="round"
            opacity={randomGenerator.nextFloat(0.6, 1)}
          />
        );

        yield* waitFor(randomGenerator.nextFloat(0.05, 0.15));
        yield* lineRef().opacity(0, 0.08);
        lineRef().remove();
      });
      yield* waitFor(randomGenerator.nextFloat(0.15, 0.35));
    }
  });

  // Sub-animation 10: Vertical Line Sweeps (2-10.5s) - NEW: Lines sweeping vertically
  spawn(function* () {
    yield* waitFor(1.5);
    for (let sweep = 0; sweep < 40; sweep++) {
      const col = randomGenerator.nextInt(0, 16) as ColumnPosition;
      spawn(function* () {
        const lineRef = createRef<Line>();
        const startCoords = positionToCoordinates([col, 0]);
        const endCoords = positionToCoordinates([col, 5]);
        const linePoints = [startCoords, endCoords];

        screen().add(
          <Line
            ref={lineRef}
            points={linePoints}
            stroke={WHITE_HIGH}
            lineWidth={GRID_LINE_WIDTH}
            lineCap="round"
            opacity={randomGenerator.nextFloat(0.6, 1)}
          />
        );

        yield* waitFor(randomGenerator.nextFloat(0.05, 0.15));
        yield* lineRef().opacity(0, 0.08);
        lineRef().remove();
      });
      yield* waitFor(randomGenerator.nextFloat(0.15, 0.35));
    }
  });

  // Sub-animation 11: Pulsing Screen Sections (2.5-10.5s) - FASTER & MORE
  spawn(function* () {
    yield* waitFor(2);
    for (let pulse = 0; pulse < 25; pulse++) {
      const section = randomGenerator.nextInt(0, 4);
      let colStart = 0,
        colEnd = 15,
        rowStart = 0,
        rowEnd = 5;

      switch (section) {
        case 0: // Top half
          rowEnd = 2;
          break;
        case 1: // Bottom half
          rowStart = 3;
          break;
        case 2: // Left half
          colEnd = 7;
          break;
        case 3: // Right half
          colStart = 8;
          break;
      }

      const positions: Position[] = [];
      for (let col = colStart; col <= colEnd; col++) {
        for (let row = rowStart; row <= rowEnd; row++) {
          if (randomGenerator.nextFloat(0, 1) > 0.3) {
            positions.push([col as ColumnPosition, row as RowPosition]);
          }
        }
      }

      yield* all(
        ...positions.map((pos) =>
          ledSystem().lightRefAt(pos)().fill(WHITE_HIGH, 0.04)
        )
      );

      yield* waitFor(0.06);

      yield* all(
        ...positions.map((pos) =>
          ledSystem().lightRefAt(pos)().fill(LED_OFF, 0.04)
        )
      );

      yield* waitFor(randomGenerator.nextFloat(0.15, 0.4));
    }
  });

  // Sub-animation 12: Multi-Rectangle Flash Storm (3-10.5s) - NEW: Multiple rects at once
  spawn(function* () {
    yield* waitFor(2.5);
    for (let storm = 0; storm < 30; storm++) {
      const numRects = randomGenerator.nextInt(3, 8);
      spawn(function* () {
        const rects: Rect[] = [];

        for (let i = 0; i < numRects; i++) {
          const rectRef = createRef<Rect>();
          const col = randomGenerator.nextInt(0, 15) as ColumnPosition;
          const row = randomGenerator.nextInt(0, 5) as RowPosition;
          const width = randomGenerator.nextInt(1, 3);
          const height = randomGenerator.nextInt(1, 2);

          const topLeft = positionToCoordinates([col, row]);
          const bottomRight = positionToCoordinates([
            Math.min(15, col + width) as ColumnPosition,
            Math.min(5, row + height) as RowPosition,
          ]);

          const [x1, y1] = topLeft;
          const [x2, y2] = bottomRight;

          screen().add(
            <Rect
              ref={rectRef}
              x={(x1 + x2) / 2}
              y={(y1 + y2) / 2}
              width={Math.abs(x2 - x1)}
              height={Math.abs(y2 - y1)}
              stroke={WHITE_BRIGHT}
              fill={WHITE_BRIGHT}
              lineWidth={GRID_LINE_WIDTH}
              opacity={0}
            />
          );

          rects.push(rectRef());
        }

        yield* all(...rects.map((rect) => rect.opacity(0.8, 0.03)));
        yield* waitFor(0.05);
        yield* all(...rects.map((rect) => rect.opacity(0, 0.03)));
        rects.forEach((rect) => rect.remove());
      });
      yield* waitFor(randomGenerator.nextFloat(0.15, 0.35));
    }
  });

  // Sub-animation 13: Final Crescendo (7-10.5s) - MAXIMUM CHAOS
  spawn(function* () {
    yield* waitFor(6.5);

    // Everything at once - maximum chaos
    for (let chaos = 0; chaos < 60; chaos++) {
      // Rapid horizontal lines
      spawn(function* () {
        const lineRef = createRef<Line>();
        const row = randomGenerator.nextInt(0, 6) as RowPosition;
        const startCoords = positionToCoordinates([0, row]);
        const endCoords = positionToCoordinates([15, row]);
        const linePoints = [startCoords, endCoords];
        const lineLength = coordinatesToDistance(linePoints);

        screen().add(
          <Line
            ref={lineRef}
            points={linePoints}
            stroke={WHITE_BRIGHT}
            lineWidth={GRID_LINE_WIDTH}
            endOffset={lineLength}
            lineCap="round"
          />
        );

        yield* lineRef().endOffset(0, 0.05, easeOutQuad);
        yield* waitFor(0.01);
        yield* lineRef().opacity(0, 0.04);
        lineRef().remove();
      });

      // Rapid vertical lines
      spawn(function* () {
        const lineRef = createRef<Line>();
        const col = randomGenerator.nextInt(0, 16) as ColumnPosition;
        const startCoords = positionToCoordinates([col, 0]);
        const endCoords = positionToCoordinates([col, 5]);
        const linePoints = [startCoords, endCoords];
        const lineLength = coordinatesToDistance(linePoints);

        screen().add(
          <Line
            ref={lineRef}
            points={linePoints}
            stroke={WHITE_HIGH}
            lineWidth={GRID_LINE_WIDTH}
            endOffset={lineLength}
            lineCap="round"
          />
        );

        yield* lineRef().endOffset(0, 0.05, easeOutQuad);
        yield* waitFor(0.01);
        yield* lineRef().opacity(0, 0.04);
        lineRef().remove();
      });

      // Rapid LED flashes
      spawn(function* () {
        const pos: Position = [
          randomGenerator.nextInt(0, 16) as ColumnPosition,
          randomGenerator.nextInt(0, 6) as RowPosition,
        ];
        yield* ledSystem().lightRefAt(pos)().fill(WHITE_BRIGHT, 0.01);
        yield* waitFor(0.015);
        yield* ledSystem().lightRefAt(pos)().fill(LED_OFF, 0.01);
      });

      yield* waitFor(randomGenerator.nextFloat(0.03, 0.08));
    }
  });

  // Wait for chaos to play out
  yield* waitFor(10);

  // RESTORATION: Chaos subsides and returns to calm blue (10.5-12s)

  // Grid lines reappear gradually
  spawn(function* () {
    const allLines = [...horizontalLines, ...verticalLines];
    const shuffledIndices = [...Array(allLines.length).keys()].sort(
      () => randomGenerator.nextFloat(-1, 1)
    );

    for (let i = 0; i < shuffledIndices.length; i++) {
      spawn(function* () {
        const line = allLines[shuffledIndices[i]];
        yield* line.opacity(1, randomGenerator.nextFloat(0.3, 0.8), easeInOutQuad);
      });
      yield* waitFor(randomGenerator.nextFloat(0.01, 0.03));
    }
  });

  // Fill all LEDs with blue gradually
  yield* all(
    ...Array.from({ length: 16 }, (_, col) =>
      ledSystem().fillColumn(col as ColumnPosition, LED_BLUE, 1.5)
    )
  );

  // Restore the grid colors
  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  // Hold the restored state
  yield* waitFor(0.5);
});
