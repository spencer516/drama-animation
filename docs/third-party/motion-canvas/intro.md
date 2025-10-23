# Motion Canvas

Motion Canvas is a TypeScript library for programmatic animation creation, designed specifically for creating informative vector animations synchronized with voice-overs. It combines a code-first approach using generator functions with a real-time preview editor, allowing developers to create complex animations through declarative code rather than traditional video editing tools.

The framework provides a comprehensive API for scene management, node manipulation, property tweening, and animation flow control. It uses JSX syntax for defining visual hierarchies, signals for reactive state management, and generator functions to orchestrate animations over time. Motion Canvas includes built-in support for shapes, text, code blocks, layouts using Flexbox, camera controls, and extensive animation primitives.

## Project Setup and Configuration

Initialize a new Motion Canvas project with Node.js 16+.

```bash
# Create new project
npm init @motion-canvas@latest

# Navigate to project directory
cd my-animation

# Install dependencies
npm install

# Start the development server
npm start
# Opens editor at http://localhost:9000/
```

## Vite Configuration

Configure Motion Canvas through Vite's configuration file.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import motionCanvas from "@motion-canvas/vite-plugin";

export default defineConfig({
  plugins: [
    motionCanvas({
      project: "./src/project.ts", // or array for multiple projects
      output: "./output", // render output directory
      bufferedAssets: /\.(wav|ogg)$/, // assets to buffer in memory
    }),
  ],
});
```

## Project Definition

Define animation project with scenes.

```typescript
// src/project.ts
import { makeProject } from "@motion-canvas/core";
import example from "./scenes/example?scene";

export default makeProject({
  scenes: [example],
});
```

## Scene Creation with Nodes

Create 2D scenes with visual elements using JSX syntax.

```typescript
// src/scenes/example.tsx
import { Circle, makeScene2D } from "@motion-canvas/2d";
import { createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const myCircle = createRef<Circle>();

  view.add(
    <Circle ref={myCircle} x={-300} width={140} height={140} fill="#e13238" />
  );

  // Animation code follows
});
```

## Property Tweening

Animate node properties over time with duration and easing.

```typescript
import { Circle, makeScene2D } from "@motion-canvas/2d";
import { createRef, easeInOutCubic } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const circle = createRef<Circle>();

  view.add(
    <Circle ref={circle} x={-300} width={140} height={140} fill="#e13238" />
  );

  // Tween to new value over 1 second
  yield* circle().fill("#e6a700", 1);

  // Chain multiple tweens
  yield* circle().position.x(300, 1).to(-300, 1);

  // Custom easing function
  yield* circle().fill("#e13238", 2, easeInOutCubic);
});
```

## Parallel Animations with Flow Functions

Execute multiple animations simultaneously using flow generators.

```typescript
import { Circle, makeScene2D } from "@motion-canvas/2d";
import { all, createRef, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const circle = createRef<Circle>();

  view.add(
    <Circle ref={circle} x={-300} width={140} height={140} fill="#e13238" />
  );

  // Run animations in parallel
  yield* all(
    circle().position.x(300, 2),
    circle().fill("#e6a700", 2),
    circle().scale(1.5, 2)
  );

  // Wait for 1 second
  yield* waitFor(1);
});
```

## Manual Tween Control

Create custom tweens with interpolation and timing functions.

```typescript
import { Circle, makeScene2D } from "@motion-canvas/2d";
import { createRef, tween, map, easeInOutCubic } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const circle = createRef<Circle>();

  view.add(
    <Circle ref={circle} x={-300} width={240} height={240} fill="#e13238" />
  );

  // Manual tween over 2 seconds
  yield* tween(2, (value) => {
    // value goes from 0 to 1
    circle().position.x(easeInOutCubic(value, -300, 300));
  });
});
```

## Spring Animations

Animate with physics-based spring motion.

```typescript
import { Circle, makeScene2D } from "@motion-canvas/2d";
import {
  PlopSpring,
  SmoothSpring,
  createRef,
  spring,
} from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const circle = createRef<Circle>();

  view.add(<Circle ref={circle} x={-400} size={240} fill={"#e13238"} />);

  // Spring from -400 to 400 with settle tolerance of 1
  yield* spring(PlopSpring, -400, 400, 1, (value) => {
    circle().position.x(value);
  });

  // Smooth spring back
  yield* spring(SmoothSpring, 400, -400, (value) => {
    circle().position.x(value);
  });
});
```

## Scene Hierarchy Management

Build and manipulate node hierarchies.

```typescript
import { Circle, Layout, Rect, Txt, makeScene2D } from "@motion-canvas/2d";
import { createRef, is } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  view.add(
    <Layout layout gap={20} alignItems={"center"}>
      <Txt fill={"white"}>Example</Txt>
      <Rect fill={"#f3303f"} padding={20} gap={20}>
        <Txt fill={"white"}>42</Txt>
        <Circle size={60} fill={"#FFC66D"} />
        <Txt fill={"white"}>!!!</Txt>
      </Rect>
    </Layout>
  );

  // Query all text nodes
  const texts = view.findAll(is(Txt));

  // Animate all found text nodes
  yield* all(...texts.map((text) => text.fill("#FFC66D", 1)));
});
```

## Signals for Reactive Values

Create reactive dependencies between values.

```typescript
import { Circle, Txt, makeScene2D } from "@motion-canvas/2d";
import { createSignal, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const radius = createSignal(3);
  const area = createSignal(() => Math.PI * radius() * radius());

  const scale = 100;

  view.add(
    <>
      <Circle
        width={() => radius() * scale * 2}
        height={() => radius() * scale * 2}
        fill={"#e13238"}
      />
      <Txt
        text={() => `r = ${radius().toFixed(2)}`}
        x={() => (radius() * scale) / 2}
        fill={"#242424"}
        fontSize={56}
      />
      <Txt
        text={() => `A = ${area().toFixed(2)}`}
        y={() => radius() * scale}
        fill={"#e13238"}
        fontSize={56}
      />
    </>
  );

  // Animate radius - all dependent values update automatically
  yield* radius(4, 2).to(3, 2);
  yield* waitFor(1);
});
```

## Code Block Animations

Display and animate code snippets with syntax highlighting.

```typescript
import { Code, makeScene2D, LezerHighlighter, CODE } from "@motion-canvas/2d";
import { createRef, all, waitFor, DEFAULT } from "@motion-canvas/core";
import { parser } from "@lezer/javascript";

