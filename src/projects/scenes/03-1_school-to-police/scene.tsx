import { makeScene2D } from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import { all, Color, waitFor } from "@motion-canvas/core";
import {
  GRID_BLACK,
  GRID_BLUE,
  GRID_YELLOW,
  LED_BLUE,
  LED_OFF,
  LED_YELLOW,
} from "@/lib/design-system";
import {
  getPoliceLightPositions,
  POLICE_HEIGHT,
  setupPoliceStructure,
} from "@/lib/scenes/police";
import {
  allPositions,
  excludePositions,
  intersectPositions,
  positionsToDistance,
} from "@/lib/wall-coordinate-system";

const TRANSITION_TIME = 1.3;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill, verticalLines, horizontalLines } = createFilledGrid(
    ledSystem,
    screen
  );

  fill({
    ledColor: LED_BLUE,
    gridColor: GRID_BLUE,
  });

  const { rects } = setupPoliceStructure(screen, GRID_BLACK);
  const allLightPositions = allPositions();
  const policeLightPositions = getPoliceLightPositions();

  const lightsToTurnOff = excludePositions(
    allLightPositions,
    policeLightPositions
  );

  const lightsToFade = intersectPositions(
    allLightPositions,
    policeLightPositions
  );

  const verticalDistanceOffset = positionsToDistance([
    [0, 0],
    [0, POLICE_HEIGHT],
  ]);

  const linesToFadeOut = horizontalLines.slice(0, POLICE_HEIGHT);
  const linesToTransition = horizontalLines.slice(POLICE_HEIGHT);

  yield* all(
    ...lightsToTurnOff.map((position) =>
      ledSystem().fillAt(position, LED_OFF, TRANSITION_TIME)
    ),
    ...lightsToFade.map((position) =>
      ledSystem().fillAt(position, LED_YELLOW, TRANSITION_TIME)
    ),
    ...verticalLines.map((line) =>
      all(
        line.startOffset(verticalDistanceOffset, TRANSITION_TIME),
        line.stroke(GRID_YELLOW, TRANSITION_TIME)
      )
    ),
    ...linesToFadeOut.map((line) => line.stroke(GRID_BLACK, TRANSITION_TIME)),
    ...linesToTransition.map((line) =>
      line.stroke(GRID_YELLOW, TRANSITION_TIME)
    ),
    ...rects.map((rect) => rect.fill(GRID_YELLOW, TRANSITION_TIME))
  );

  yield* waitFor(0.1);
});
