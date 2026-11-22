// config.js — every tuning number for Midnight at the Marlowe, in one place.
// Nothing here touches the DOM; render.js and main.js read these values.

export const VIEW_W = 1280;
export const VIEW_H = 800;
export const HUD_H = 64;

// The playfield is a fixed-size room drawn under the HUD.
export const ROOM = { x: 24, y: HUD_H + 16, w: 1232, h: 688 };

export const PLAYER = {
  radius: 13,
  walkSpeed: 205,
  sneakSpeed: 115,
  // A guard spots a sneaking thief at 62% of its normal range.
  sneakSpotFactor: 0.62,
};

export const GUARD = {
  radius: 14,
  patrolSpeed: 78,
  chaseSpeed: 168,
  viewRange: 250,
  viewHalfAngle: (38 * Math.PI) / 180,
  // Seconds of continuous sight before the guard gives chase.
  suspectTime: 0.55,
  chaseTime: 3.2,
  loseTime: 1.4,
};

export const CAMERA = {
  range: 265,
  halfAngle: (30 * Math.PI) / 180,
  sweepSpeed: 0.55, // radians per second
  sweepArc: (52 * Math.PI) / 180,
};

export const ALARM = {
  // Alarm points per second while any cone holds the thief.
  guardRate: 26,
  cameraRate: 20,
  closeBonus: 14, // extra when the spotter is within 90 px
  decay: 9, // points per second while unseen
  warnAt: 55, // HUD turns amber
  dangerAt: 80, // HUD turns red, heartbeat
};

export const TOOLS = {
  smoke: { cost: 30, key: '1', name: 'Smoke veil', blurb: 'Blocks all vision for 6 s' },
  emp: { cost: 35, key: '2', name: 'EMP pulse', blurb: 'Kills every camera for 8 s' },
  pick: { cost: 20, key: '3', name: 'Lockpick', blurb: 'Opens the vault door at once' },
};
export const NERVE_MAX = 100;
export const NERVE_REGEN = 4.5; // per second

export const VAULT_DOOR_CHANNEL = 3.0; // seconds standing at the door to open it

// Palette — a night gallery: deep teal floor, brass trim, amber guard cones,
// red camera cones, cyan loot glow. Safe cover reads dark, danger reads warm.
export const PALETTE = {
  floorA: '#1d2f33',
  floorB: '#18282c',
  floorLine: '#244046',
  wall: '#3a2f28',
  wallTop: '#5d4a38',
  wallEdge: '#8a6f4d',
  cover: '#2c3e46',
  coverTop: '#46606b',
  coverEdge: '#6b8a97',
  door: '#7a5a2e',
  doorGlow: '#e8b64c',
  exit: '#2f7d5b',
  exitGlow: '#57e6a9',
  loot: '#59e3ff',
  lootCore: '#d9fbff',
  guardBody: '#c65a3c',
  guardDark: '#8a3a26',
  coneGuard: 'rgba(232, 164, 60, 0.30)',
  coneGuardEdge: 'rgba(232, 164, 60, 0.55)',
  coneCamera: 'rgba(224, 62, 62, 0.28)',
  coneCameraEdge: 'rgba(224, 62, 62, 0.55)',
  coneAlert: 'rgba(255, 64, 64, 0.42)',
  thief: '#e8e4d8',
  thiefCoat: '#3b4a6b',
  smoke: 'rgba(190, 200, 205, 0.55)',
  hudBg: '#101a1d',
  hudLine: '#2c444b',
  text: '#e8e4d8',
  textDim: '#9db3b8',
  gold: '#e8b64c',
};
