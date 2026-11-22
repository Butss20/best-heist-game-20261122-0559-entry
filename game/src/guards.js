// guards.js — patrol, suspicion and chase. A guard walks its waypoint loop;
// when its cone holds the thief it gets suspicious, then gives chase;
// when it loses the thief it searches briefly, then returns to patrol.
// A chasing guard that touches the thief ends the run.

import { GUARD } from './config.js';
import { canSee, angleDiff } from './vision.js';

export function createGuards(defs) {
  return defs.map((d, i) => {
    const start = d.path[0];
    const next = d.path[1 % d.path.length];
    return {
      id: i,
      path: d.path,
      // Start part-way along the loop so patrols are staggered.
      seg: Math.floor(d.phase * d.path.length) % d.path.length,
      x: start[0],
      y: start[1],
      angle: Math.atan2(next[1] - start[1], next[0] - start[0]),
      state: 'patrol', // patrol | suspect | chase | search | return
      suspect: 0,
      chaseT: 0,
      searchT: 0,
      lastSeen: { x: start[0], y: start[1] },
      spotted: false, // currently holding the thief in its cone
    };
  });
}

function moveToward(g, tx, ty, speed, dt) {
  const dx = tx - g.x;
  const dy = ty - g.y;
  const d = Math.hypot(dx, dy);
  if (d < 1e-6) return true;
  const step = speed * dt;
  if (d <= step) {
    g.x = tx;
    g.y = ty;
    return true;
  }
  g.x += (dx / d) * step;
  g.y += (dy / d) * step;
  g.angle = Math.atan2(dy, dx);
  return false;
}

export function updateGuards(guards, thief, blockers, smoke, dt) {
  let anySpotted = false;
  for (const g of guards) {
    const eye = {
      x: g.x,
      y: g.y,
      angle: g.angle,
      range: GUARD.viewRange,
      halfAngle: GUARD.viewHalfAngle,
    };
    const see = canSee(eye, thief.x, thief.y, blockers, smoke, thief.sneak);
    g.spotted = see.seen;
    if (see.seen) {
      anySpotted = true;
      g.lastSeen = { x: thief.x, y: thief.y };
    }

    if (g.state === 'patrol') {
      const target = g.path[(g.seg + 1) % g.path.length];
      if (moveToward(g, target[0], target[1], GUARD.patrolSpeed, dt)) {
        g.seg = (g.seg + 1) % g.path.length;
      }
      if (see.seen) {
        g.suspect += dt;
        // Turn to face the thief while suspicious.
        g.angle += angleDiff(Math.atan2(thief.y - g.y, thief.x - g.x), g.angle) * Math.min(1, dt * 6);
        if (g.suspect >= GUARD.suspectTime) {
          g.state = 'chase';
          g.chaseT = GUARD.chaseTime;
        }
      } else {
        g.suspect = Math.max(0, g.suspect - dt * 2);
      }
    } else if (g.state === 'chase') {
      moveToward(g, thief.x, thief.y, GUARD.chaseSpeed, dt);
      if (see.seen) {
        g.chaseT = GUARD.chaseTime;
      } else {
        g.chaseT -= dt;
        if (g.chaseT <= 0) {
          g.state = 'search';
          g.searchT = GUARD.loseTime;
        }
      }
    } else if (g.state === 'search') {
      // Stand and scan around the last seen spot.
      g.angle += dt * 2.4;
      g.searchT -= dt;
      if (see.seen) {
        g.state = 'chase';
        g.chaseT = GUARD.chaseTime;
      } else if (g.searchT <= 0) {
        g.state = 'return';
      }
    } else if (g.state === 'return') {
      // Walk back to the nearest waypoint, then resume the loop.
      let best = 0;
      let bestD = Infinity;
      g.path.forEach((p, i) => {
        const d = (p[0] - g.x) ** 2 + (p[1] - g.y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      if (moveToward(g, g.path[best][0], g.path[best][1], GUARD.patrolSpeed, dt)) {
        g.seg = best;
        g.state = 'patrol';
        g.suspect = 0;
      }
      if (see.seen) {
        g.suspect += dt;
        if (g.suspect >= GUARD.suspectTime) {
          g.state = 'chase';
          g.chaseT = GUARD.chaseTime;
        }
      }
    }
  }
  return anySpotted;
}

// A chasing guard that reaches the thief catches them.
export function guardCaught(guards, thief) {
  for (const g of guards) {
    if (g.state === 'chase' && Math.hypot(g.x - thief.x, g.y - thief.y) < GUARD.radius + 13 + 2) {
      return g;
    }
  }
  return null;
}
