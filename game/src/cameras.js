// cameras.js — wall cameras that sweep their cone back and forth.
// An EMP pulse kills them for a while; otherwise they raise the alarm
// whenever their cone holds the thief.

import { CAMERA } from './config.js';
import { canSee } from './vision.js';

export function createCameras(defs) {
  return defs.map((d, i) => ({
    id: i,
    x: d.x,
    y: d.y,
    base: d.base,
    arc: d.arc,
    angle: d.base,
    sweep: 1,
    phase: i * 1.3,
    offT: 0, // seconds of EMP shutdown left
    spotted: false,
  }));
}

export function updateCameras(cameras, thief, blockers, smoke, dt, time) {
  let anySpotted = false;
  for (const c of cameras) {
    if (c.offT > 0) {
      c.offT -= dt;
      c.spotted = false;
      continue;
    }
    // Sweep: a sine around the base angle so the motion eases at the ends.
    c.angle = c.base + Math.sin(time * CAMERA.sweepSpeed + c.phase) * (c.arc / 2);
    const eye = {
      x: c.x,
      y: c.y,
      angle: c.angle,
      range: CAMERA.range,
      halfAngle: CAMERA.halfAngle,
    };
    const see = canSee(eye, thief.x, thief.y, blockers, smoke, thief.sneak);
    c.spotted = see.seen;
    if (see.seen) anySpotted = true;
  }
  return anySpotted;
}

export function empAll(cameras, seconds) {
  for (const c of cameras) c.offT = Math.max(c.offT, seconds);
}
