// levels.js — the three heists. Every coordinate is room-local (the room is
// 1232 x 688). Walls and the closed vault door block movement and sight;
// cover blocks sight and movement but can be hidden behind; patrol paths
// are drawn in open lanes only, so guards never walk through furniture.

export const LEVELS = [
  {
    name: 'I — The Marlowe Gallery',
    intro: 'After closing, the Marlowe Gallery holds one prize worth the risk: the Star of Marlowe. Slip past the night guards, lift it from the vault, and leave through the skylight vent.',
    par: 75,
    start: { x: 330, y: 640 },
    exit: { x: 1140, y: 24, w: 64, h: 44 },
    walls: [
      { x: 400, y: 0, w: 24, h: 380 },
      { x: 800, y: 308, w: 24, h: 380 },
      // Vault enclosure (top centre): west, east and south walls.
      { x: 560, y: 0, w: 20, h: 180 },
      { x: 760, y: 0, w: 20, h: 180 },
      { x: 560, y: 164, w: 70, h: 16 },
      { x: 690, y: 164, w: 90, h: 16 },
      { x: 940, y: 330, w: 140, h: 24 },
    ],
    vaultDoor: { x: 630, y: 164, w: 60, h: 16 },
    cover: [
      { x: 120, y: 120, w: 90, h: 50, kind: 'case' },
      { x: 120, y: 320, w: 90, h: 50, kind: 'case' },
      { x: 560, y: 420, w: 120, h: 56, kind: 'case' },
      { x: 980, y: 210, w: 90, h: 50, kind: 'case' },
      { x: 980, y: 480, w: 90, h: 50, kind: 'case' },
      { x: 560, y: 560, w: 120, h: 56, kind: 'case' },
      { x: 300, y: 180, w: 70, h: 44, kind: 'statue' },
    ],
    guards: [
      { path: [[150, 480], [700, 480], [700, 380], [150, 380]], phase: 0 },
      { path: [[900, 150], [1150, 150], [1150, 600], [900, 600]], phase: 0.5 },
    ],
    cameras: [
      { x: 30, y: 30, base: Math.PI / 4, arc: (52 * Math.PI) / 180 },
      { x: 1202, y: 658, base: (5 * Math.PI) / 4, arc: (52 * Math.PI) / 180 },
    ],
    loot: [
      { x: 670, y: 90, value: 500, kind: 'star', name: 'Star of Marlowe' },
      { x: 165, y: 200, value: 150, kind: 'gold', name: 'Gold Laurel' },
      { x: 1025, y: 555, value: 150, kind: 'gem', name: 'Jade Scarab' },
      { x: 165, y: 400, value: 100, kind: 'art', name: 'Velvet Portrait' },
    ],
  },
  {
    name: 'II — The Vault Hall',
    intro: 'The hall below the gallery keeps the rest of the collection. Three guards, three cameras, and a vault set into the floor. Take the Star and walk out the roof door.',
    par: 90,
    start: { x: 350, y: 640 },
    exit: { x: 560, y: 24, w: 64, h: 44 },
    walls: [
      { x: 300, y: 200, w: 24, h: 488 },
      { x: 880, y: 0, w: 24, h: 488 },
      { x: 480, y: 120, w: 320, h: 24 },
      // Vault enclosure (bottom centre): west, east and north walls.
      { x: 520, y: 520, w: 20, h: 160 },
      { x: 700, y: 520, w: 20, h: 160 },
      { x: 520, y: 520, w: 70, h: 16 },
      { x: 650, y: 520, w: 70, h: 16 },
    ],
    vaultDoor: { x: 590, y: 520, w: 60, h: 16 },
    cover: [
      { x: 120, y: 100, w: 90, h: 50, kind: 'case' },
      { x: 120, y: 420, w: 90, h: 50, kind: 'case' },
      { x: 420, y: 180, w: 110, h: 52, kind: 'case' },
      { x: 700, y: 180, w: 100, h: 48, kind: 'statue' },
      { x: 1020, y: 300, w: 90, h: 50, kind: 'case' },
      { x: 1040, y: 560, w: 90, h: 50, kind: 'case' },
      { x: 420, y: 300, w: 80, h: 48, kind: 'statue' },
    ],
    guards: [
      { path: [[100, 150], [240, 150], [240, 600], [100, 600]], phase: 0 },
      { path: [[400, 100], [820, 100], [820, 420], [400, 420]], phase: 0.33 },
      { path: [[980, 120], [1160, 120], [1160, 620], [980, 620]], phase: 0.66 },
    ],
    cameras: [
      { x: 30, y: 30, base: Math.PI / 4, arc: (52 * Math.PI) / 180 },
      { x: 1202, y: 30, base: (3 * Math.PI) / 4, arc: (52 * Math.PI) / 180 },
      { x: 616, y: 658, base: (3 * Math.PI) / 2, arc: (52 * Math.PI) / 180 },
    ],
    loot: [
      { x: 620, y: 600, value: 500, kind: 'star', name: 'Star of Marlowe' },
      { x: 165, y: 175, value: 150, kind: 'gold', name: 'Gold Laurel' },
      { x: 1065, y: 375, value: 150, kind: 'gem', name: 'Jade Scarab' },
      { x: 165, y: 495, value: 100, kind: 'art', name: 'Velvet Portrait' },
      { x: 1085, y: 635, value: 150, kind: 'gem', name: 'Ruby Tiara' },
    ],
  },
  {
    name: 'III — The Penthouse',
    intro: 'The collector keeps the Star in the penthouse vault now, behind four guards and four cameras. One clean run. No second chances.',
    par: 110,
    start: { x: 420, y: 650 },
    exit: { x: 560, y: 24, w: 64, h: 44 },
    walls: [
      { x: 250, y: 0, w: 24, h: 300 },
      { x: 620, y: 388, w: 24, h: 300 },
      { x: 950, y: 0, w: 24, h: 300 },
      { x: 420, y: 340, w: 300, h: 24 },
      // Vault enclosure (top right): west and south walls.
      { x: 1000, y: 0, w: 20, h: 200 },
      { x: 1000, y: 184, w: 60, h: 16 },
      { x: 1120, y: 184, w: 60, h: 16 },
    ],
    vaultDoor: { x: 1060, y: 184, w: 60, h: 16 },
    cover: [
      { x: 100, y: 120, w: 90, h: 50, kind: 'case' },
      { x: 100, y: 480, w: 90, h: 50, kind: 'case' },
      { x: 330, y: 180, w: 100, h: 50, kind: 'case' },
      { x: 330, y: 520, w: 100, h: 50, kind: 'case' },
      { x: 700, y: 120, w: 100, h: 50, kind: 'case' },
      { x: 700, y: 520, w: 100, h: 50, kind: 'case' },
      { x: 480, y: 220, w: 80, h: 46, kind: 'statue' },
    ],
    guards: [
      { path: [[60, 350], [200, 350], [200, 620], [60, 620]], phase: 0 },
      { path: [[300, 80], [580, 80], [580, 300], [300, 300]], phase: 0.25 },
      { path: [[680, 400], [900, 400], [900, 640], [680, 640]], phase: 0.5 },
      { path: [[1000, 250], [1180, 250], [1180, 620], [1000, 620]], phase: 0.75 },
    ],
    cameras: [
      { x: 30, y: 30, base: Math.PI / 4, arc: (52 * Math.PI) / 180 },
      { x: 616, y: 658, base: (3 * Math.PI) / 2, arc: (52 * Math.PI) / 180 },
      { x: 1202, y: 658, base: (5 * Math.PI) / 4, arc: (52 * Math.PI) / 180 },
      { x: 1202, y: 30, base: (3 * Math.PI) / 4, arc: (52 * Math.PI) / 180 },
    ],
    loot: [
      { x: 1100, y: 100, value: 500, kind: 'star', name: 'Star of Marlowe' },
      { x: 145, y: 195, value: 150, kind: 'gold', name: 'Gold Laurel' },
      { x: 745, y: 195, value: 150, kind: 'gem', name: 'Jade Scarab' },
      { x: 145, y: 555, value: 100, kind: 'art', name: 'Velvet Portrait' },
      { x: 745, y: 595, value: 150, kind: 'gem', name: 'Ruby Tiara' },
    ],
  },
];
