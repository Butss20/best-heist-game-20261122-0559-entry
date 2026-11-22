// render.js — every pixel of Midnight at the Marlowe. The room is drawn
// room-local and offset by ROOM; the HUD sits above it. Cones are drawn
// translucent so the floor shows through, and the alarm meter is the
// biggest HUD element because it is the game's heartbeat.

import { VIEW_W, VIEW_H, HUD_H, ROOM, PALETTE, ALARM, TOOLS } from './config.js';
import { GUARD, CAMERA } from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCone(ctx, x, y, angle, range, half, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawFloor(ctx, time) {
  const tile = 44;
  for (let ty = 0; ty < ROOM.h / tile; ty++) {
    for (let tx = 0; tx < ROOM.w / tile; tx++) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(ROOM.x + tx * tile, ROOM.y + ty * tile, tile, tile);
    }
  }
  ctx.strokeStyle = PALETTE.floorLine;
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= ROOM.w / tile; gx++) {
    ctx.beginPath();
    ctx.moveTo(ROOM.x + gx * tile, ROOM.y);
    ctx.lineTo(ROOM.x + gx * tile, ROOM.y + ROOM.h);
    ctx.stroke();
  }
  for (let gy = 0; gy <= ROOM.h / tile; gy++) {
    ctx.beginPath();
    ctx.moveTo(ROOM.x, ROOM.y + gy * tile);
    ctx.lineTo(ROOM.x + ROOM.w, ROOM.y + gy * tile);
    ctx.stroke();
  }
  // A worn red carpet runner down the middle of the hall.
  ctx.fillStyle = 'rgba(122, 44, 44, 0.35)';
  ctx.fillRect(ROOM.x + ROOM.w / 2 - 90, ROOM.y, 180, ROOM.h);
  ctx.strokeStyle = 'rgba(232, 182, 76, 0.4)';
  ctx.beginPath();
  ctx.moveTo(ROOM.x + ROOM.w / 2 - 90, ROOM.y);
  ctx.lineTo(ROOM.x + ROOM.w / 2 - 90, ROOM.y + ROOM.h);
  ctx.moveTo(ROOM.x + ROOM.w / 2 + 90, ROOM.y);
  ctx.lineTo(ROOM.x + ROOM.w / 2 + 90, ROOM.y + ROOM.h);
  ctx.stroke();
  void time;
}