// Configure in project.ts
Code.defaultHighlighter = new LezerHighlighter(
  parser.configure({ dialect: "jsx ts" })
);

export default makeScene2D(function* (view) {
  const code = createRef<Code>();

  view.add(
    <Code
      ref={code}
      fontSize={28}
      offsetX={-1}
      x={-400}
      code={"const number = 7;"}
    />
  );

  yield* waitFor(0.6);

  // Multiple code transformations in parallel
  yield* all(
    code().code.replace(code().findFirstRange("number"), "variable", 0.6),
    code().code.prepend(0.6)`function example() {\n  `,
    code().code.append(0.6)`\n}`
  );

  yield* waitFor(0.6);

  // Highlight selection
  yield* code().selection(code().findFirstRange("variable"), 0.6);

  yield* waitFor(0.6);

  // Reset to original
  yield* all(
    code().code("const number = 7;", 0.6),
    code().selection(DEFAULT, 0.6)
  );
});
```

## Flexbox Layouts

Position nodes using Flexbox layout system.

```typescript
import { Rect, Txt, Circle, makeScene2D } from "@motion-canvas/2d";
import { createRef, range, makeRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const rects: Rect[] = [];

  // Create layout with multiple children
  view.add(
    <Rect layout direction={"row"} gap={20} padding={40} fill={"#333"}>
      {range(5).map((i) => (
        <Rect
          ref={makeRef(rects, i)}
          width={100}
          height={100}
          fill="#88C0D0"
          radius={10}
        />
      ))}
    </Rect>
  );

  // Animate all layout children
  yield* all(...rects.map((rect) => rect.scale(1.2, 0.5).to(1, 0.5)));
});
```

## Camera Control

Pan, zoom, and rotate viewport without transforming scene objects.

```typescript
import { Camera, Rect, Circle, makeScene2D } from "@motion-canvas/2d";
import { createRef, all } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const camera = createRef<Camera>();
  const rect = createRef<Rect>();
  const circle = createRef<Circle>();

  view.add(
    <Camera ref={camera}>
      <Rect
        ref={rect}
        fill={"lightseagreen"}
        size={100}
        position={[100, -50]}
      />
      <Circle ref={circle} fill={"hotpink"} size={120} position={[-100, 50]} />
    </Camera>
  );

  // Camera operations
  yield* all(
    camera().centerOn(rect(), 3), // Center on object
    camera().rotation(180, 3), // Rotate viewport
    camera().zoom(1.8, 3) // Zoom in
  );

  yield* camera().centerOn(circle(), 2);
  yield* camera().reset(1); // Reset to defaults
});
```

## Scene Transitions

Transition between scenes with built-in effects.

```typescript
// src/scenes/secondScene.tsx
import { makeScene2D, Rect } from "@motion-canvas/2d";
import { slideTransition, Direction, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  view.add(<Rect width={400} height={300} fill={"#e13238"} />);

  // Slide transition from previous scene
  yield* slideTransition(Direction.Left, 0.6);

  yield* waitFor(3);
});
```

## Rendering Configuration

Configure and render animation to video or image sequence.

```typescript
// Video Settings in Editor UI:
// - Resolution: 1920x1080
// - Frame rate: 60
// - Range: 0 to end
// - Background: #242424
// - Exporter: Video (FFmpeg) or Image sequence

