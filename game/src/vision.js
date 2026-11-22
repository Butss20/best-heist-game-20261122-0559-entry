// vision.js — geometry for "can this watcher see the thief?".
// A watcher sees the thief when the thief is inside its range and cone,
// the segment between them is not blocked by a wall, cover, or the closed
// vault door, and the thief is not inside a smoke cloud.

function segHitsRect(x1, y1, x2, y2, r) {
  // Slab test: does segment (x1,y1)-(x2,y2) cross rect r?
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  if (Math.abs(dx) < 1e-9) {
    if (x1 < r.x || x1 > r.x + r.w) return false;
  } else {
    let t1 = (r.x - x1) / dx;
    let t2 = (r.x + r.w - x1) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  if (Math.abs(dy) < 1e-9) {
    if (y1 < r.y || y1 > r.y + r.h) return false;
  } else {
    let t1 = (r.y - y1) / dy;
    let t2 = (r.y + r.h - y1) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

export function blockedBy(x1, y1, x2, y2, blockers) {
  for (const b of blockers) {
    if (segHitsRect(x1, y1, x2, y2, b)) return true;
  }
  return false;
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

// Full visibility test. `eye` is {x, y, angle, range, halfAngle}.
// `sneak` shrinks the effective range. Returns {seen, dist, close}.
export function canSee(eye, tx, ty, blockers, smoke, sneak) {
  const dx = tx - eye.x;
  const dy = ty - eye.y;
  const dist = Math.hypot(dx, dy);
  const range = sneak ? eye.range * 0.62 : eye.range;
  if (dist > range) return { seen: false, dist, close: false };
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, eye.angle)) > eye.halfAngle) {
    return { seen: false, dist, close: false };
  }
  if (blockedBy(eye.x, eye.y, tx, ty, blockers)) {
    return { seen: false, dist, close: false };
  }
  for (const s of smoke) {
    if (Math.hypot(tx - s.x, ty - s.y) < s.r) {
      return { seen: false, dist, close: false };
    }
  }
  return { seen: true, dist, close: dist < 90 };
}

// Circle-vs-rect collision: push the circle out of every rect it overlaps.
// Returns the corrected {x, y}.
export function collideCircle(x, y, r, rects) {
  for (const rect of rects) {
    const cx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
    const cy = Math.max(rect.y, Math.min(y, rect.y + rect.h));
    const dx = x - cx;
    const dy = y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < r * r) {
      if (d2 > 1e-9) {
        const d = Math.sqrt(d2);
        x = cx + (dx / d) * r;
        y = cy + (dy / d) * r;
      } else {
        // Centre inside the rect: push out along the smallest penetration.
        const pl = x - rect.x;
        const pr = rect.x + rect.w - x;
        const pt = y - rect.y;
        const pb = rect.y + rect.h - y;
        const m = Math.min(pl, pr, pt, pb);
        if (m === pl) x = rect.x - r;
        else if (m === pr) x = rect.x + rect.w + r;
        else if (m === pt) y = rect.y - r;
        else y = rect.y + rect.h + r;
      }
    }
  }
  return { x, y };
}
