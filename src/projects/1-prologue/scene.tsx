import { Line, makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  chain,
  Color,
  loop,
  loopUntil,
  sequence,
  spawn,
  waitFor,
  waitUntil,
  useRandom,
  all,
  Random,
  createRef,
  delay,
} from "@motion-canvas/core";
import {
  sequenceRows,
  Position,
  ColumnPosition,
  RowPosition,
  positionToCoordinates,
  positionsToDistance,
  coordinatesToDistance,
} from "@/lib/wall-coordinate-system";
import {
  LED_ON,
  LED_OFF,
  GRID_WHITE,
  GRID_LINE_WIDTH,
} from "@/lib/design-system";
import { Reference } from "@motion-canvas/core";
import { Light } from "@/lib/Light";

// Zygote (initial light) parameters
const ZYGOTE_FADE_IN = 0.8;
const ZYGOTE_PULSE_SPEED = 1.1;
const ZYGODE_FADED_COLOR = LED_ON.darken(3);

// Swarm parameters
const SWARM_GENERATION_INTERVAL = 0.5; // Time between generating new swarm lights
const SWARM_MAX_GENERATIONS = 30;
const SWARM_FLICKER_MIN_DURATION = 0.1; // Min time for lights to appear/disappear
const SWARM_FLICKER_MAX_DURATION = 0.3; // Max time for lights to appear/disappear
const SWARM_LIGHTS_PER_GENERATION = 2; // Number of lights to spawn each generation
const SWARM_MOVEMENT_DURATION = 1; // How long each "movement step" takes
const SWARM_SPAWN_REGION: [Position, Position] = [
  [0, 0],
  [5, 2],
]; // Top-left region
const ZYGOTE_POSITION: Position = [12, 4]; // Bottom-right position

// At Conception Params
const CONCEPTION_MOMENT_DURATION = 0.4;

