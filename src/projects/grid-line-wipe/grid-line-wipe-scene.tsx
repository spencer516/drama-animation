import { makeScene2D } from "@motion-canvas/2d";
import { setupLEDScene } from "@/lib/LEDSystem";
import {
  Color,
  all,
  waitFor,
  easeInOutCubic,
  linear,
} from "@motion-canvas/core";
import { Position } from "@/lib/wall-coordinate-system";

// ============================================================================
// ANIMATION SETTINGS - Customize these values to control the animation
// ============================================================================

// Direction of the wipe animation
type Direction = "left-to-right" | "right-to-left" | "top-to-bottom" | "bottom-to-top";
const DIRECTION: Direction = "left-to-right";

// Duration settings
const TOTAL_DURATION = 10; // Total duration for the entire animation in seconds
const LINE_TRAVEL_TIME = 2; // How long it takes for a line to travel across the grid (seconds)

// Line settings
const NUM_LINES = 5; // Number of lines that will animate across
const MAX_STAGGER = 0.8; // Maximum random delay between line starts (seconds)
const SPEED_VARIANCE = 0.3; // Random speed variance factor (0 to 1, where 1 = 100% variance)

// LED settings
const LED_ON_DURATION = 0.1; // How quickly LEDs turn on when a line crosses (seconds)
const LED_OFF_DURATION = 0.2; // How quickly LEDs turn off when a line passes (seconds)
const LINE_COLOR = "#FFFFFF"; // Color of the moving line and LEDs

// ============================================================================
// GRID SYSTEM
// ============================================================================

// The LED grid is 16x6
const GRID_WIDTH = 16; // Number of LEDs horizontally
const GRID_HEIGHT = 6; // Number of LEDs vertically

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getGridLines(direction: Direction): number {
  // Return the number of grid lines based on direction
  if (direction === "left-to-right" || direction === "right-to-left") {
    return GRID_WIDTH;
  } else {
    return GRID_HEIGHT;
  }
}

function getLinePosition(direction: Direction, progress: number): number {
  // Convert progress (0 to 1) to a line index (with sub-pixel precision)
  const numLines = getGridLines(direction);

  if (direction === "right-to-left" || direction === "bottom-to-top") {
    // Reverse direction
    return (numLines - 1) * (1 - progress);
  } else {
    // Forward direction
    return (numLines - 1) * progress;
  }
}

function getLEDsForLine(
  direction: Direction,
  lineIndex: number
): Position[] {
  // Get all LEDs that should be lit at a specific line position
  const leds: Position[] = [];
  const roundedIndex = Math.round(lineIndex);

  // Make sure index is within bounds
  if (roundedIndex < 0 ||
      (direction === "left-to-right" || direction === "right-to-left" ?
        roundedIndex >= GRID_WIDTH :
        roundedIndex >= GRID_HEIGHT)) {
    return leds;
  }

  if (direction === "left-to-right" || direction === "right-to-left") {
    // Vertical line - light up all LEDs in this column
    for (let y = 0; y < GRID_HEIGHT; y++) {
      leds.push([roundedIndex, y] as Position);
    }
  } else {
    // Horizontal line - light up all LEDs in this row
    for (let x = 0; x < GRID_WIDTH; x++) {
      leds.push([x, roundedIndex] as Position);
    }
  }

  return leds;
}

// ============================================================================
// MAIN SCENE
// ============================================================================

