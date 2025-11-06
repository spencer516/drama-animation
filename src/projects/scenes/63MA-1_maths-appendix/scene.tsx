import {
  Code,
  Latex,
  Line,
  makeScene2D,
  Node,
  Path,
  Rect,
  Txt,
} from "@motion-canvas/2d";
import { createFilledGrid, setupLEDScene } from "@/lib/LEDSystem";
import {
  all,
  Color,
  createRef,
  delay,
  linear,
  PossibleVector2,
  sequence,
  spawn,
  tween,
  waitFor,
  waitUntil,
} from "@motion-canvas/core";
import { GRID_BLUE, LED_BLUE, LED_OFF } from "@/lib/design-system";
import { Coordinates } from "@/lib/wall-coordinate-system";

const LINE_WIDTH = 10;
const FORMULA_X_POS = 280;

export default makeScene2D(function* (view) {
  const { ledSystem, screen } = setupLEDScene(view);

  const { fill } = createFilledGrid(ledSystem, screen);

  // fill({
  //   ledColor: LED_OFF,
  //   gridColor: new Color("#555555"),
  // });

  // Step 1: random light sparkles that eventually settle to fully on.

  // Step 2: Show the clock with 4:00. Start counting down.
  const timerRef = createRef<Code>();

  screen().add(<Code ref={timerRef} fontSize={36} code="4:00" />);

  spawn(function* () {
    const fourMinutes = 60 * 4;
    yield* tween(fourMinutes, (progress) => {
      const remainingTime = Math.round((1 - progress) * fourMinutes);
      const remainingMinutes = Math.floor(remainingTime / 60);
      const remainingSeconds = Math.round(remainingTime % 60);
      timerRef().code(
        `${remainingMinutes}:${String(remainingSeconds).padStart(2, "0")}`
      );
    });
  });

  yield* waitUntil("explains-the-problem");

  // Step 3: Show the problem:
  /*
    Show that a triangle with the sides that can be written in the form
    (n*2 + 1), (n*2 - 1), and 2n (with n > 1) is right angled.
  */
  const step3Ref = createRef<Node>();

  screen().add(
    <Node ref={step3Ref} opacity={0}>
      <Txt
        text={`Show that, a triangle with sides that can be written in the form:`}
        fontSize={25}
        fill="white"
        y={-120}
      />
      <Latex tex={"(n^2 - 1), (n^2 + 1), 2n"} fill="white" fontSize={25} />
      <Txt text={`is right angled.`} fontSize={25} fill="white" y={120} />
    </Node>
  );

  yield* all(timerRef().y(-330, 1), delay(0.5, step3Ref().opacity(1, 1)));

  yield* waitUntil("done-explain-problem");

  yield* step3Ref().opacity(0, 1);

  step3Ref().remove();

  // Step 4: Fade away the text.
  yield* waitFor(1);

  // Step 5: Show Pythagorean therom
  // if a triangle is right angled, one of its angles will be 90 degrees
  // and will therefore follow Pythagoras' theorm
  // Pythagoras said that a squared plus b squared equals c squared to put it simple.
  /*
    - Draw a triangle with a right angle
    - show a^2 + b^2 = c^2
  */
  const triangleRef = createRef<Path>();
  const rightAngleRef = createRef<Line>();
  const pythagTextRef = createRef<Latex>();

  const base = 40;
  const xOffset = -260;
  const width = base * 4;
  const height = base * 3;

  const trianglePoints: Coordinates[] = [
    [(-1 * width) / 2 + xOffset, height / 2],
    [width / 2 + xOffset, height / 2],
    [width / 2 + xOffset, (-1 * height) / 2],
  ];

  const [raX, raY] = trianglePoints[1];

  const data = pointsToPathData(trianglePoints);

  screen().add(
    <>
      <Path
        ref={triangleRef}
        data={data}
        lineWidth={LINE_WIDTH}
        stroke="white"
        end={0}
        lineJoin="round"
        fill="rgba(255, 255, 255, 0)"
      />
      <Line
        ref={rightAngleRef}
        points={[
          [raX - 30, raY],
          [raX - 30, raY - 30],
          [raX, raY - 30],
        ]}
        stroke="white"
        lineWidth={LINE_WIDTH}
        lineJoin="round"
        end={0}
      />
      <Latex
        ref={pythagTextRef}
        tex={``}
        fontSize={45}
        x={FORMULA_X_POS}
        fill="white"
        opacity={1}
        textAlign="left"
      />
    </>
  );

  yield* all(
    triangleRef().end(1, 1, linear),
    waitFor(0.5, triangleRef().fill("rgba(255, 255, 255, 0.5)", 1, linear))
  );
  yield* rightAngleRef().end(1, 0.3, linear);

  yield* pythagTextRef().tex(String.raw`{{a^2}}`, 1);
  yield* pythagTextRef().tex(String.raw`{{a^2}} + {{b^2}}`, 1);
  yield* pythagTextRef().tex(String.raw`{{a^2}} + {{b^2}} = {{c^2}}`, 1);

  yield* waitUntil("start-squares");

  // Step 6: Keep Pythagoras' therom
  // If you draw squares outside the three sides of a right angled triangle, then add
  // up the area of the two smaller suqares, this will be equal to the area of the larger
  // square. This is only true if the triangle is right angled!
  /*
    - Draw on squares outside of the triangle
    - Put an A, B, and C inside the squares respectively
  */
  const squareARef = createRef<Path>();
  const squareAText = createRef<Latex>();

  const squareBRef = createRef<Path>();
  const squareBText = createRef<Latex>();

  const squareCRef = createRef<Path>();
  const squareCText = createRef<Latex>();

  const squareB = getSquarePoints(
    trianglePoints[0],
    trianglePoints[1],
    "above"
  );

  const squareA = getSquarePoints(
    trianglePoints[1],
    trianglePoints[2],
    "above"
  );

  const squareC = getSquarePoints(
    trianglePoints[2],
    trianglePoints[0],
    "above"
  );

  screen().add(
    <>
      <Path
        ref={squareARef}
        data={pointsToPathData(squareA)}
        lineWidth={LINE_WIDTH}
        stroke="red"
        fill="rgba(255, 0, 0, 0)"
        lineJoin="round"
        end={0}
      />
      <Latex
        ref={squareBText}
        tex="b"
        fontSize={60}
        fill="white"
        x={-260}
        y={135}
        opacity={0}
      />
      <Path
        ref={squareBRef}
        data={pointsToPathData(squareB)}
        lineWidth={LINE_WIDTH}
        stroke="blue"
        fill="rgba(0, 0, 255, 0)"
        lineJoin="round"
        end={0}
      />
      <Latex
        ref={squareAText}
        tex="a"
        fontSize={60}
        fill="white"
        x={-125}
        y={0}
        opacity={0}
      />
      <Path
        ref={squareCRef}
        data={pointsToPathData(squareC)}
        lineWidth={LINE_WIDTH}
        stroke="yellow"
        fill="rgba(255, 255, 0, 0)"
        lineJoin="round"
        end={0}
      />
      <Latex
        ref={squareCText}
        tex="c"
        fontSize={60}
        fill="white"
        x={-315}
        y={-80}
        opacity={0}
      />
    </>
  );

  squareARef().moveBelow(triangleRef());
  squareBRef().moveBelow(triangleRef());
  squareCRef().moveBelow(triangleRef());

  yield* sequence(
    0.7,
    all(
      squareARef().end(1, 1, linear),
      waitFor(
        0.5,
        all(
          squareARef().fill("rgba(255, 0, 0, 0.5)", 1, linear),
          squareAText().opacity(1, 1, linear)
        )
      )
    ),
    all(
      squareBRef().end(1, 1, linear),
      waitFor(
        0.5,
        all(
          squareBRef().fill("rgba(0, 0, 255, 0.5)", 1, linear),
          squareBText().opacity(1, 1, linear)
        )
      )
    ),
    all(
      squareCRef().end(1, 1, linear),
      waitFor(
        0.5,
        all(
          squareCRef().fill("rgba(255, 255, 0, 0.5)", 1, linear),
          squareCText().opacity(1, 1, linear)
        )
      )
    )
  );

  // Step 7: Pause for a bit
  // The A level question is an algebraic formula for making right angled triangles
  yield* waitUntil("show-formulas");

  const SLIDE_DISTANCE = -85;

  // Step 8
  // n squared plus one is the biggest number in this equation, which makes it the
  // hypotenuse, which is the longest side of the triangle
  /*
    - Put the n^2 + 1 inside the largest rectangle
    - Put 2n in another
    - Put n^2 - 1 i the last
  */
  const cFormulaRef = createRef<Latex>();

  screen().add(
    <Latex
      ref={cFormulaRef}
      tex=""
      x={FORMULA_X_POS}
      fontSize={45}
      fill="white"
      opacity={1}
      textAlign="left"
    />
  );

  yield* pythagTextRef().y(SLIDE_DISTANCE, 1);

  yield* cFormulaRef().tex(String.raw`{{c}}`, 0.5);
  yield* cFormulaRef().tex(String.raw`{{c}} = `, 0.5);
  yield* cFormulaRef().tex(String.raw`{{c}} = {{n^2}}`, 0.5);
  yield* cFormulaRef().tex(String.raw`{{c}} = {{n^2}} +`, 0.5);
  yield* cFormulaRef().tex(String.raw`{{c}} = {{n^2}} + {{1}}`, 0.5);

  yield* waitFor(3);

  const bFormulaRef = createRef<Latex>();

  screen().add(
    <Latex
      ref={bFormulaRef}
      tex=""
      x={FORMULA_X_POS}
      fontSize={45}
      fill="white"
      opacity={1}
      textAlign="left"
    />
  );

  yield* all(
    pythagTextRef().y(SLIDE_DISTANCE * 2, 1),
    cFormulaRef().y(SLIDE_DISTANCE, 1)
  );

  yield* bFormulaRef().tex(String.raw`{{b}}`, 0.5);
  yield* bFormulaRef().tex(String.raw`{{b}} = `, 0.5);
  yield* bFormulaRef().tex(String.raw`{{b}} = {{n}} {{^2}}`, 0.5);
  yield* bFormulaRef().tex(String.raw`{{b}} = {{n}} {{^2}} {{-}}`, 0.5);
  yield* bFormulaRef().tex(String.raw`{{b}} = {{n}} {{^2}} {{-}} {{1}}`, 0.5);

  yield* waitFor(3);

  const aFormulaRef = createRef<Latex>();

  screen().add(
    <Latex
      ref={aFormulaRef}
      tex=""
      x={FORMULA_X_POS}
      fontSize={45}
      fill="white"
      opacity={1}
      textAlign="left"
    />
  );

  yield* all(
    pythagTextRef().y(SLIDE_DISTANCE * 3, 1),
    cFormulaRef().y(SLIDE_DISTANCE * 2, 1),
    bFormulaRef().y(SLIDE_DISTANCE, 1)
  );

  yield* aFormulaRef().tex(String.raw`{{a}}`, 0.5);
  yield* aFormulaRef().tex(String.raw`{{a}} = `, 0.5);
  yield* aFormulaRef().tex(String.raw`{{a}} = {{2}}{{n}}`, 0.5);

  yield* waitUntil("multiply-square-A");

  // Step 9
  // To find the area of a square, you must multiply the length by the width.
  // So, the are of this square is 2n x 2n
  // which equals 4n squared
  /*
    - Move the 2n text down below and square it replacing the a^2
  */
  yield* all(
    pythagTextRef().opacity(0.5, 1),
    cFormulaRef().opacity(0.5, 1),
    bFormulaRef().opacity(0.5, 1)
  );

  yield* waitFor(1);

  yield* aFormulaRef().tex(
    String.raw`{{a}}{{^2}} = {{\left(}} {{2}} {{n}} {{\right)}} {{^2}}`,
    1
  );

  yield* aFormulaRef().tex(
    String.raw`{{a}}{{^2}} = {{2}} {{^2}} {{n}} {{^2}}`,
    1
  );

  yield* aFormulaRef().tex(String.raw`{{a}}{{^2}} = {{4}} {{n}} {{^2}}`, 1);

  // Step 10
  // The area of this square is (n squared - 1) x (n squared - 1)
  // Which equals n to the power of 4 plus 2n squared plus 1
  /*
    - Put it where the b^2 was
    - Move the n^2 - 1 down below and foil it
  */

  yield* waitUntil("multiply-square-B");

  yield* all(aFormulaRef().opacity(0.5, 1), bFormulaRef().opacity(1, 1));

  yield* bFormulaRef().tex(
    String.raw`{{b}}{{^2}} = {{\left(}} {{n}} {{^2}} {{-}} {{1}} {{\right)}} {{^2}}`,
    1
  );

  yield* bFormulaRef().tex(
    String.raw`{{b^2}} = {{\left(}} {{n}} {{^2}} {{-}} {{1}} {{\right)}} {{\left(}} {{n}} {{^2}} {{-}} {{1}} {{\right)}}`,
    1.5
  );

  yield* bFormulaRef().tex(
    String.raw`{{b^2}} = {{n}} {{^4}} {{-}} {{n^2}} {{-}} {{n^2}} {{+}} {{1}}`,
    1.5
  );

  yield* bFormulaRef().tex(
    String.raw`{{b^2}} = {{n}} {{^4}} {{-}} {{2}}{{n^2}} {{+}} {{1}}`,
    1.5
  );

  // Step 11
  // NOW...we need to find the are of the square on the hypotenuse which
  // is (n^2 + 1)(n^2 + 1)
  /*
    - Put it where the c^2 was 
    - foil it
  */

  yield* waitUntil("multiply-square-c");

  yield* all(bFormulaRef().opacity(0.5, 1), cFormulaRef().opacity(1, 1));

  yield* cFormulaRef().tex(
    String.raw`{{c}}{{^2}} = {{\left(}} {{n}} {{^2}} {{+}} {{1}} {{\right)}} {{^2}}`,
    1
  );

  yield* cFormulaRef().tex(
    String.raw`{{c^2}} = {{\left(}} {{n}} {{^2}} {{+}} {{1}} {{\right)}} {{\left(}} {{n}} {{^2}} {{+}} {{1}} {{\right)}}`,
    1.5
  );

  yield* cFormulaRef().tex(
    String.raw`{{c^2}} = {{n}} {{^4}} {{+}} {{n^2}} {{+}} {{n^2}} {{+}} {{1}}`,
    1.5
  );

  yield* cFormulaRef().tex(
    String.raw`{{c^2}} = {{n}} {{^4}} {{+}} {{2}}{{n^2}} {{+}} {{1}}`,
    1.5
  );

  yield* waitFor(1);

  yield* pythagTextRef().opacity(1, 0.5);

  yield* all(
    pythagTextRef().tex(
      String.raw`{{a^2}} {{+}} {{b^2}} {{=}} {{n^4}} {{+}} {{2n^2}} {{+}} {{1}}`,
      1
    ),
    pythagTextRef().y(SLIDE_DISTANCE * 2, 1),
    cFormulaRef().opacity(0, 1)
  );

  yield* waitFor(1);

  yield* bFormulaRef().opacity(1, 0.5);

  yield* all(
    pythagTextRef().tex(
      String.raw`{{a^2}} {{+}} {{n^4}} {{-}} {{2n^2}} {{+}} {{1}} {{=}} {{n^4}} {{+}} {{2n^2}} {{+}} {{1}}`,
      1
    ),
    pythagTextRef().y(SLIDE_DISTANCE - 30, 1),
    bFormulaRef().opacity(0, 1)
  );

  yield* waitFor(1);

  yield* aFormulaRef().opacity(1, 0.5);

  yield* all(
    pythagTextRef().tex(
      String.raw`{{4n^2}} {{+}} {{n^4}} {{-}} {{2n^2}} {{+}} {{1}} {{=}} {{n^4}} {{+}} {{2n^2}} {{+}} {{1}}`,
      1
    ),
    aFormulaRef().opacity(0, 1)
  );

  yield* all(
    pythagTextRef().tex(
      String.raw`{{n^4}} {{+}} {{2n^2}} {{+}} {{1}} {{=}} {{n^4}} {{+}} {{2n^2}} {{+}} {{1}}`,
      1
    )
  );

  // Which equals n to the power of 4 plus 2n squared plus 1
  // Which is the SAME TERM!!!!
  // So the area of the two small squares adds up to the are of the larger square
  // So all my squares fit together to satisfy pythagoras' theorem
  // So the triangle is RIGHT ANGLED

  yield* waitUntil("timer-done");
});

function getSquarePoints(
  point1: Coordinates,
  point2: Coordinates,
  position: "above" | "below"
) {
  const [x1, y1] = point1;
  const [x2, y2] = point2;

  // Calculate the vector between the two points
  const dx = x2 - x1;
  const dy = y2 - y1;

  // For a square, we need to create a perpendicular vector of the same length
  // Rotating 90 degrees: (dx, dy) -> (-dy, dx) or (dy, -dx)
  const perpDx = position === "above" ? -dy : dy;
  const perpDy = position === "above" ? dx : -dx;

  // Calculate the other two corners
  const point3: Coordinates = [x1 + perpDx, y1 + perpDy];
  const point4: Coordinates = [x2 + perpDx, y2 + perpDy];

  // Return all four corners in order (clockwise or counter-clockwise)
  return [point1, point2, point4, point3];
}

function pointsToPathData(points: Coordinates[]): string {
  return (
    points
      .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
      .join(" ") + " Z"
  );
}