// Lightning Branching Effect Parameters
const LIGHTNING_TOTAL_DURATION = 15; // Total time for grid to fill
const LIGHTNING_BRANCH_INTERVAL = 0.25; // Time between spawning new branches
const LIGHTNING_LINE_DURATION = 0.6; // How long each line segment takes to draw
const LIGHTNING_BRANCH_PROBABILITY = 0.25; // Chance for a point to branch in multiple directions
const LIGHTNING_MAX_BRANCHES_PER_POINT = 2; // Max simultaneous branches from one point
const LIGHTNING_BRANCHES_PER_INTERVAL = 2; // Max branches to spawn per interval

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);
  const randomGenerator = useRandom();

  const zygoteLight = ledSystem().lightRefAt(ZYGOTE_POSITION);

  // Phase 1: Light visible on the bottom right, pulsing slowly :00 - :05
  yield* zygoteLight().fill(LED_ON, ZYGOTE_FADE_IN);

  const zygotePulseTask = spawn(
    loop(() =>
      chain(
        zygoteLight().fill(ZYGODE_FADED_COLOR, ZYGOTE_PULSE_SPEED),
        zygoteLight().fill(LED_ON, ZYGOTE_PULSE_SPEED)
      )
    )
  );

  yield* waitUntil("swarm-begins");

  // Phase 2: Other lights start swirling toward the one light :05 - :17

  const swarmLights: SwarmLight[] = [];
  // Track occupied positions: key is "col,row", value is the swarm light at that position
  const occupiedPositions = new Map<string, SwarmLight>();

  const positionKey = (pos: Position): string => `${pos[0]},${pos[1]}`;

  // Generation phase: spawn lights gradually
  const generationTask = spawn(function* () {
    for (let gen = 0; gen < SWARM_MAX_GENERATIONS; gen++) {
      for (let i = 0; i < SWARM_LIGHTS_PER_GENERATION; i++) {
        const position = getRandomSpawnPosition(randomGenerator);
        const posKey = positionKey(position);

        // Skip if position is already occupied
        if (occupiedPositions.has(posKey)) {
          continue;
        }

        const lightRef = ledSystem().lightRefAt(position);

        const swarmLight: SwarmLight = {
          lightRef,
          currentPosition: position,
        };

        // Start flickering
        swarmLight.flickerTask = spawn(flickerLight(lightRef, randomGenerator));
        swarmLights.push(swarmLight);
        occupiedPositions.set(posKey, swarmLight);
      }

      yield* waitFor(SWARM_GENERATION_INTERVAL);
    }
  });

  // Movement phase: gradually move lights towards zygote
  yield* waitFor(1.0); // Let some lights spawn first

  const movementTask = spawn(function* () {
    while (true) {
      // Iterate through a copy since we might remove items
      for (let i = swarmLights.length - 1; i >= 0; i--) {
        const swarmLight = swarmLights[i];
        const distance = distanceToZygote(swarmLight.currentPosition);

        // Only move if not at zygote yet
        if (distance > 0) {
          const newPosition = getPositionCloserToZygote(
            swarmLight.currentPosition,
            randomGenerator
          );

          // If position changed, move the light
          if (
            newPosition[0] !== swarmLight.currentPosition[0] ||
            newPosition[1] !== swarmLight.currentPosition[1]
          ) {
            const oldPosKey = positionKey(swarmLight.currentPosition);
            const newPosKey = positionKey(newPosition);

            // Check if new position is already occupied
            if (occupiedPositions.has(newPosKey)) {
              // Position is occupied, terminate this swarm light
              if (swarmLight.flickerTask) {
                swarmLight.flickerTask.return();
              }
              // Turn off the light
              swarmLight.lightRef().fill(LED_OFF);
              // Remove from tracking
              occupiedPositions.delete(oldPosKey);
              swarmLights.splice(i, 1);
              continue;
            }

            // Stop flickering at old position
            if (swarmLight.flickerTask) {
              swarmLight.flickerTask.return();
            }

            // Update position tracking
            occupiedPositions.delete(oldPosKey);

            // Turn off the old light
            swarmLight.lightRef().fill(LED_OFF);

            // Get new light reference
            const newLightRef = ledSystem().lightRefAt(newPosition);
            swarmLight.currentPosition = newPosition;
            swarmLight.lightRef = newLightRef;

            // Register new position
            occupiedPositions.set(newPosKey, swarmLight);

            // Start flickering at new position
            swarmLight.flickerTask = spawn(
              flickerLight(newLightRef, randomGenerator)
            );
          }
        }
      }

      yield* waitFor(SWARM_MOVEMENT_DURATION);
    }
  });

  // Wait a bit for the swarm to develop
  yield* waitUntil("contact");

  zygoteLight().fill(LED_ON);
  zygotePulseTask.return();
  generationTask.return();
  movementTask.return();

  // Stop all flickering and turn lights on
  for (const swarmLight of swarmLights) {
    swarmLight.flickerTask.return();
  }

  const upperVLineRef = createRef<Line>();
  const lowerVLineRef = createRef<Line>();
  const leftHLineRef = createRef<Line>();
  const rightHLineRef = createRef<Line>();

  const zygoteCoordinates = positionToCoordinates(ZYGOTE_POSITION);

  const upperVLinePoints = [
    zygoteCoordinates,
    positionToCoordinates([ZYGOTE_POSITION[0], 0]),
  ];

  const upperVLineLength = coordinatesToDistance(upperVLinePoints);

  const lowerVLinePoints = [
    zygoteCoordinates,
    positionToCoordinates([ZYGOTE_POSITION[0], 5]),
  ];

  const lowerVLineLength = coordinatesToDistance(lowerVLinePoints);

  const leftHLinePoints = [
    zygoteCoordinates,
    positionToCoordinates([0, ZYGOTE_POSITION[1]]),
  ];

  const leftHLineLength = coordinatesToDistance(leftHLinePoints);

  const rightHLinePoints = [
    zygoteCoordinates,
    positionToCoordinates([15, ZYGOTE_POSITION[1]]),
  ];

  const rightHLineLength = coordinatesToDistance(rightHLinePoints);

  // Add the vertical/horizontal explosion lines
  screen().add(
    <>
      <Line
        ref={upperVLineRef}
        points={upperVLinePoints}
        stroke={GRID_WHITE}
        lineWidth={GRID_LINE_WIDTH}
        endOffset={upperVLineLength}
        lineCap="round"
      />
      <Line
        ref={lowerVLineRef}
        points={lowerVLinePoints}
        stroke={GRID_WHITE}
        lineWidth={GRID_LINE_WIDTH}
        endOffset={lowerVLineLength}
        lineCap="round"
      />
      <Line
        ref={leftHLineRef}
        points={leftHLinePoints}
        stroke={GRID_WHITE}
        lineWidth={GRID_LINE_WIDTH}
        endOffset={leftHLineLength}
        lineCap="round"
      />
      <Line
        ref={rightHLineRef}
        points={rightHLinePoints}
        stroke={GRID_WHITE}
        lineWidth={GRID_LINE_WIDTH}
        endOffset={rightHLineLength}
        lineCap="round"
      />
    </>
  );

  const maxLineLength = Math.max(
    upperVLineLength,
    lowerVLineLength,
    leftHLineLength,
    rightHLineLength
  );

  for (const swarmLight of swarmLights) {
    swarmLight.lightRef().fill(LED_OFF);
  }

  yield* all(
    upperVLineRef().endOffset(
      upperVLineLength - maxLineLength,
      CONCEPTION_MOMENT_DURATION
    ),
    lowerVLineRef().endOffset(
      lowerVLineLength - maxLineLength,
      CONCEPTION_MOMENT_DURATION
    ),
    leftHLineRef().endOffset(
      leftHLineLength - maxLineLength,
      CONCEPTION_MOMENT_DURATION
    ),
    rightHLineRef().endOffset(
      rightHLineLength - maxLineLength,
      CONCEPTION_MOMENT_DURATION
    ),
    ledSystem().fillColumn(
      ZYGOTE_POSITION[0],
      LED_ON,
      CONCEPTION_MOMENT_DURATION * 0.6
    ),
    ledSystem().fillRow(
      ZYGOTE_POSITION[1],
      LED_ON,
      CONCEPTION_MOMENT_DURATION * 0.6
    )
  );

  // Phase 3: Contact ... the grid starts to fill in like lightning exploring the lines :17 - :32
  // First the horizontal and vertical explode out from it; then the others start to fill in

  // HERE CLAUDE!

  // Track which positions already have lights on and which line segments exist
  const activeLights = new Set<string>();
  const activeLineSegments = new Set<string>();

  // Helper to create a position key
  const lightKey = (pos: Position): string => `${pos[0]},${pos[1]}`;

  // Helper to create a line segment key (normalized so direction doesn't matter)
  const lineKey = (from: Position, to: Position): string => {
    const [x1, y1] = from;
    const [x2, y2] = to;
    return x1 < x2 || (x1 === x2 && y1 < y2)
      ? `${x1},${y1}-${x2},${y2}`
      : `${x2},${y2}-${x1},${y1}`;
  };

  // Initialize with the already-visible cross pattern
  // Add all lights in the zygote column and row
  for (let row = 0; row <= 5; row++) {
    activeLights.add(lightKey([ZYGOTE_POSITION[0], row as RowPosition]));
  }
  for (let col = 0; col <= 15; col++) {
    activeLights.add(lightKey([col as ColumnPosition, ZYGOTE_POSITION[1]]));
  }

  // Add all line segments in the cross pattern
  for (let row = 0; row < 5; row++) {
    const from: Position = [ZYGOTE_POSITION[0], row as RowPosition];
    const to: Position = [ZYGOTE_POSITION[0], (row + 1) as RowPosition];
    activeLineSegments.add(lineKey(from, to));
  }
  for (let col = 0; col < 15; col++) {
    const from: Position = [col as ColumnPosition, ZYGOTE_POSITION[1]];
    const to: Position = [(col + 1) as ColumnPosition, ZYGOTE_POSITION[1]];
    activeLineSegments.add(lineKey(from, to));
  }

  // Track frontier: positions that can spawn new branches
  const frontier: Position[] = [];

  // Add all positions from the cross to the frontier
  for (let row = 0; row <= 5; row++) {
    frontier.push([ZYGOTE_POSITION[0], row as RowPosition]);
  }
  for (let col = 0; col <= 15; col++) {
    if (col !== ZYGOTE_POSITION[0]) {
      frontier.push([col as ColumnPosition, ZYGOTE_POSITION[1]]);
    }
  }

  // Helper to get neighboring positions (up, down, left, right)
  const getNeighbors = (pos: Position): Position[] => {
    const [col, row] = pos;
    const neighbors: Position[] = [];

    if (col > 0) neighbors.push([(col - 1) as ColumnPosition, row]);
    if (col < 15) neighbors.push([(col + 1) as ColumnPosition, row]);
    if (row > 0) neighbors.push([col, (row - 1) as RowPosition]);
    if (row < 5) neighbors.push([col, (row + 1) as RowPosition]);

    return neighbors;
  };

  // Helper to draw a line and fade in a light
  function* drawLightningBranch(from: Position, to: Position) {
    const fromCoords = positionToCoordinates(from);
    const toCoords = positionToCoordinates(to);
    const linePoints = [fromCoords, toCoords];
    const lineLength = coordinatesToDistance(linePoints);

    const branchLineRef = createRef<Line>();

    screen().add(
      <Line
        ref={branchLineRef}
        points={linePoints}
        stroke={GRID_WHITE}
        lineWidth={GRID_LINE_WIDTH}
        endOffset={lineLength}
        lineCap="round"
      />
    );

    const toLight = ledSystem().lightRefAt(to);

    // Animate line drawing and light fading in simultaneously
    yield* all(
      branchLineRef().endOffset(0, LIGHTNING_LINE_DURATION),
      toLight().fill(LED_ON, LIGHTNING_LINE_DURATION)
    );
  }

  // Main lightning branching loop
  const startTime = Date.now();
  while (activeLights.size < 96) {
    // 16 columns * 6 rows = 96 total positions
    // Check if we've exceeded our time budget
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed > LIGHTNING_TOTAL_DURATION) {
      break;
    }

    // Shuffle the frontier to add randomness
    const shuffledFrontier = [...frontier].sort(() =>
      randomGenerator.nextFloat(-1, 1)
    );

    let branchesSpawned = 0;

    for (const fromPos of shuffledFrontier) {
      // Get all unlit neighbors
      const neighbors = getNeighbors(fromPos);
      const unlitNeighbors = neighbors.filter(
        (n) => !activeLights.has(lightKey(n))
      );

      if (unlitNeighbors.length === 0) continue;

      // Decide how many branches to spawn from this point
      const shouldBranch =
        randomGenerator.nextFloat(0, 1) < LIGHTNING_BRANCH_PROBABILITY;
      const maxBranches = shouldBranch
        ? Math.min(LIGHTNING_MAX_BRANCHES_PER_POINT, unlitNeighbors.length)
        : 1;

      const numBranches = randomGenerator.nextInt(1, maxBranches + 1);

      // Spawn branches
      for (let i = 0; i < numBranches && i < unlitNeighbors.length; i++) {
        const toPos = unlitNeighbors[i];
        const segmentKey = lineKey(fromPos, toPos);

        // Skip if this line segment already exists
        if (activeLineSegments.has(segmentKey)) continue;

        // Mark as active
        activeLights.add(lightKey(toPos));
        activeLineSegments.add(segmentKey);
        frontier.push(toPos);

        // Spawn the branch animation
        spawn(drawLightningBranch(fromPos, toPos));

        branchesSpawned++;
      }

      // Limit how many branches we spawn per interval
      if (branchesSpawned >= LIGHTNING_BRANCHES_PER_INTERVAL) break;
    }

    yield* waitFor(LIGHTNING_BRANCH_INTERVAL);
  }

  // Fill in any remaining line segments between lit lights
  // This ensures every adjacent pair of lights has a connecting line
  const missingSegments: [Position, Position][] = [];

  for (let col = 0; col <= 15; col++) {
    for (let row = 0; row <= 5; row++) {
      const pos: Position = [col as ColumnPosition, row as RowPosition];

      // Check horizontal connection to the right
      if (col < 15) {
        const rightPos: Position = [
          (col + 1) as ColumnPosition,
          row as RowPosition,
        ];
        const segmentKey = lineKey(pos, rightPos);
        if (!activeLineSegments.has(segmentKey)) {
          missingSegments.push([pos, rightPos]);
          activeLineSegments.add(segmentKey);
        }
      }

      // Check vertical connection down
      if (row < 5) {
        const downPos: Position = [
          col as ColumnPosition,
          (row + 1) as RowPosition,
        ];
        const segmentKey = lineKey(pos, downPos);
        if (!activeLineSegments.has(segmentKey)) {
          missingSegments.push([pos, downPos]);
          activeLineSegments.add(segmentKey);
        }
      }
    }
  }

  spawn(
    all(
      ...missingSegments.map(([from, to]) =>
        delay(randomGenerator.nextFloat(0, 5.5), drawLightningBranch(from, to))
      )
    )
  );

  // Phase 4: Complete chaos with an upwards direction :32 - :40
  yield* waitUntil("chaos");
});

