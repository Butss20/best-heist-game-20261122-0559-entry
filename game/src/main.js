// main.js — the game loop and state machine for Midnight at the Marlowe.
// Phases: title -> intro -> playing -> levelClear -> intro ... -> victory,
// with caught and paused branching off playing. The loop owns the alarm
// meter, the tools, the vault door, loot pickup and scoring; guards.js and
// cameras.js own their own updates.

import { VIEW_W, VIEW_H, ROOM, PLAYER, ALARM, TOOLS, NERVE_MAX, NERVE_REGEN, VAULT_DOOR_CHANNEL } from './config.js';
import { LEVELS } from './levels.js';
import { createInput } from './input.js';
import { createGuards, updateGuards, guardCaught } from './guards.js';
import { createCameras, updateCameras, empAll } from './cameras.js';
import { createAudio } from './audio.js';
import { render } from './render.js';
import { collideCircle } from './vision.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const audio = createAudio();

const S = {
  phase: 'title', // title | intro | playing | paused | caught | levelClear | victory
  levelIndex: 0,
  level: LEVELS[0],
  thief: { x: 70, y: 630, angle: -Math.PI / 2, sneak: false },
  guards: [],
  cameras: [],
  loot: [],
  smoke: [],
  alarm: 0,
  peakAlarm: 0,
  nerve: NERVE_MAX,
  selectedTool: '1',
  doorOpen: false,
  doorProgress: 0,
  nearDoor: false,
  elapsed: 0,
  time: 0,
  score: 0,
  lootValue: 0,
  starTaken: false,
  levelScore: 0,
  totalScore: 0,
  totalLoot: 0,
  caughtReason: '',
  frozen: false, // screenshot staging: render a fixed frame, never advance
  tickT: 0,
};

function blockers() {
  const list = [...S.level.walls, ...S.level.cover];
  if (!S.doorOpen) list.push(S.level.vaultDoor);
  return list;
}

function loadLevel(i) {
  S.levelIndex = i;
  S.level = LEVELS[i];
  S.thief = { x: S.level.start.x, y: S.level.start.y, angle: -Math.PI / 2, sneak: false };
  S.guards = createGuards(S.level.guards);
  S.cameras = createCameras(S.level.cameras);
  S.loot = S.level.loot.map((l) => ({ ...l, taken: false }));
  S.smoke = [];
  S.alarm = 0;
  S.peakAlarm = 0;
  S.nerve = NERVE_MAX;
  S.doorOpen = false;
  S.doorProgress = 0;
  S.nearDoor = false;
  S.elapsed = 0;
  S.lootValue = 0;
  S.starTaken = false;
  S.levelScore = 0;
  S.score = S.totalScore;
}

function resetRun() {
  S.totalScore = 0;
  S.totalLoot = 0;
  loadLevel(0);
}

function liveScore() {
  const timeBonus = Math.max(0, S.level.par - Math.floor(S.elapsed)) * 5;
  const calmBonus = Math.round(100 - S.peakAlarm);
  return S.totalScore + S.lootValue + timeBonus + calmBonus;
}

function useTool() {
  const key = S.selectedTool;
  const tool = key === '1' ? TOOLS.smoke : key === '2' ? TOOLS.emp : TOOLS.pick;
  if (S.nerve < tool.cost) {
    audio.denied();
    return;
  }
  if (key === '3') {
    if (!S.nearDoor || S.doorOpen) {
      audio.denied();
      return;
    }
    S.nerve -= tool.cost;
    S.doorOpen = true;
    S.doorProgress = 1;
    audio.door();
    return;
  }
  S.nerve -= tool.cost;
  if (key === '1') {
    S.smoke.push({ x: S.thief.x, y: S.thief.y, r: 95, t: 6 });
  } else {
    empAll(S.cameras, 8);
  }
  audio.tool();
}

