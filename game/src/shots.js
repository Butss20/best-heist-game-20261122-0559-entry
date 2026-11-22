// shots.js — staged states for the entry's screenshots. Each shot is a
// real render of the game's own code: applyShot only moves the thief,
// guards and cameras, sets the alarm and loot, and picks the phase —
// nothing is drawn by hand, edited or composited.

import { ALARM } from './config.js';

function setGuard(S, i, x, y, angle, state) {
  const g = S.guards[i];
  if (!g) return;
  g.x = x;
  g.y = y;
  g.angle = angle;
  g.state = state || 'patrol';
  g.suspect = state === 'chase' ? 1 : 0;
  g.spotted = state === 'chase' || state === 'suspect';
}

function setCamera(S, i, angle, spotted, offT) {
  const c = S.cameras[i];
  if (!c) return;
  c.angle = angle;
  c.spotted = !!spotted;
  c.offT = offT || 0;
}

export function applyShot(S, kind) {
  S.time = 12.4; // fixed clock so every render of a shot is identical
  if (kind === 'cover') {
    // Mid-heist, everything in one frame: thief crossing the room, a guard
    // cone sweeping just past them, a camera cone, the Star glowing in its
    // vault, the alarm meter alive.
    S.phase = 'playing';
    S.thief = { x: 620, y: 300, angle: -Math.PI / 3, sneak: true };
    setGuard(S, 0, 500, 420, -Math.PI / 2, 'suspect');
    setGuard(S, 1, 1000, 350, Math.PI, 'patrol');
    setCamera(S, 0, Math.PI / 3, false, 0);
    setCamera(S, 1, (5 * Math.PI) / 4, false, 0);
    S.loot[1].taken = true; // Gold Laurel already lifted
    S.lootValue = 150;
    S.totalLoot = 150;
    S.alarm = 32;
    S.peakAlarm = 32;
    S.nerve = 70;
    S.elapsed = 24;
    S.score = 150 + Math.max(0, 75 - 24) * 5 + Math.round(100 - 32);
  } else if (kind === 'title') {
    S.phase = 'title';
    S.thief = { x: 330, y: 640, angle: -Math.PI / 2, sneak: false };
    setGuard(S, 0, 420, 480, 0, 'patrol');
    setGuard(S, 1, 1050, 300, Math.PI / 2, 'patrol');
    setCamera(S, 0, Math.PI / 4, false, 0);
    setCamera(S, 1, (5 * Math.PI) / 4, false, 0);
  } else if (kind === 'alarm') {
    // The alarm is nearly full, a guard is giving chase through smoke,
    // the Star is already in the thief's pocket.
    S.phase = 'playing';
    S.thief = { x: 700, y: 200, angle: -Math.PI / 2, sneak: false };
    setGuard(S, 0, 640, 265, -Math.PI / 3, 'chase');
    setGuard(S, 1, 1080, 480, Math.PI, 'patrol');
    setCamera(S, 0, Math.PI / 2.4, true, 0);
    setCamera(S, 1, (5 * Math.PI) / 4, false, 6);
    S.smoke = [{ x: 660, y: 240, r: 95, t: 4 }];
    S.loot[0].taken = true; // the Star
    S.loot[1].taken = true;
    S.starTaken = true;
    S.doorOpen = true;
    S.lootValue = 650;
    S.totalLoot = 650;
    S.alarm = 78;
    S.peakAlarm = 78;
    S.nerve = 40;
    S.elapsed = 41;
    S.score = 650 + Math.max(0, 75 - 41) * 5 + Math.round(100 - 78);
    void ALARM;
  } else if (kind === 'getaway') {
    // Level clear: the thief stands at the vent, the job done.
    S.phase = 'levelClear';
    S.thief = { x: 1170, y: 46, angle: -Math.PI / 2, sneak: false };
    setGuard(S, 0, 420, 480, 0, 'patrol');
    setGuard(S, 1, 1000, 500, Math.PI / 2, 'patrol');
    setCamera(S, 0, Math.PI / 3, false, 0);
    setCamera(S, 1, (5 * Math.PI) / 4, false, 0);
    for (const l of S.loot) l.taken = true;
    S.starTaken = true;
    S.doorOpen = true;
    S.lootValue = 900;
    S.totalLoot = 900;
    S.alarm = 12;
    S.peakAlarm = 64;
    S.elapsed = 58;
    S.levelScore = 900 + Math.max(0, 75 - 58) * 5 + Math.round(100 - 64);
  }
}
