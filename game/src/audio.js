// audio.js — all sound is synthesised with WebAudio, so the game ships
// no audio files. A soft synth pad hums under play; pickups chime, the
// alarm ticks faster as it rises, and the win/lose stings are short phrases.

export function createAudio() {
  let ctx = null;
  let muted = false;
  let padNodes = null;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain, when = 0, slideTo = null) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + when;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      if (muted) this.stopPad();
      return muted;
    },
    isMuted() {
      return muted;
    },
    startPad() {
      if (muted || padNodes) return;
      const c = ensure();
      if (!c) return;
      const osc = c.createOscillator();
      const osc2 = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = 55;
      osc2.type = 'sine';
      osc2.frequency.value = 55.7;
      g.gain.value = 0.035;
      osc.connect(g);
      osc2.connect(g);
      g.connect(c.destination);
      osc.start();
      osc2.start();
      padNodes = { osc, osc2, g };
    },
    stopPad() {
      if (!padNodes) return;
      try {
        padNodes.osc.stop();
        padNodes.osc2.stop();
      } catch (e) { /* already stopped */ }
      padNodes = null;
    },
    pickup() {
      tone(880, 0.16, 'sine', 0.16);
      tone(1318, 0.22, 'sine', 0.14, 0.07);
    },
    star() {
      tone(660, 0.14, 'triangle', 0.18);
      tone(880, 0.14, 'triangle', 0.18, 0.09);
      tone(1320, 0.3, 'triangle', 0.16, 0.18);
    },
    tick(alarm) {
      // Higher alarm, higher and louder tick.
      tone(1200 + alarm * 6, 0.05, 'square', 0.05 + alarm / 1400);
    },
    door() {
      tone(180, 0.18, 'sawtooth', 0.12, 0, 90);
      tone(520, 0.12, 'triangle', 0.12, 0.16);
    },
    tool() {
      tone(440, 0.1, 'sine', 0.14, 0, 660);
    },
    denied() {
      tone(160, 0.16, 'square', 0.1, 0, 110);
    },
    caught() {
      tone(392, 0.25, 'sawtooth', 0.16);
      tone(311, 0.25, 'sawtooth', 0.16, 0.22);
      tone(233, 0.6, 'sawtooth', 0.16, 0.44);
    },
    win() {
      const notes = [523, 659, 784, 1047];
      notes.forEach((n, i) => tone(n, 0.28, 'triangle', 0.16, i * 0.12));
    },
    click() {
      tone(700, 0.06, 'sine', 0.1);
    },
  };
}
