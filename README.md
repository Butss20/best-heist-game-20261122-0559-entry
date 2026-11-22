# best-heist-game-20261122-0559

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Butss20/best-heist-game-20261122-0559-entry/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Butss20/best-heist-game-20261122-0559-entry/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**Midnight at the Marlowe** — a top-down stealth heist game in three acts. You are Wren, a cat burglar with one job a night: lift the Star of Marlowe from the gallery vault and slip out through the skylight vent, past patrolling guards with sweeping vision cones and wall cameras that never blink.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no network — the whole game is static files under `game/`.

## How to play

- **WASD / arrow keys** — move. **Shift** — sneak (slower, harder to spot).
- **1 / 2 / 3** — pick a tool, **Space** or click the HUD slot — use it.
  - **Smoke veil** (30 nerve): blocks every cone for 6 seconds.
  - **EMP pulse** (35 nerve): kills every camera for 8 seconds.
  - **Lockpick** (20 nerve): opens the vault door at once — or just stand at the door for 3 seconds to pick it by hand.
- **R** — restart the job. **P** — pause. **M** — mute.
- Grab the loot by walking over it. The **Star of Marlowe** unlocks the exit vent; side loot (Gold Laurel, Jade Scarab, Velvet Portrait, Ruby Tiara) adds score.
- The **alarm meter** rises while any guard or camera cone holds you, faster up close. At 100% the gallery locks down and the run ends. A guard that catches you up close ends it too.
- Score: loot value + a time bonus against par + a calm bonus for keeping the peak alarm low.

## The three jobs

1. **The Marlowe Gallery** — two guards, two cameras, one vault.
2. **The Vault Hall** — three guards, three cameras, a vault set into the floor.
3. **The Penthouse** — four guards, four cameras, and no second chances.

Each room offers several routes: slip behind the display cases, time the camera sweeps, or spend nerve on a tool and go loud through the middle.

## Files

- `game/index.html` — the page shell.
- `game/src/config.js` — every tuning number and the palette.
- `game/src/levels.js` — the three gallery layouts (walls, cover, patrols, cameras, loot).
- `game/src/input.js` — keyboard and mouse.
- `game/src/vision.js` — line of sight, vision cones, circle collision.
- `game/src/guards.js` — patrol, suspicion, chase, search, return.
- `game/src/cameras.js` — sweeping cameras and EMP shutdown.
- `game/src/audio.js` — synthesised WebAudio sounds (no audio files).
- `game/src/render.js` — all canvas drawing, HUD and overlays.
- `game/src/shots.js` — staged states for the screenshots (real renders of the game's own code).
- `game/src/main.js` — the loop, state machine, alarm, tools and scoring.
- `vendor/makefun-game.ts` — the kit's dossier builder, unchanged.
- `main.ts` — hands the game and screenshots in (Node 22).

---

<sub>Entered on [make.fun](https://make.fun/?ref=1q9chnpq&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