function toolSlotAt(x, y) {
  // HUD tool slots, in canvas pixels (see render.js).
  const slots = [
    { key: '1', x: 1010, y: 10, w: 78, h: 44 },
    { key: '2', x: 1094, y: 10, w: 78, h: 44 },
    { key: '3', x: 1178, y: 10, w: 78, h: 44 },
  ];
  for (const s of slots) {
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return s.key;
  }
  return null;
}

function update(dt) {
  S.time += dt;

  if (S.phase === 'playing') {
    S.elapsed += dt;

    // Movement.
    const mv = input.move();
    const sneak = input.sneak();
    S.thief.sneak = sneak;
    const speed = sneak ? PLAYER.walkSpeed * 0.56 : PLAYER.walkSpeed;
    if (mv.x !== 0 || mv.y !== 0) {
      S.thief.angle = Math.atan2(mv.y, mv.x);
      let nx = S.thief.x + mv.x * speed * dt;
      let ny = S.thief.y + mv.y * speed * dt;
      nx = Math.max(ROOM.x + PLAYER.radius, Math.min(ROOM.x + ROOM.w - PLAYER.radius, nx));
      ny = Math.max(ROOM.y + PLAYER.radius, Math.min(ROOM.y + ROOM.h - PLAYER.radius, ny));
      const hit = collideCircle(nx, ny, PLAYER.radius, blockers());
      // Axis-separated fallback: try X alone, then Y alone.
      if (hit.x === nx && hit.y === ny) {
        S.thief.x = nx;
        S.thief.y = ny;
      } else {
        const hx = collideCircle(nx, S.thief.y, PLAYER.radius, blockers());
        if (hx.x === nx && hx.y === S.thief.y) S.thief.x = nx;
        const hy = collideCircle(S.thief.x, ny, PLAYER.radius, blockers());
        if (hy.x === S.thief.x && hy.y === ny) S.thief.y = ny;
      }
    }

    // Tool selection and use.
    if (input.wasPressed('Digit1')) S.selectedTool = '1';
    if (input.wasPressed('Digit2')) S.selectedTool = '2';
    if (input.wasPressed('Digit3')) S.selectedTool = '3';
    if (input.wasPressed('Space')) useTool();
    const click = input.takeClick();
    if (click) {
      const slot = toolSlotAt(click.x, click.y);
      if (slot) {
        S.selectedTool = slot;
        useTool();
      }
    }

    // Vault door: channel to pick, or hold still near it.
    const door = S.level.vaultDoor;
    const dcx = door.x + door.w / 2;
    const dcy = door.y + door.h / 2;
    S.nearDoor = Math.hypot(S.thief.x - dcx, S.thief.y - dcy) < 64;
    if (S.nearDoor && !S.doorOpen) {
      S.doorProgress += dt / VAULT_DOOR_CHANNEL;
      if (S.doorProgress >= 1) {
        S.doorOpen = true;
        audio.door();
      }
    } else if (!S.doorOpen) {
      S.doorProgress = Math.max(0, S.doorProgress - dt / 2);
    }

    // Loot pickup.
    for (const l of S.loot) {
      if (!l.taken && Math.hypot(S.thief.x - l.x, S.thief.y - l.y) < 28) {
        l.taken = true;
        S.lootValue += l.value;
        S.totalLoot += l.value;
        if (l.kind === 'star') {
          S.starTaken = true;
          audio.star();
        } else {
          audio.pickup();
        }
      }
    }

    // Watchers.
    const bl = blockers();
    const guardSeen = updateGuards(S.guards, S.thief, bl, S.smoke, dt);
    const cameraSeen = updateCameras(S.cameras, S.thief, bl, S.smoke, dt, S.time);

    // Alarm.
    let rate = 0;
    if (guardSeen) rate += ALARM.guardRate;
    if (cameraSeen) rate += ALARM.cameraRate;
    if (rate > 0) {
      const close =
        S.guards.some((g) => g.spotted && Math.hypot(g.x - S.thief.x, g.y - S.thief.y) < 90) ||
        S.cameras.some((c) => c.spotted && Math.hypot(c.x - S.thief.x, c.y - S.thief.y) < 90);
      if (close) rate += ALARM.closeBonus;
      S.alarm = Math.min(100, S.alarm + rate * dt);
    } else {
      S.alarm = Math.max(0, S.alarm - ALARM.decay * dt);
    }
    S.peakAlarm = Math.max(S.peakAlarm, S.alarm);
    if (S.alarm >= ALARM.warnAt) {
      S.tickT -= dt;
      if (S.tickT <= 0) {
        audio.tick(S.alarm);
        S.tickT = S.alarm >= ALARM.dangerAt ? 0.35 : 0.6;
      }
    }

    // Smoke decays.
    for (const s of S.smoke) s.t -= dt;
    S.smoke = S.smoke.filter((s) => s.t > 0);

    // Nerve regenerates.
    S.nerve = Math.min(NERVE_MAX, S.nerve + NERVE_REGEN * dt);

    S.score = liveScore();

    // Caught?
    const caughtBy = guardCaught(S.guards, S.thief);
    if (caughtBy) {
      S.phase = 'caught';
      S.caughtReason = 'A guard laid hands on you in the dark.';
      audio.caught();
      audio.stopPad();
    } else if (S.alarm >= 100) {
      S.phase = 'caught';
      S.caughtReason = 'The alarm hit 100% — the gallery locked down around you.';
      audio.caught();
      audio.stopPad();
    }

    // Exit: only open once the Star is lifted.
    if (S.phase === 'playing' && S.starTaken) {
      const e = S.level.exit;
      if (
        S.thief.x > e.x - 6 && S.thief.x < e.x + e.w + 6 &&
        S.thief.y > e.y - 6 && S.thief.y < e.y + e.h + 6
      ) {
        S.levelScore = liveScore();
        S.totalScore = S.levelScore;
        S.phase = 'levelClear';
        audio.win();
        audio.stopPad();
      }
    }

    if (input.wasPressed('KeyP')) {
      S.phase = 'paused';
    }
    if (input.wasPressed('KeyR')) {
      loadLevel(S.levelIndex);
      S.phase = 'intro';
    }
    if (input.wasPressed('KeyM')) audio.toggleMute();
  } else if (S.phase === 'title') {
    if (input.wasPressed('Enter')) {
      audio.unlock();
      audio.startPad();
      audio.click();
      S.phase = 'intro';
    }
  } else if (S.phase === 'intro') {
    if (input.wasPressed('Enter')) {
      audio.click();
      S.phase = 'playing';
    }
  } else if (S.phase === 'paused') {
    if (input.wasPressed('KeyP') || input.wasPressed('Enter')) S.phase = 'playing';
    if (input.wasPressed('KeyM')) audio.toggleMute();
  } else if (S.phase === 'caught') {
    if (input.wasPressed('KeyR') || input.wasPressed('Enter')) {
      loadLevel(S.levelIndex);
      S.phase = 'intro';
    }
  } else if (S.phase === 'levelClear') {
    if (input.wasPressed('Enter')) {
      audio.click();
      if (S.levelIndex + 1 < LEVELS.length) {
        loadLevel(S.levelIndex + 1);
        S.phase = 'intro';
      } else {
        S.phase = 'victory';
      }
    }
  } else if (S.phase === 'victory') {
    if (input.wasPressed('KeyR')) {
      resetRun();
      S.phase = 'intro';
    }
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!S.frozen) update(dt);
  render(ctx, S);
  input.endFrame();
  requestAnimationFrame(loop);
}

// Screenshot staging: ?shot=cover|title|alarm|getaway renders one fixed
// frame of the real game — no edits, no composites.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  resetRun();
  applyShot(S, shot);
  S.frozen = true;
  render(ctx, S);
  window.__marlowe = S;
} else {
  resetRun();
  window.__marlowe = S;
  requestAnimationFrame(loop);
}