// Programmatically set scene background
export default makeScene2D(function* (view) {
  view.fill("#242424"); // Set background
  yield* view.fill("lightseagreen", 2); // Animate background

  // Scene content
});

// Render from CLI or Editor UI
// Output: ./output/project-name/
```

## Sequential and Looped Animations

Control animation flow with sequence and loop functions.

```typescript
import { Rect, makeScene2D } from "@motion-canvas/2d";
import { sequence, loop, createRef, waitFor } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const rect = createRef<Rect>();

  view.add(<Rect ref={rect} width={100} height={100} fill="#e13238" />);

  // Start animations with delay between each
  yield* sequence(
    0.3, // 0.3 second delay between starts
    rect().position.x(200, 1),
    rect().position.y(100, 1),
    rect().scale(1.5, 1)
  );

  // Infinite loop (use with yield, not yield*)
  yield loop(
    3,
    (i) =>
      function* () {
        yield* rect().rotation(360 * (i + 1), 1);
      }
  );

  yield* waitFor(1);
});
```

## Animation State Save and Restore

Save and restore node states for complex animations.

```typescript
import { Circle, makeScene2D } from "@motion-canvas/2d";
import { all, createRef } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  const circle = createRef<Circle>();

  view.add(
    <Circle ref={circle} size={150} position={[-300, -300]} fill={"#e13238"} />
  );

  // Save initial state
  circle().save();
  yield* all(circle().position.x(0, 1), circle().scale(1.5, 1));

  // Save second state
  circle().save();
  yield* all(circle().position.y(0, 1), circle().scale(0.5, 1));

  // Save third state
  circle().save();
  yield* all(circle().position.x(300, 1), circle().scale(1, 1));

  // Restore states in reverse (stack-based)
  yield* circle().restore(1); // Back to state 3
  yield* circle().restore(1); // Back to state 2
  yield* circle().restore(1); // Back to initial state
});
```

Motion Canvas excels at creating programmatic animations for educational content, technical presentations, and data visualizations. The generator-based approach provides precise control over animation timing, while the real-time editor enables rapid iteration. Its signal system creates reactive dependencies that automatically propagate changes throughout the scene hierarchy, reducing boilerplate code.

The framework integrates seamlessly with TypeScript tooling and supports modular animation composition through reusable generator functions. Built-in features like code block syntax highlighting, Flexbox layouts, and camera controls eliminate the need for external animation tools. Motion Canvas outputs to standard video formats or image sequences, making it compatible with traditional video editing workflows while maintaining the benefits of programmatic animation control.
