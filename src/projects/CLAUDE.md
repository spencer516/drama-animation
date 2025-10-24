This directory is used for creating new projects. There's a few things you need to understand before you start writing code.

Anywhere you see a link to documentation, use the WebFetch tool to follow those links. Be sure you have a deep understanding of those documents before you proceed.

# What is the purpose and goal?

First, this project is software that creates animations for two things: an array of addressable LED lights and a projector that will overlay the LED lights with 2D graphic animations.

When you are asked to create or edit something, the project that I am referring to and can be found in it folder's corresponding `project.tsx` file. It will have a name. The folder the project is in should match the name, but dasherized.

Each project has a collection of scenes — a scene should be thought of as a distinct set of animations that take place together. I will tell you if you need to create multiple scenes, but typically the request will be to make or update a single scene.

# How does the code work?

This project uses the open source library "Motion Canvas" — the complete documentation for this library is available here starting at docs/third-party/motion-canvas/intro.md

When you are trying to figure out how to implement a feature, search the documentation first to understand what is possible.

If you want to see what APIs are available, you can use the Typescript type definitions of this library. They are all available if you grep in `node_modules/@motion-canvas` and look for any `*.d.ts` file.

Beyond the third party documentation, this project has a few specific behaviors:

First, this project has a way to distinguish whether the animation applies to the LED lights or 2D graphics on the projector.

Given that, every scene should start with this snippet:

```
const { ledSystem, screen } = setupLEDScene(view);
```

The `ledSystem` is a reference to the `LEDSystem` class. This includes a number of helper methods to target different collections of lights.

Second, this project operates on a 16 x 6 grid with even spacing between. This means there are in total 96 LED lights. The origin of this grid is in the top left corner of the display and increasing X/Y values proceeds down and to the right. Knowing this, the helper methods on the LEDSystem class accepts positions which refer to the X/Y values on this grid. Some examples:

- `ledSystem().fillAt([1, 5], new Color('blue'))`: This would turn on the light in the second column and bottom row and make it blue
- `ledSystem().fillRow(2, new Color('red'))`: This would turn all lights on in the third row from the top and make them red

When not operating the LED lights and making animations for the projector, there are a couple of helpers for converting these positions into the raw coordinates on the screen. These can be found in `wall-coordinate-system.ts`.

- `positionToRect([3,2], 2, 2)`: This would generate the x, y, width and height that could be applied to a <Rect /> so that it fits into the grid system.
- `positionsToCoordinates`: this can be used to get a series of [x, y] tuples for use with a <Line />, that follows the grid system

If you are planning to animate the lights, then you will always use the `ledSystem()`. But, you can also create animations outside of the `ledSystem()` — you can add those directly to the provided `screen`.

For example, to add a line, you can do:

```
screen().add(
  <Line ... />
);
```

...and this would result in a line on the projector.

When you are making these animations, you should NOT rely on any time methods (like Date.now() or performance.now()) — these animations do not run in real time! Instead, you should use things like waitFor or use transition durations. In other words, use the motion canvas framework!

# Creating a New Project

When you create a new project, you should copy the folder and its contents `src/projects/template-project` and give the new folder a dasherized name. Then, update the name of hte project in `project.ts`.

This contains everything you need to bootstrap a new project; your job is to update the corresponding `scene.tsx` file.

# Examples

Please look through the other `scene.tsx` files if you would like to see some additional examples of how to use the library.
