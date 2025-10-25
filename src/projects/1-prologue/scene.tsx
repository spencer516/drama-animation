import { makeScene2D } from "@motion-canvas/2d";
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
} from "@motion-canvas/core";
import {
  sequenceRows,
  Position,
  ColumnPosition,
  RowPosition,
} from "@/lib/wall-coordinate-system";
import { LED_ON, LED_OFF } from "@/lib/colors";
import { Reference } from "@motion-canvas/core";
import { Light } from "@/lib/Light";

// Zygote (initial light) parameters
const ZYGOTE_FADE_IN = 0.8;
const ZYGOTE_PULSE_SPEED = 0.8;
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

export default makeScene2D(function* (view) {
  const { ledSystem } = setupLEDScene(view);
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

  yield* all(
    ...swarmLights.map((swarmLight) => swarmLight.lightRef().fill(LED_OFF, 0.5))
  );

  // Phase 3: Contact ... the grid starts to fill in like lightning exploring the lines :17 - :32
  // First the horizontal and vertical explode out from it; then the others start to fill in

  // Phase 4: Complete chaos with an upwards driection :32 - :40

  // Phase 5: Cut to Blue

  yield* waitFor(10);
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