// Track all swarm lights with their positions
interface SwarmLight {
  lightRef: Reference<Light>;
  currentPosition: Position;
  flickerTask?: any;
}

// Flicker animation for a single light
function* flickerLight(light: Reference<Light>, randomGenerator: Random) {
  while (true) {
    const onDuration = randomGenerator.nextFloat(
      SWARM_FLICKER_MIN_DURATION,
      SWARM_FLICKER_MAX_DURATION
    );
    const offDuration = randomGenerator.nextFloat(
      SWARM_FLICKER_MIN_DURATION,
      SWARM_FLICKER_MAX_DURATION
    );

    yield* light().fill(LED_ON, onDuration * 0.3);
    yield* waitFor(onDuration * 0.7);
    yield* light().fill(LED_OFF, offDuration * 0.3);
    yield* waitFor(offDuration * 0.7);
  }
}

// Helper to get all available positions in spawn region
const getRandomSpawnPosition = (randomGenerator: Random): Position => {
  const [topLeft, bottomRight] = SWARM_SPAWN_REGION;
  const col = randomGenerator.nextInt(topLeft[0], bottomRight[0] + 1);
  const row = randomGenerator.nextInt(topLeft[1], bottomRight[1] + 1);
  return [col, row] as Position;
};

// Helper to calculate distance to zygote
const distanceToZygote = (pos: Position): number => {
  const dx = ZYGOTE_POSITION[0] - pos[0];
  const dy = ZYGOTE_POSITION[1] - pos[1];
  return Math.sqrt(dx * dx + dy * dy);
};

// Helper to get a position closer to the zygote
const getPositionCloserToZygote = (
  currentPos: Position,
  randomGenerator: Random
): Position | null => {
  const [zx, zy] = ZYGOTE_POSITION;
  const dx = zx - currentPos[0];
  const dy = zy - currentPos[1];

  // Move towards zygote, with some randomness
  let newCol = currentPos[0];
  let newRow = currentPos[1];

  if (Math.abs(dx) > 0.1) {
    newCol +=
      dx > 0 ? randomGenerator.nextInt(0, 3) : -randomGenerator.nextInt(0, 3);
  }
  if (Math.abs(dy) > 0.1) {
    newRow +=
      dy > 0 ? randomGenerator.nextInt(0, 3) : -randomGenerator.nextInt(0, 3);
  }

  // Clamp to valid range
  newCol = Math.max(0, Math.min(15, newCol)) as ColumnPosition;
  newRow = Math.max(0, Math.min(5, newRow)) as RowPosition;

  if (newCol === zx && newRow === zy) {
    return currentPos;
  }

  return [newCol, newRow] as Position;
};
