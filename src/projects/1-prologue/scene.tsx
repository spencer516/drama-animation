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
} from "@motion-canvas/core";
import { sequenceRows } from "@/lib/wall-coordinate-system";
import { LED_ON } from "@/lib/colors";

const ZYGOTE_FADE_IN = 0.8;
const ZYGOTE_PULSE_SPEED = 0.8;
const ZYGODE_FADED_COLOR = LED_ON.darken(3);

export default makeScene2D(function* (view) {
  const { ledSystem } = setupLEDScene(view);

  const zygoteLight = ledSystem().lightRefAt([12, 4]);

  // Phase 1: Light visible on the bottom right, pulsing slowly :00 - :05
  yield* zygoteLight().fill(LED_ON, ZYGOTE_FADE_IN);

  const spawner = spawn(
    loop(() =>
      chain(
        zygoteLight().fill(ZYGODE_FADED_COLOR, ZYGOTE_PULSE_SPEED),
        zygoteLight().fill(LED_ON, ZYGOTE_PULSE_SPEED)
      )
    )
  );

  yield* waitUntil("swarm-begins");

  zygoteLight().fill(LED_ON);
  spawner.return();

  // Phase 2: Other lights start swirling toward the one light :05 - :17

  yield* waitUntil("contact");

  // Phase 3: Contact ... the grid starts to fill in like lightning exploring the lines :17 - :32
  // First the horizontal and vertical explode out from it; then the others start to fill in

  // Phase 4: Complete chaos with an upwards driection :32 - :40

  // Phase 5: Cut to Blue

  yield* waitFor(10);
});