export default makeScene2D(function* (view) {
  const { ledSystem } = setupLEDScene(view);

  // Reset everything to black
  ledSystem().fillAll(new Color("black"));

  // ============================================================================
  // LINE ANIMATION STATE
  // ============================================================================

  interface AnimatedLine {
    progress: number; // 0 to 1+ (can go beyond 1 as line exits)
    speed: number; // Units per second
    startDelay: number; // Delay before starting
    currentLEDs: Set<string>; // Currently lit LED positions (as "x,y" strings)
  }

  // Create lines with random stagger and speed variance
  const lines: AnimatedLine[] = [];
  for (let i = 0; i < NUM_LINES; i++) {
    const randomSpeed = 1 / LINE_TRAVEL_TIME * (1 + (Math.random() - 0.5) * SPEED_VARIANCE);
    const randomDelay = Math.random() * MAX_STAGGER;

    lines.push({
      progress: 0,
      speed: randomSpeed,
      startDelay: randomDelay,
      currentLEDs: new Set(),
    });
  }

  // ============================================================================
  // ANIMATION LOOP
  // ============================================================================

  const colorObj = new Color(LINE_COLOR);
  const blackObj = new Color("black");
  const startTime = Date.now();

  // Wait for all lines to start
  const maxStartDelay = Math.max(...lines.map(l => l.startDelay));

  // Calculate when we should stop (after all lines have crossed and exited)
  const maxLineEndTime = maxStartDelay + LINE_TRAVEL_TIME * (1 + SPEED_VARIANCE / 2) * 1.5;
  const animationDuration = Math.max(TOTAL_DURATION, maxLineEndTime);

  // Animation frame loop
  const frameTime = 1 / 30; // 30 FPS
  let elapsedTime = 0;

  while (elapsedTime < animationDuration) {
    // Track all LEDs that should be on this frame
    const ledsToTurnOn = new Set<string>();

    // Update each line
    for (const line of lines) {
      const lineTime = elapsedTime - line.startDelay;

      if (lineTime < 0) {
        // Line hasn't started yet
        continue;
      }

      // Update progress
      line.progress = lineTime * line.speed;

      // If line has completely exited, turn off its LEDs
      if (line.progress > 1.5) {
        // Turn off any remaining LEDs from this line
        for (const ledKey of line.currentLEDs) {
          const [x, y] = ledKey.split(',').map(Number);
          yield* ledSystem().fillAt([x, y] as Position, blackObj, LED_OFF_DURATION);
        }
        line.currentLEDs.clear();
        continue;
      }

      // Get current line position
      const linePosition = getLinePosition(DIRECTION, line.progress);
      const currentLEDs = getLEDsForLine(DIRECTION, linePosition);

      // Track which LEDs should be on
      for (const led of currentLEDs) {
        const ledKey = `${led[0]},${led[1]}`;
        ledsToTurnOn.add(ledKey);
      }
    }

    // Update LED states for all lines
    const allLEDUpdates: Generator<any, void, any>[] = [];

    for (const line of lines) {
      // Turn off LEDs that are no longer active
      for (const ledKey of line.currentLEDs) {
        if (!ledsToTurnOn.has(ledKey)) {
          const [x, y] = ledKey.split(',').map(Number);
          allLEDUpdates.push(
            ledSystem().fillAt([x, y] as Position, blackObj, LED_OFF_DURATION)
          );
        }
      }

      // Update current LEDs set
      line.currentLEDs = new Set(
        Array.from(ledsToTurnOn).filter(key => {
          const [x, y] = key.split(',').map(Number);
          const linePosition = getLinePosition(DIRECTION, line.progress);
          const lineLEDs = getLEDsForLine(DIRECTION, linePosition);
          return lineLEDs.some(led => led[0] === x && led[1] === y);
        })
      );
    }

    // Turn on new LEDs
    for (const ledKey of ledsToTurnOn) {
      const [x, y] = ledKey.split(',').map(Number);
      allLEDUpdates.push(
        ledSystem().fillAt([x, y] as Position, colorObj, LED_ON_DURATION)
      );
    }

    // Execute all LED updates in parallel
    if (allLEDUpdates.length > 0) {
      yield* all(...allLEDUpdates);
    }

    // Wait for next frame
    yield* waitFor(frameTime);
    elapsedTime += frameTime;
  }

  // Final cleanup - ensure all LEDs are off
  yield* ledSystem().fillAll(blackObj, LED_OFF_DURATION);

  // Hold black for a moment
  yield* waitFor(0.5);
});