function drawWalls(ctx, walls, vaultDoor, doorOpen, doorProgress) {
  for (const w of walls) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(ROOM.x + w.x + 3, ROOM.y + w.y + 4, w.w, w.h);
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(ROOM.x + w.x, ROOM.y + w.y, w.w, w.h);
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(ROOM.x + w.x, ROOM.y + w.y, w.w, 4);
    ctx.strokeStyle = PALETTE.wallEdge;
    ctx.lineWidth = 1;
    ctx.strokeRect(ROOM.x + w.x + 0.5, ROOM.y + w.y + 0.5, w.w, w.h);
  }
  // Room border.
  ctx.strokeStyle = PALETTE.wallEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(ROOM.x + 1.5, ROOM.y + 1.5, ROOM.w - 3, ROOM.h - 3);

  // Vault door: brass, with a keyhole; a progress ring while it is picked.
  const d = vaultDoor;
  const dx = ROOM.x + d.x;
  const dy = ROOM.y + d.y;
  if (!doorOpen) {
    ctx.fillStyle = PALETTE.door;
    ctx.fillRect(dx, dy, d.w, d.h);
    ctx.fillStyle = PALETTE.doorGlow;
    ctx.fillRect(dx + 4, dy + 2, d.w - 8, 3);
    ctx.beginPath();
    ctx.arc(dx + d.w / 2, dy + d.h / 2 + 1, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#241a10';
    ctx.fill();
    if (doorProgress > 0) {
      ctx.beginPath();
      ctx.arc(dx + d.w / 2, dy + d.h / 2, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * doorProgress);
      ctx.strokeStyle = PALETTE.doorGlow;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = 'rgba(232, 182, 76, 0.25)';
    ctx.fillRect(dx, dy, d.w, d.h);
  }
}

function drawCover(ctx, cover) {
  for (const c of cover) {
    const x = ROOM.x + c.x;
    const y = ROOM.y + c.y;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x + 3, y + 4, c.w, c.h);
    if (c.kind === 'case') {
      ctx.fillStyle = PALETTE.cover;
      rr(ctx, x, y, c.w, c.h, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(120, 190, 210, 0.28)';
      rr(ctx, x + 5, y + 5, c.w - 10, c.h - 10, 4);
      ctx.fill();
      ctx.strokeStyle = PALETTE.coverEdge;
      ctx.lineWidth = 2;
      rr(ctx, x, y, c.w, c.h, 6);
      ctx.stroke();
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + c.w / 2, y + 6);
      ctx.lineTo(x + c.w / 2, y + c.h - 6);
      ctx.stroke();
    } else {
      // Statue: plinth plus a marble figure.
      ctx.fillStyle = PALETTE.cover;
      rr(ctx, x, y + c.h - 14, c.w, 14, 3);
      ctx.fill();
      ctx.fillStyle = '#c9c2b2';
      ctx.beginPath();
      ctx.arc(x + c.w / 2, y + c.h / 2 - 4, Math.min(c.w, c.h) / 2 - 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8f887a';
      ctx.beginPath();
      ctx.arc(x + c.w / 2 - 5, y + c.h / 2 - 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawExit(ctx, exit, unlocked, time) {
  const x = ROOM.x + exit.x;
  const y = ROOM.y + exit.y;
  const pulse = 0.5 + 0.5 * Math.sin(time * 3);
  ctx.fillStyle = unlocked ? `rgba(87, 230, 169, ${0.25 + pulse * 0.25})` : 'rgba(90, 110, 100, 0.3)';
  rr(ctx, x, y, exit.w, exit.h, 8);
  ctx.fill();
  ctx.strokeStyle = unlocked ? PALETTE.exitGlow : '#5a6e64';
  ctx.lineWidth = 2;
  rr(ctx, x, y, exit.w, exit.h, 8);
  ctx.stroke();
  ctx.fillStyle = unlocked ? PALETTE.exitGlow : '#7d938a';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(unlocked ? 'EXIT ▲' : 'LOCKED', x + exit.w / 2, y + exit.h / 2);
}

function drawLoot(ctx, loot, time) {
  for (const l of loot) {
    if (l.taken) continue;
    const x = ROOM.x + l.x;
    const y = ROOM.y + l.y;
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.5 + l.x);
    // Halo.
    const g = ctx.createRadialGradient(x, y, 2, x, y, 34 + pulse * 10);
    g.addColorStop(0, 'rgba(89, 227, 255, 0.5)');
    g.addColorStop(1, 'rgba(89, 227, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(x, y);
    if (l.kind === 'star') {
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = PALETTE.loot;
      ctx.fillRect(-11, -11, 22, 22);
      ctx.fillStyle = PALETTE.lootCore;
      ctx.fillRect(-5, -5, 10, 10);
    } else if (l.kind === 'gold') {
      ctx.fillStyle = PALETTE.gold;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8a6a20';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.stroke();
    } else if (l.kind === 'gem') {
      ctx.fillStyle = '#3ddc84';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const px = Math.cos(a) * 11;
        const py = Math.sin(a) * 11;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      // art: a small gilt-framed portrait.
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(-12, -15, 24, 30);
      ctx.fillStyle = '#7a4a8a';
      ctx.fillRect(-9, -12, 18, 24);
      ctx.fillStyle = '#e8b64c';
      ctx.beginPath();
      ctx.arc(0, -3, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Sparkle.
    ctx.strokeStyle = `rgba(255,255,255,${0.4 + pulse * 0.5})`;
    ctx.lineWidth = 1.5;
    const s = 5 + pulse * 3;
    ctx.beginPath();
    ctx.moveTo(x - s - 8, y - 10);
    ctx.lineTo(x - 8, y - 10 - s);
    ctx.moveTo(x + 8, y + 12);
    ctx.lineTo(x + 8 + s, y + 12 + s);
    ctx.stroke();
    ctx.fillStyle = PALETTE.textDim;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(l.name, x, y + 30);
  }
}

function drawSmoke(ctx, smoke) {
  for (const s of smoke) {
    const g = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, s.r);
    g.addColorStop(0, PALETTE.smoke);
    g.addColorStop(1, 'rgba(190, 200, 205, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCones(ctx, guards, cameras) {
  for (const c of cameras) {
    if (c.offT > 0) continue;
    drawCone(
      ctx,
      ROOM.x + c.x,
      ROOM.y + c.y,
      c.angle,
      CAMERA.range,
      CAMERA.halfAngle,
      c.spotted ? PALETTE.coneAlert : PALETTE.coneCamera,
      PALETTE.coneCameraEdge,
    );
  }
  for (const g of guards) {
    const alert = g.state === 'chase' || g.state === 'suspect';
    drawCone(
      ctx,
      ROOM.x + g.x,
      ROOM.y + g.y,
      g.angle,
      GUARD.viewRange,
      GUARD.viewHalfAngle,
      g.spotted ? PALETTE.coneAlert : PALETTE.coneGuard,
      PALETTE.coneGuardEdge,
    );
    void alert;
  }
}

function drawCameras(ctx, cameras) {
  for (const c of cameras) {
    const x = ROOM.x + c.x;
    const y = ROOM.y + c.y;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(c.angle);
    ctx.fillStyle = c.offT > 0 ? '#4a5458' : '#22292c';
    rr(ctx, -4, -8, 22, 16, 4);
    ctx.fill();
    ctx.fillStyle = c.offT > 0 ? '#3a4448' : c.spotted ? '#ff4040' : '#ff7070';
    ctx.beginPath();
    ctx.arc(14, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Wall mount.
    ctx.fillStyle = '#39434a';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGuards(ctx, guards, time) {
  for (const g of guards) {
    const x = ROOM.x + g.x;
    const y = ROOM.y + g.y;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.guardBody;
    ctx.beginPath();
    ctx.arc(x, y, GUARD.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.guardDark;
    ctx.beginPath();
    ctx.arc(x, y, GUARD.radius - 5, 0, Math.PI * 2);
    ctx.fill();
    // Facing tick.
    ctx.strokeStyle = PALETTE.guardBody;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(g.angle) * 20, y + Math.sin(g.angle) * 20);
    ctx.stroke();
    if (g.state === 'chase' || g.spotted) {
      ctx.fillStyle = '#ff4040';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', x, y - 22 - Math.sin(time * 8) * 2);
    } else if (g.state === 'suspect' || g.state === 'search') {
      ctx.fillStyle = '#e8b64c';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', x, y - 22);
    }
  }
}

function drawThief(ctx, thief, time) {
  const x = ROOM.x + thief.x;
  const y = ROOM.y + thief.y;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(x, y + 10, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (thief.sneak) {
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(232, 228, 216, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 19, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = PALETTE.thiefCoat;
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.thief;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(thief.angle) * 18, y + Math.sin(thief.angle) * 18);
  ctx.stroke();
  void time;
}

function alarmColor(alarm) {
  if (alarm >= ALARM.dangerAt) return '#ff5040';
  if (alarm >= ALARM.warnAt) return '#e8a43c';
  return '#57e6a9';
}

function drawHud(ctx, s) {
  ctx.fillStyle = PALETTE.hudBg;
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = PALETTE.hudLine;
  ctx.fillRect(0, HUD_H - 2, VIEW_W, 2);

  // Left: level + objective.
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText(s.level.name, 16, 24);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(s.starTaken ? 'Star secured — reach the EXIT vent' : 'Steal the Star of Marlowe, then reach the EXIT vent', 16, 44);

  // Centre: alarm meter.
  const ax = 470;
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('ALARM', ax, 20);
  ctx.fillStyle = '#0a1214';
  rr(ctx, ax, 28, 260, 18, 5);
  ctx.fill();
  const w = Math.max(0, Math.min(1, s.alarm / 100)) * 260;
  if (w > 0) {
    ctx.fillStyle = alarmColor(s.alarm);
    rr(ctx, ax, 28, w, 18, 5);
    ctx.fill();
  }
  ctx.strokeStyle = PALETTE.hudLine;
  ctx.lineWidth = 1;
  rr(ctx, ax, 28, 260, 18, 5);
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(`${Math.round(s.alarm)}%`, ax + 268, 43);

  // Right: loot, nerve, tools, timer, score.
  let rx = 800;
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(`◆ $${s.lootValue}`, rx, 26);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(`TIME ${Math.floor(s.elapsed)}s   SCORE ${s.score}`, rx, 46);

  const tools = [
    { key: '1', name: 'Smoke', cost: TOOLS.smoke.cost, slot: { x: 1010, y: 10, w: 78, h: 44 } },
    { key: '2', name: 'EMP', cost: TOOLS.emp.cost, slot: { x: 1094, y: 10, w: 78, h: 44 } },
    { key: '3', name: 'Pick', cost: TOOLS.pick.cost, slot: { x: 1178, y: 10, w: 78, h: 44 } },
  ];
  for (const t of tools) {
    const afford = s.nerve >= t.cost;
    const sel = s.selectedTool === t.key;
    ctx.fillStyle = sel ? '#2c444b' : '#16242a';
    rr(ctx, t.slot.x, t.slot.y, t.slot.w, t.slot.h, 6);
    ctx.fill();
    ctx.strokeStyle = sel ? PALETTE.gold : PALETTE.hudLine;
    ctx.lineWidth = sel ? 2 : 1;
    rr(ctx, t.slot.x, t.slot.y, t.slot.w, t.slot.h, 6);
    ctx.stroke();
    ctx.fillStyle = afford ? PALETTE.text : '#5a7076';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${t.key} ${t.name}`, t.slot.x + t.slot.w / 2, t.slot.y + 18);
    ctx.fillStyle = PALETTE.textDim;
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(`${t.cost} nerve`, t.slot.x + t.slot.w / 2, t.slot.y + 34);
  }
  ctx.textAlign = 'left';

  // Nerve bar under the alarm.
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('NERVE', ax, 60);
  ctx.fillStyle = '#0a1214';
  rr(ctx, ax + 52, 50, 140, 9, 4);
  ctx.fill();
  ctx.fillStyle = '#59a7e3';
  rr(ctx, ax + 52, 50, Math.max(0, Math.min(1, s.nerve / 100)) * 140, 9, 4);
  ctx.fill();
}

function overlay(ctx, title, lines, accent, foot) {
  ctx.fillStyle = 'rgba(8, 14, 16, 0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.fillText(title, VIEW_W / 2, 240);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '17px system-ui, sans-serif';
  let y = 300;
  for (const line of lines) {
    ctx.fillText(line, VIEW_W / 2, y);
    y += 28;
  }
  if (foot) {
    ctx.fillStyle = PALETTE.gold;
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(foot, VIEW_W / 2, y + 30);
  }
  ctx.textAlign = 'left';
}

export function render(ctx, s) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#0c1416';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  drawFloor(ctx, s.time);
  drawExit(ctx, s.level.exit, s.starTaken, s.time);
  drawLoot(ctx, s.loot, s.time);
  drawCover(ctx, s.level.cover);
  drawWalls(ctx, s.level.walls, s.level.vaultDoor, s.doorOpen, s.doorProgress);
  drawSmoke(ctx, s.smoke);
  drawCones(ctx, s.guards, s.cameras);
  drawCameras(ctx, s.cameras);
  drawGuards(ctx, s.guards, s.time);
  drawThief(ctx, s.thief, s.time);
  drawHud(ctx, s);

  if (s.phase === 'title') {
    overlay(
      ctx,
      'MIDNIGHT AT THE MARLOWE',
      [
        'You are Wren, a cat burglar with one job tonight: lift the Star of Marlowe',
        'from the gallery vault and slip out through the skylight vent.',
        '',
        'WASD / arrows — move      Shift — sneak (harder to spot, slower)',
        '1 / 2 / 3 — pick a tool, Space or click — use it      R — restart      M — mute',
        'Smoke veils you · EMP kills the cameras · Lockpick opens the vault door at once',
        'Fill the ALARM meter and the gallery locks down. Get seen by a guard up close',
        'and it gives chase — if it touches you, the night is over.',
      ],
      PALETTE.gold,
      'Press ENTER to begin the first job',
    );
  } else if (s.phase === 'intro') {
    overlay(
      ctx,
      s.level.name,
      [s.level.intro, '', `Par time ${s.level.par}s — faster runs score more.`],
      PALETTE.gold,
      'Press ENTER to start',
    );
  } else if (s.phase === 'caught') {
    overlay(
      ctx,
      'CAUGHT!',
      [
        s.caughtReason,
        `Loot lifted this run: $${s.lootValue}`,
        `Score: ${s.score}`,
      ],
      '#ff5040',
      'Press R to try the job again',
    );
  } else if (s.phase === 'levelClear') {
    overlay(
      ctx,
      'CLEAN GETAWAY',
      [
        `Loot: $${s.lootValue}   Time: ${Math.floor(s.elapsed)}s   Peak alarm: ${Math.round(s.peakAlarm)}%`,
        `Level score: ${s.levelScore}`,
      ],
      PALETTE.exitGlow,
      s.levelIndex + 1 < 3 ? 'Press ENTER for the next job' : 'Press ENTER for the final tally',
    );
  } else if (s.phase === 'victory') {
    overlay(
      ctx,
      'THE STAR IS YOURS',
      [
        'Three galleries, three clean getaways. The Marlowe collection will',
        'miss its brightest piece — and no one ever saw your face.',
        '',
        `Total loot: $${s.totalLoot}   Total score: ${s.totalScore}`,
      ],
      PALETTE.gold,
      'Press R to run the whole night again',
    );
  } else if (s.phase === 'paused') {
    overlay(ctx, 'PAUSED', ['Take a breath. The guards are not going anywhere.'], PALETTE.textDim, 'Press P to resume');
  }

  // Door hint.
  if (s.phase === 'playing' && s.nearDoor && !s.doorOpen) {
    ctx.fillStyle = PALETTE.gold;
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Hold still at the vault door to pick it — or press 3 for the Lockpick', VIEW_W / 2, VIEW_H - 14);
    ctx.textAlign = 'left';
  }
}
