import { Line, Rect, makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  Color,
  spawn,
  waitFor,
  useRandom,
  all,
  createRef,
  easeInQuad,
  easeOutQuad,
  easeInCubic,
  easeOutCubic,
} from "@motion-canvas/core";
import {
  Position,
  ColumnPosition,
  RowPosition,
  positionToCoordinates,
  coordinatesToDistance,
} from "@/lib/wall-coordinate-system";
import { LED_OFF, GRID_LINE_WIDTH } from "@/lib/design-system";

// Red color palette for chaos
const RED_BRIGHT = new Color("#ff0000");
const RED_ORANGE = new Color("#ff3300");
const RED_CRIMSON = new Color("#dc143c");
const RED_DARK = new Color("#8b0000");
const RED_PINK = new Color("#ff1744");
const RED_BLOOD = new Color("#660000");

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom();

  // INITIAL SHOCK: Everything blazes red instantly
  yield* all(
    ...Array.from({ length: 16 }, (_, col) =>
      ledSystem().fillColumn(col as ColumnPosition, RED_BRIGHT, 0.05)
    )
  );

  // Draw all grid lines
  const gridLines: Line[] = [];

  // Vertical lines
  for (let col = 0; col <= 15; col++) {
    const lineRef = createRef<Line>();
    const startCoords = positionToCoordinates([col as ColumnPosition, 0]);
    const endCoords = positionToCoordinates([col as ColumnPosition, 5]);

    screen().add(
      <Line
        ref={lineRef}
        points={[startCoords, endCoords]}
        stroke={RED_BRIGHT}
        lineWidth={GRID_LINE_WIDTH}
        lineCap="round"
      />
    );
    gridLines.push(lineRef());
  }

  // Horizontal lines
  for (let row = 0; row <= 5; row++) {
    const lineRef = createRef<Line>();
    const startCoords = positionToCoordinates([0, row as RowPosition]);
    const endCoords = positionToCoordinates([15, row as RowPosition]);

    screen().add(
      <Line
        ref={lineRef}
        points={[startCoords, endCoords]}
        stroke={RED_BRIGHT}
        lineWidth={GRID_LINE_WIDTH}
        lineCap="round"
      />
    );
    gridLines.push(lineRef());
  }

  // Hold the shock
  yield* waitFor(0.5);

  // Fade out the grid lines as chaos begins
  spawn(function* () {
    yield* all(...gridLines.map((line) => line.opacity(0, 1.5)));
    gridLines.forEach((line) => line.remove());
  });

  // Begin the devolution into chaos
  yield* waitFor(0.3);

  // Sub-animation 1: RAPID Vertical Lightning Strikes (0-8s) - Overlaps with multiple others
  spawn(function* () {
    for (let wave = 0; wave < 25; wave++) {
      const col = randomGenerator.nextInt(0, 16) as ColumnPosition;
      spawn(function* () {
        const lineRef = createRef<Line>();
        const startCoords = positionToCoordinates([col, 5]);
        const endCoords = positionToCoordinates([col, 0]);
        const linePoints = [startCoords, endCoords];
        const lineLength = coordinatesToDistance(linePoints);

        screen().add(
          <Line
            ref={lineRef}
            points={linePoints}
            stroke={RED_CRIMSON}
            lineWidth={GRID_LINE_WIDTH}
            startOffset={lineLength}
            endOffset={lineLength}
            lineCap="round"
          />
        );

        // FAST shoot upward
        yield* all(
          lineRef().startOffset(0, 0.15, easeOutCubic),
          lineRef().endOffset(0, 0.15, easeOutCubic)
        );

        // Quick flash of column lights (bottom to top)
        for (let row = 5; row >= 0; row--) {
          const light = ledSystem().lightRefAt([col, row as RowPosition]);
          spawn(light().fill(RED_ORANGE, 0.03));
          yield* waitFor(0.02);
        }

        yield* lineRef().opacity(0, 0.1);
        lineRef().remove();
        yield* ledSystem().fillColumn(col, LED_OFF, 0.08);
      });
      yield* waitFor(randomGenerator.nextFloat(0.15, 0.35));
    }
  });

  // Sub-animation 2: Chaotic LED Explosions (1-12s) - Random bursts throughout
  spawn(function* () {
    yield* waitFor(1);
    for (let burst = 0; burst < 40; burst++) {
      const positions: Position[] = [];
      const numLights = randomGenerator.nextInt(8, 20);

      for (let i = 0; i < numLights; i++) {
        positions.push([
          randomGenerator.nextInt(0, 16) as ColumnPosition,
          randomGenerator.nextInt(0, 6) as RowPosition,
        ]);
      }

      yield* all(
        ...positions.map((pos) =>
          ledSystem()
            .lightRefAt(pos)()
            .fill(
              burst % 3 === 0
                ? RED_BRIGHT
                : burst % 3 === 1
                ? RED_ORANGE
                : RED_CRIMSON,
              0.05
            )
        )
      );

      yield* waitFor(randomGenerator.nextFloat(0.05, 0.12));

      yield* all(
        ...positions.map((pos) =>
          ledSystem().lightRefAt(pos)().fill(LED_OFF, 0.04)
        )
      );

      yield* waitFor(randomGenerator.nextFloat(0.08, 0.2));
    }
  });

  // Sub-animation 3: Rapid Horizontal/Vertical Slashes (2-15s) - Lines cutting across
  spawn(function* () {
    yield* waitFor(2);

    for (let i = 0; i < 35; i++) {
      // Randomly choose horizontal or vertical
      const isVertical = randomGenerator.nextFloat(0, 1) > 0.5;

      spawn(function* () {
        const lineRef = createRef<Line>();
        let startCoords, endCoords;

        if (isVertical) {
          // Vertical line
          const col = randomGenerator.nextInt(0, 16) as ColumnPosition;
          startCoords = positionToCoordinates([col, 0]);
          endCoords = positionToCoordinates([col, 5]);
        } else {
          // Horizontal line
          const row = randomGenerator.nextInt(0, 6) as RowPosition;
          startCoords = positionToCoordinates([0, row]);
          endCoords = positionToCoordinates([15, row]);
        }

        const linePoints = [startCoords, endCoords];
        const lineLength = coordinatesToDistance(linePoints);

        screen().add(
          <Line
            ref={lineRef}
            points={linePoints}
            stroke={RED_PINK}
            lineWidth={GRID_LINE_WIDTH}
            endOffset={lineLength}
            lineCap="round"
            opacity={randomGenerator.nextFloat(0.6, 1)}
          />
        );

        yield* lineRef().endOffset(
          0,
          randomGenerator.nextFloat(0.12, 0.25),
          easeOutQuad
        );
        yield* waitFor(0.05);
        yield* lineRef().opacity(0, 0.15);
        lineRef().remove();
      });
      yield* waitFor(randomGenerator.nextFloat(0.2, 0.5));
    }
  });

  // Sub-animation 4: Flickering Rectangle Storm (3-20s) - Rectangles everywhere
  spawn(function* () {
    yield* waitFor(3);
    const rectConfigs = [
      { cols: [0, 3], rows: [0, 2] },
      { cols: [1, 4], rows: [1, 3] },
      { cols: [5, 8], rows: [0, 2] },
      { cols: [6, 9], rows: [2, 4] },
      { cols: [10, 13], rows: [1, 3] },
      { cols: [11, 14], rows: [3, 5] },
      { cols: [2, 5], rows: [3, 5] },
      { cols: [12, 15], rows: [0, 2] },
      { cols: [7, 10], rows: [2, 5] },
    ];

    for (let cycle = 0; cycle < 60; cycle++) {
      const rect = rectConfigs[randomGenerator.nextInt(0, rectConfigs.length)];
      spawn(function* () {
        const rectRef = createRef<Rect>();
        const topLeft = positionToCoordinates([
          rect.cols[0] as ColumnPosition,
          rect.rows[0] as RowPosition,
        ]);
        const bottomRight = positionToCoordinates([
          rect.cols[1] as ColumnPosition,
          rect.rows[1] as RowPosition,
        ]);

        const [x1, y1] = topLeft;
        const [x2, y2] = bottomRight;

        const fillColor =
          cycle % 3 === 0 ? RED_BLOOD : cycle % 3 === 1 ? RED_PINK : RED_DARK;

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

        yield* rectRef().opacity(randomGenerator.nextFloat(0.5, 1), 0.08);
        yield* waitFor(randomGenerator.nextFloat(0.1, 0.25));
        yield* rectRef().opacity(0, 0.08);
        rectRef().remove();
      });
      yield* waitFor(randomGenerator.nextFloat(0.15, 0.35));
    }
  });

  // Sub-animation 5: Horizontal Racing Lines (4-18s) - Lines shooting across horizontally
  spawn(function* () {
    yield* waitFor(4);
    for (let i = 0; i < 30; i++) {
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
            stroke={RED_ORANGE}
            lineWidth={GRID_LINE_WIDTH}
            startOffset={lineLength}
            endOffset={lineLength}
            lineCap="round"
          />
        );

        yield* all(
          lineRef().startOffset(0, 0.18, easeInQuad),
          lineRef().endOffset(0, 0.18, easeInQuad)
        );

        lineRef().remove();
      });
      yield* waitFor(randomGenerator.nextFloat(0.25, 0.6));
    }
  });

  // Sub-animation 6: Pulsing Half-Screen (5-16s) - Left/Right halves pulse
  spawn(function* () {
    yield* waitFor(5);
    for (let pulse = 0; pulse < 12; pulse++) {
      const useLeftHalf = randomGenerator.nextFloat(0, 1) > 0.5;
      const colStart = useLeftHalf ? 0 : 8;
      const colEnd = useLeftHalf ? 7 : 15;

      const positions: Position[] = [];
      for (let col = colStart; col <= colEnd; col++) {
        for (let row = 0; row <= 5; row++) {
          if (randomGenerator.nextFloat(0, 1) > 0.5) {
            positions.push([col as ColumnPosition, row as RowPosition]);
          }
        }
      }

      yield* all(
        ...positions.map((pos) =>
          ledSystem().lightRefAt(pos)().fill(RED_BRIGHT, 0.08)
        )
      );

      yield* waitFor(0.12);

      yield* all(
        ...positions.map((pos) =>
          ledSystem().lightRefAt(pos)().fill(LED_OFF, 0.08)
        )
      );

      yield* waitFor(randomGenerator.nextFloat(0.5, 1.2));
    }
  });

  // Sub-animation 7: Cascading Wave Upward (6-14s) - Fast rows lighting bottom to top
  spawn(function* () {
    yield* waitFor(6);
    for (let wave = 0; wave < 8; wave++) {
      for (let row = 5; row >= 0; row--) {
        spawn(function* () {
          yield* ledSystem().fillRow(row as RowPosition, RED_CRIMSON, 0.04);
          yield* waitFor(0.06);
          yield* ledSystem().fillRow(row as RowPosition, LED_OFF, 0.04);
        });
        yield* waitFor(0.08);
      }
      yield* waitFor(randomGenerator.nextFloat(0.5, 1.5));
    }
  });

  // Sub-animation 8: Expanding Lines from Center (8-22s) - Horizontal/Vertical lines from center
  spawn(function* () {
    yield* waitFor(8);
    const centerCol = 7 as ColumnPosition;
    const centerRow = 2 as RowPosition;

    for (let expand = 0; expand < 20; expand++) {
      // Choose random direction: up, down, left, or right
      const direction = randomGenerator.nextInt(0, 4);

      spawn(function* () {
        const lineRef = createRef<Line>();
        let startCoords, endCoords;

        switch (direction) {
          case 0: // Up
            startCoords = positionToCoordinates([centerCol, centerRow]);
            endCoords = positionToCoordinates([centerCol, 0]);
            break;
          case 1: // Down
            startCoords = positionToCoordinates([centerCol, centerRow]);
            endCoords = positionToCoordinates([centerCol, 5]);
            break;
          case 2: // Left
            startCoords = positionToCoordinates([centerCol, centerRow]);
            endCoords = positionToCoordinates([0, centerRow]);
            break;
          case 3: // Right
            startCoords = positionToCoordinates([centerCol, centerRow]);
            endCoords = positionToCoordinates([15, centerRow]);
            break;
        }

        const linePoints = [startCoords, endCoords];
        const lineLength = coordinatesToDistance(linePoints);

        screen().add(
          <Line
            ref={lineRef}
            points={linePoints}
            stroke={RED_DARK}
            lineWidth={GRID_LINE_WIDTH}
            endOffset={lineLength}
            lineCap="round"
          />
        );

        yield* lineRef().endOffset(0, 0.2, easeOutCubic);
        yield* waitFor(0.05);
        yield* lineRef().startOffset(lineLength, 0.15, easeInCubic);
        lineRef().remove();
      });
      yield* waitFor(randomGenerator.nextFloat(0.3, 0.8));
    }
  });

  // Sub-animation 9: Column Thrashing (10-23s) - Random columns flash on/off rapidly
  spawn(function* () {
    yield* waitFor(10);
    for (let thrash = 0; thrash < 35; thrash++) {
      const col = randomGenerator.nextInt(0, 16) as ColumnPosition;

      spawn(function* () {
        yield* ledSystem().fillColumn(col, RED_PINK, 0.05);
        yield* waitFor(randomGenerator.nextFloat(0.08, 0.15));
        yield* ledSystem().fillColumn(col, LED_OFF, 0.05);
      });

      yield* waitFor(randomGenerator.nextFloat(0.2, 0.5));
    }
  });

  // Sub-animation 10: FINAL CRESCENDO (18-25s) - Everything at once, building to peak
  spawn(function* () {
    yield* waitFor(18);

    // Rapid fire everything
    for (let chaos = 0; chaos < 50; chaos++) {
      // Random horizontal/vertical lines
      spawn(function* () {
        const lineRef = createRef<Line>();
        const isVertical = randomGenerator.nextFloat(0, 1) > 0.5;
        let startCoords, endCoords;

        if (isVertical) {
          const col = randomGenerator.nextInt(0, 16) as ColumnPosition;
          const startRow = randomGenerator.nextInt(0, 6) as RowPosition;
          const endRow = randomGenerator.nextInt(0, 6) as RowPosition;
          startCoords = positionToCoordinates([col, startRow]);
          endCoords = positionToCoordinates([col, endRow]);
        } else {
          const row = randomGenerator.nextInt(0, 6) as RowPosition;
          const startCol = randomGenerator.nextInt(0, 16) as ColumnPosition;
          const endCol = randomGenerator.nextInt(0, 16) as ColumnPosition;
          startCoords = positionToCoordinates([startCol, row]);
          endCoords = positionToCoordinates([endCol, row]);
        }

        const linePoints = [startCoords, endCoords];
        const lineLength = coordinatesToDistance(linePoints);

        screen().add(
          <Line
            ref={lineRef}
            points={linePoints}
            stroke={chaos % 2 === 0 ? RED_BRIGHT : RED_PINK}
            lineWidth={GRID_LINE_WIDTH}
            endOffset={lineLength}
            lineCap="round"
          />
        );

        yield* lineRef().endOffset(0, 0.1, easeOutQuad);
        yield* waitFor(0.03);
        yield* lineRef().opacity(0, 0.08);
        lineRef().remove();
      });

      // Random LED bursts
      spawn(function* () {
        const pos: Position = [
          randomGenerator.nextInt(0, 16) as ColumnPosition,
          randomGenerator.nextInt(0, 6) as RowPosition,
        ];
        yield* ledSystem().lightRefAt(pos)().fill(RED_BRIGHT, 0.03);
        yield* waitFor(0.05);
        yield* ledSystem().lightRefAt(pos)().fill(LED_OFF, 0.03);
      });

      yield* waitFor(randomGenerator.nextFloat(0.08, 0.15));
    }

    // Final overwhelming wave upward
    for (let row = 5; row >= 0; row--) {
      yield* all(
        ledSystem().fillRow(row as RowPosition, RED_BRIGHT, 0.03),
        ...Array.from({ length: 5 }, () => {
          const lineRef = createRef<Line>();
          const col = randomGenerator.nextInt(0, 16) as ColumnPosition;
          const startCoords = positionToCoordinates([col, row as RowPosition]);
          const endCoords = positionToCoordinates([col, 0]);
          const linePoints = [startCoords, endCoords];
          const lineLength = coordinatesToDistance(linePoints);

          return (function* () {
            screen().add(
              <Line
                ref={lineRef}
                points={linePoints}
                stroke={RED_ORANGE}
                lineWidth={GRID_LINE_WIDTH}
                endOffset={lineLength}
                lineCap="round"
              />
            );
            yield* lineRef().endOffset(0, 0.12);
            yield* lineRef().opacity(0, 0.08);
            lineRef().remove();
          })();
        })
      );
      yield* waitFor(0.1);
    }

    // Hold all lights bright for final moment
    yield* all(
      ...Array.from({ length: 16 }, (_, col) =>
        ledSystem().fillColumn(col as ColumnPosition, RED_BRIGHT, 0.05)
      )
    );

    yield* waitFor(0.3);

    // Blackout
    yield* all(
      ...Array.from({ length: 16 }, (_, col) =>
        ledSystem().fillColumn(col as ColumnPosition, LED_OFF, 0.2)
      )
    );
  });

  yield* waitFor(27);
});
