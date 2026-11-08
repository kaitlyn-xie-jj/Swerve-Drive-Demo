# Swerve Drive Demo

A browser-based, four-scene interactive introduction to **swerve-drive robot kinematics**. Explore how chassis translation and rotation determine each wheel's velocity, and why steering-angle optimization matters.

## Explore the scenes

1. **Pure Translation** — see how a robot translates without changing its heading.
2. **Pure Rotation** — examine wheel velocities while the chassis rotates.
3. **Combined Motion** — explore translation and rotation together, including coordinate-frame effects.
4. **Steering Optimization** — see how a wheel can reverse drive direction rather than turn through an unnecessarily large steering angle.

Use the **Previous** and **Next** buttons or the dots below the scene to navigate.

This is an educational visualization; it is not a ready-to-deploy robot controller.

## Run locally

**Requirements:** Node.js and npm.

```bash
npm install
npm run dev
```

Vite will print the local address (configured to use port 3000 unless that port is unavailable).

To build and preview the production bundle:

```bash
npm run build
npm run preview
```

**A Gemini API key is not needed.** This demo does not call Gemini or another model API. The old README and Vite configuration contained unused AI Studio key setup, which has been removed.

## Swerve kinematics

For a wheel at robot-frame position `(x, y)`, the demo uses the chassis velocity `(vx, vy)` and yaw rate `ω` to compute:

```text
wheel_vx = vx - ω * y
wheel_vy = vy + ω * x
wheel_speed = sqrt(wheel_vx² + wheel_vy²)
wheel_angle = atan2(wheel_vy, wheel_vx)
```

Robot-frame `+X` points forward, `+Y` points left, and positive `ω` is counter-clockwise. The steering optimization reverses wheel drive direction when that avoids a steering rotation greater than 90°.

See [`utils/kinematics.ts`](utils/kinematics.ts) for the formulas and [`scenes/`](scenes/) for the interactive demonstrations.

## Technology

React, TypeScript, and Vite. Originally prototyped in [Google AI Studio](https://ai.studio/apps/drive/1xjojifRQafzi_HocBK03kCjmPXhcN8Ua).
