// input.js — keyboard and mouse state. Movement is WASD or arrows,
// Shift sneaks, 1/2/3 pick a tool, Space uses it, R restarts, P pauses,
// M mutes. Clicking a HUD tool button also uses that tool.

export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set(); // edge-triggered keys, consumed each frame
  let mouse = { x: 0, y: 0, clicked: false };

  function code(e) {
    return e.code;
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (!keys.has(e.code)) pressed.add(e.code);
    keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse = {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height),
      clicked: true,
    };
  });

  return {
    // Held movement vector, normalised.
    move() {
      let x = 0;
      let y = 0;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
      if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
      if (x !== 0 && y !== 0) {
        const s = Math.SQRT1_2;
        x *= s;
        y *= s;
      }
      return { x, y };
    },
    sneak() {
      return keys.has('ShiftLeft') || keys.has('ShiftRight');
    },
    // True once, the frame the key went down.
    wasPressed(codeName) {
      return pressed.has(codeName);
    },
    takeClick() {
      const c = mouse.clicked ? { x: mouse.x, y: mouse.y } : null;
      mouse.clicked = false;
      return c;
    },
    endFrame() {
      pressed.clear();
    },
  };
}
