# Hyperblast Shooter — Design Specification

Status: Phase 1 baseline
Target: browser desktop, keyboard/gamepad first
Genre: vertically scrolling cyberpunk arcade shoot-em-up
Runtime: `@arcade/runtime` local development package, target API level aligned with the 1.13 release train
Renderer: PixiJS 8

## 1. Product vision

Hyperblast Shooter is a compact five-stage arcade campaign built around readable bullet pressure, aggressive scoring, and short deterministic runs. The presentation mixes crisp pixel-art silhouettes with neon wireframe geometry, deep-space parallax, and restrained cyberpunk UI. The game must remain legible at high bullet density: enemy shots use shape and luminance contrast that cannot be confused with player fire, pickups, or scenery.

The release target is a complete single-player arcade loop rather than a content sandbox. A normal clear should take roughly 25–35 minutes; expert play should reward route mastery, grazing, chaining, and bomb restraint without making survival-only play invalid.

### Design pillars

1. **Immediate movement feel** — eight-directional movement, low input latency, explicit focus/slow mode, tiny visible hitbox while focused.
2. **Deterministic combat** — fixed-step simulation, seeded authored patterns, replayable stage scripts, no gameplay use of wall-clock time or `Math.random()`.
3. **Readable danger** — modest danmaku rather than screen-filling noise; every pattern has lanes, rhythm, or a recoverable safe region.
4. **Score through proximity** — grazing and chain kills reward controlled risk while bombs and deaths reset momentum.
5. **Short authored campaign** — five distinct stages, each with a mid-boss beat and a multi-phase stage boss.

## 2. Core loop

```text
title / settings
      |
      v
weapon select -> stage briefing -> scrolling combat section
                                  |        |
                                  |        +-> enemies -> bullets -> pickups
                                  |                    |
                                  |                    +-> score / combo / rank
                                  v
                               mid-boss
                                  |
                                  v
                         second combat section
                                  |
                                  v
                              stage boss
                                  |
                    +-------------+-------------+
                    |                           |
                  clear                       death
                    |                           |
                    v                           v
            stage result/fanfare       respawn or continue
                    |
                    v
             next briefing / ending
```

The playfield scrolls vertically while the player ship occupies the lower ~70% of the viewport. Enemy waves enter from authored spawn anchors and follow deterministic paths. Destroyed enemies can drop weapon energy, bombs, shields, speed upgrades, or score items. A stage ends only after the boss death sequence and post-boss cleanup are complete.

## 3. Simulation and timing

- Simulation rate: **60 Hz**, fixed step (`1 / 60` seconds).
- Rendering interpolates from simulation state through the runtime Pixi host composition.
- All game timers are integer ticks or deterministic cooldown resources.
- Stage scripts use stage-local tick offsets rather than browser timestamps.
- RNG is a seeded runtime-compatible generator scoped to a run. Pattern seeds derive from `(runSeed, stageId, waveId, emitterId)` so reordering unrelated systems does not perturb authored patterns.
- Slow motion on a boss kill is presentation-only where practical. Simulation-authoritative effects use an explicit deterministic time-scale state.

## 4. Player ship

### 4.1 Movement

- Eight-directional digital movement with normalized diagonal velocity.
- Default speed: 300 design pixels/second.
- Focus mode: held with `Shift`/mapped action; speed reduces to ~45% and displays the core hitbox.
- Movement is clamped to the safe playfield after velocity integration.
- Short spawn invincibility after death prevents unavoidable chain deaths.

### 4.2 Collision geometry

- Ship artwork footprint: roughly 32×32 logical pixels.
- Damage hitbox: circular/compact AABB equivalent around the cockpit, approximately 6×6 logical pixels.
- Graze region: expanded radius around the hitbox, approximately 24×24 logical pixels.
- A hostile projectile can award graze once per player crossing unless explicitly marked multi-graze.
- Focus mode makes the damage hitbox visible but does not change its size.

### 4.3 Weapons

The player selects a starting weapon, and compatible power-ups raise that weapon through three power levels.

| Weapon | Role | Focus behavior | Power progression |
| --- | --- | --- | --- |
| Spread | forgiving wave clear | narrows cone | 3 → 5 → 7 pellets, then higher damage |
| Laser | concentrated boss DPS | longer/thicker beam | width and damage increase; pierces light enemies |
| Homing | route safety / cleanup | tighter forward primary shot | additional missiles and faster turn rate |

Weapon switching during a run is allowed through weapon pickups; switching does not discard earned generic power, but each weapon clamps to its own maximum level.

### 4.4 Bombs

- Start each life with up to 3 bombs; campaign starts with 3 stocked bombs total.
- Bomb grants a short invulnerability window, cancels cancellable hostile bullets, and deals screen-wide damage.
- Bomb use breaks the current kill chain and lowers dynamic rank modestly.
- A bomb triggered during the small post-hit grace window may be supported as an advanced “deathbomb” mechanic if it remains deterministic and accessible.

### 4.5 Lives and continues

- 3 starting lives.
- On hit: lose one life, reset combo, reduce weapon power by one tier (never below base), clear nearby hostile bullets, respawn with invincibility.
- A run ends at zero remaining lives unless a continue is available.
- Default release mode offers limited continues (target: 2). Continued runs are clearly marked on results/high-score records.

## 5. Scoring

### 5.1 Score formula

Per kill:

```text
killScore = floor(baseValue × comboMultiplier × grazeMultiplier × rankValueFactor)
```

- `baseValue`: enemy-authored integer score value.
- `comboMultiplier`: starts at 1.0× and rises with rapid consecutive kills, capped at 8.0×.
- `grazeMultiplier`: run-local pressure bonus derived from recent graze meter, target 1.0×–2.0×.
- `rankValueFactor`: small reward for surviving at high rank, target 1.0×–1.25×; rank must never dominate the score formula.

### 5.2 Kill chain

- Each qualifying kill refreshes a chain timer (~2 seconds baseline).
- Chain count increases the combo multiplier in authored thresholds.
- Letting the timer expire decays multiplier gradually instead of instantly dropping to 1×.
- Death, continue, or bomb breaks the active chain.
- Simultaneous kills within one simulation tick are ordered by stable entity ID to avoid nondeterministic score differences.

### 5.3 Graze bonus

- First graze of a hostile projectile gives immediate points and fills a short-lived graze meter.
- Consecutive grazes without being hit increase a graze streak.
- Bullet cancellation from bombs does not count as graze.
- Boss patterns expose safe but narrow graze routes for expert scoring.

### 5.4 Stage result bonus

Each stage result records:

- enemy destruction ratio,
- max combo,
- graze count,
- lives lost,
- bombs used,
- boss phase clear times,
- stage score,
- resulting letter grade (`D` through `S`).

## 6. Enemy catalog

### 6.1 Grunt

- Low health, authored spline/path movement.
- Single aimed shot or short fan.
- Used in mirrored pairs and staggered formations.

### 6.2 Formation unit

- Same lightweight actor model as grunts but controlled by a formation coordinator.
- Supported arrangements: V, horizontal wave, sinusoidal wave, rotating/spiral entry.
- Formation break behavior is explicit per wave: preserve slots, dissolve to individual paths, or retreat.

### 6.3 Turret

- Stationary relative to stage terrain or slowly scrolling carrier/platform.
- Patterns: aimed burst, symmetric spread, radial ring.
- Barrel orientation is presentation state derived from deterministic aim state.

### 6.4 Chaser

- Accelerates toward a bounded prediction of player position.
- Limited turn rate prevents unavoidable homing.
- May convert to a kamikaze charge after a telegraphed wind-up.

### 6.5 Shield unit

- Projects a directional or radial barrier around nearby enemies.
- The shield has its own resource pool and collision target.
- Focused laser damage is especially effective, encouraging weapon-role expression without making other weapons invalid.

### 6.6 Mid-boss

- 2–3 compact phases, 20–40 seconds target duration.
- Introduces the stage boss’s pattern grammar in a simpler form.
- Timeout escapes are allowed but forfeit a large score bonus/drop.

## 7. Bullet patterns

Patterns are data-authored emitters evaluated on fixed ticks.

Required release patterns:

- **Aimed** — one or more projectiles centered on player angle at emission tick.
- **Spread** — symmetric fan with authored count and angular spacing.
- **Ring** — radial burst with deterministic phase offset.
- **Spiral** — repeated radial/fan emission with phase rotation per interval.
- **Random spread** — seeded bounded angular/speed jitter; never calls ambient randomness.

Pattern parameters include warm-up, cadence, salvo count, projectile speed, acceleration, lifetime, angle offset, angular velocity, rank scaling limits, and cancellation behavior.

## 8. Boss framework

Every stage boss has:

- a visible health/phase HUD,
- at least 3 phases,
- deterministic health gates,
- a short transition state that clears or transforms bullets safely,
- escalating authored patterns,
- timeout policy per phase,
- destruction sequence with input-safe slow motion and screen shake.

Boss phase transitions occur on the simulation tick after a gate is crossed; damage cannot skip transition bookkeeping even if a single hit exceeds remaining phase health.

## 9. Five-stage campaign

### Stage 1 — Neon Drift Expanse

- **Visual:** deep space, sparse cyan wireframe grid, asteroid field, wrecked relay debris.
- **Teaching goal:** basic aimed shots, V formations, first graze corridors.
- **Mid-boss:** Relay Scorpion — turret arms, slow radial rings.
- **Boss:** **Vector Warden** — three-segment interceptor carrier; aimed fans → rotating rings → crossing asteroid-laser lanes.

### Stage 2 — Orbital Furnace

- **Visual:** orbital station exterior, docking arms, solar panels, maintenance rails, orange reactor glow.
- **Teaching goal:** stationary turret priority and destructible shields.
- **Mid-boss:** Dockmaster Array — rotating gun ring on a scrolling station segment.
- **Boss:** **Helix Foundry** — modular station weapon; armor shutters → mirrored spreads → reactor-core spiral.

### Stage 3 — Chrome Meridian

- **Visual:** neon megacity flyover, holographic signage, rooftop traffic, magenta/cyan rain streaks.
- **Teaching goal:** faster wave routing, chasers, dense but low-speed city crossfire.
- **Mid-boss:** Skyline Pursuer — agile hunter with telegraphed charges.
- **Boss:** **Municipal Ghost** — stealth police-drone lattice; decoy sweeps → aimed laser cages → collapsing polygon barrage.

### Stage 4 — Verdant Hive

- **Visual:** alien hive interior, bio-circuit ribs, toxic green/violet light, moving membranes.
- **Teaching goal:** curved/accelerating bullets and formation shields.
- **Mid-boss:** Brood Lens — shielded organism with petal emitters.
- **Boss:** **Queen Recursor** — multi-segment hive entity; petal rings → DNA spirals → shield-node survival phase.

### Stage 5 — Hyperglass Corridor

- **Visual:** hyperspace tunnel, white/cyan wireframe vanishing point, fractured reality panels, stage motifs flashing as ghosts.
- **Teaching goal:** mastery remix at high but bounded density.
- **Mid-boss:** Echo Composite — condensed callbacks to prior mid-boss grammars.
- **Boss:** **The Hyperblast Engine** — final core with five motif phases and a final survival/destruction phase.

## 10. Dynamic difficulty rank

Rank is deterministic simulation state, not hidden wall-clock telemetry.

### 10.1 Range and inputs

- Integer range: `0..1000`.
- Start target: 250 on Normal.
- Rank rises from: survival ticks, power level, sustained combo, graze streak, extra lives.
- Rank falls from: life loss (large), bomb use (small), continue (large reset), prolonged low-power recovery.

### 10.2 Effects

Rank may scale only within authored clamps:

- bullet count/density,
- projectile speed (small range),
- enemy fire cadence,
- chaser aggression/turn rate,
- optional boss pattern variant selection.

Rank must **not** alter collision geometry, player speed, or core boss health unpredictably. Every stage remains clearable at maximum rank using intended safe routes.

### 10.3 Difficulty presets

Difficulty presets change initial rank, rank gain coefficients, and pattern clamps rather than maintaining separate code paths.

| Mode | Initial rank | Density clamp | Use |
| --- | ---: | ---: | --- |
| Novice | 100 | ~70% Normal | onboarding/accessibility |
| Normal | 250 | baseline | default campaign |
| Expert | 500 | ~125% Normal | score/challenge |

## 11. Power-ups and progression

Pickup categories:

- weapon power,
- weapon type swap,
- speed-up (bounded; never makes focus unusable),
- shield charge,
- bomb stock,
- score multiplier/data shard,
- rare life fragment / extend threshold.

Power-ups are transient to the run. Persistent storage contains settings and high scores/results, not permanent combat stat advantages.

## 12. Camera and presentation effects

- Base camera is fixed to the vertical playfield.
- Screen shake uses bounded deterministic trauma impulses and decays quickly.
- Shake is disabled/reduced under reduced-motion preference.
- Boss death uses brief time-scale reduction, palette flash, layered explosion sprites, and final shockwave.
- Camera effects never move collision coordinates; renderer applies camera transform after simulation.

## 13. Background/parallax

Every stage defines at least three parallax strata:

```text
far    factor ~0.15  stars / skyline / tunnel depth
mid    factor ~0.45  asteroids / station / buildings / hive ribs
near   factor ~0.85  debris / rails / signs / membranes
```

Background layers are pooled/tiled and recycled instead of continuously allocating sprites. Decorative objects never participate in gameplay collision.

## 14. Audio

### Direction

Procedural synth/chip-tune with cyberpunk percussion, pulse bass, arpeggiated leads, and stage-specific timbres. Audio is event-driven through `@arcade/runtime/audio` and Web Audio; gameplay state must not depend on audio clock drift.

### Stage palette

- Stage 1: sparse FM bells + square bass.
- Stage 2: industrial noise percussion + pulse-width lead.
- Stage 3: syncopated electro beat + bright arpeggios.
- Stage 4: detuned organic pads + irregular sequencer.
- Stage 5: high-tempo motif recombination + hyperspace noise beds.

Bosses introduce a higher-intensity stem without restarting the entire track. Sound buses: `music`, `sfx`, `ui`; expose independent volume controls and mute.

## 15. Visual language

### Palette

Core presentation colors:

- void: `#050611`
- deep navy: `#0B1230`
- neon cyan: `#00E5FF`
- electric blue: `#3877FF`
- hot magenta: `#FF2BD6`
- ultraviolet: `#8A4DFF`
- toxic green: `#62FF8B`
- reactor orange: `#FF8A3D`
- danger red: `#FF3B58`
- UI white: `#EAF8FF`

Player bullets favor cyan/white; hostile bullets favor magenta/orange/red and distinct silhouettes. Green is reserved mainly for pickups/shields/hive scenery and must not create pickup/bullet ambiguity.

### Sprite direction

- Pixel-art silhouettes with controlled 1–2 px highlights at logical resolution.
- Wireframe/glow is a renderer/VFX layer, not baked indiscriminately into every sprite.
- Nearest-neighbor scaling for pixel assets.
- Alpha-transparent sprite sheets; no baked checkerboards or opaque backgrounds.

## 16. HUD and menus

HUD shows:

- score and high score,
- lives,
- bombs,
- selected weapon + power level,
- combo multiplier and chain timer feedback,
- graze meter/count,
- boss health/phase when active.

Menu/accessibility requirements:

- keyboard and gamepad navigation,
- remappable primary actions where runtime UI supports it,
- reduced motion,
- screen shake intensity,
- high-contrast bullet option,
- master/music/SFX volume,
- focus hitbox visibility option (focused-only or always).

## 17. Runtime architecture

Planned runtime ownership:

| Concern | Runtime surface | Game-owned policy |
| --- | --- | --- |
| deterministic tick | `@arcade/runtime/core` | ship/enemy state reducers |
| Pixi lifecycle/passes | runtime Pixi composition | layer contents and sprite sync |
| sprites | `@arcade/runtime/sprites/manifest` | Hyperblast manifests/animation names |
| animation | `@arcade/runtime/animation` | clip choice and VFX timing policy |
| stages | `@arcade/runtime/stages` | five stage definitions and wave scripts |
| resources/cooldowns | `@arcade/runtime/gameplay` | bombs, weapon cadence, boss resources |
| UI | `@arcade/runtime/ui` | Hyperblast HUD layout/labels |
| audio | `@arcade/runtime/audio` | synth voices, cues, music arrangement |
| persistence | `@arcade/runtime/storage` | high-score/result/settings schema |

Render hot paths use bounded pools (`createProjectilePool`, Pixi sprite/frame pools where appropriate) and stable arrays to avoid per-frame allocation spikes.

## 18. Stage data model

Stage content should be declarative TypeScript/data rather than hard-coded inside renderer logic.

```text
StageDefinition
  id / title / theme
  duration or sections
  scroll configuration
  parallax layers
  wave events[]
    atTick
    formation / enemy type
    path
    pattern
    rank scaling clamps
  midBoss
  boss
  transition / briefing metadata
```

Wave IDs and emitter IDs are stable serialization identifiers and are included in deterministic test diagnostics.

## 19. Testing strategy

### Unit/deterministic simulation

- player movement normalization and bounds,
- focus speed,
- player/enemy bullet integration,
- hit and graze separation,
- one-graze-per-projectile behavior,
- authored pattern snapshot sequences,
- wave spawn timing,
- boss health-gate transitions,
- rank changes and clamps,
- scoring/combo calculations,
- persistence migration/high-score ordering.

### Headless scenarios

Use runtime testing/headless facilities for fixed-seed scenarios and compare final hashes/snapshots. Determinism tests run the same command stream twice and require identical final state hashes.

### Browser/E2E release checks

- title → weapon select → stage start,
- complete representative stage section,
- boss phase transition,
- pause/resume and resize,
- localStorage high-score persistence,
- reduced-motion setting,
- renderer teardown/context recovery if supported by the current runtime certification harness.

## 20. Performance budgets

Release target: stable **60 FPS** at maximum authored Normal density on the primary desktop tier.

Initial engineering budgets:

- simulation mean < 2 ms,
- render CPU mean < 6 ms,
- frame p95 < 16.67 ms under certification scenario,
- hostile + player projectile simulation capacity: at least 2,000 pooled entities with a lower authored simultaneous visual target,
- zero unbounded array growth during a 10-minute soak,
- no per-projectile Pixi object construction in steady-state hot path.

Use runtime hardware/performance monitors to record evidence; tune final thresholds against measured representative hardware rather than weakening tests to match regressions.

## 21. Asset production contract

All production sprite prompts are generated in Phase 4 under:

`/home/user/code/chatgpt-tooling/prompt-queue/render-jobs/hyperblast/`

Prompts must define exact sheet dimensions, frame-cell grid, transparent alpha background, palette constraints, frame semantics, and intended runtime animation names. A `jobs.yml` manifest orders ship → core enemies → projectiles/VFX → bosses → backgrounds → UI by dependency/priority.

The first player authoring descriptor is `src/assets/hero.atls` (`arcade-atlas-project/v1`). It records the current 343×361 source geometry, center-based ship anchor semantics, and game-owned velocity-facing policy. Its `app.hyperblast-shooter.currentRenderer` value remains `procedural-pixi-fallback`; the descriptor is validated authoring metadata and does not claim that the procedural player renderer has already been replaced.

## 22. Legacy Hyperblast reference and migration policy

An older standalone artifact exists at `/home/user/work/code/artifacts/hyperblast-shooter`. It reached a substantially different v0.8 product direction with a five-stage story/exploration campaign, Pixi renderer, runtime 1.12 vendoring, multiplayer, and extensive tests. Useful source material includes stage narrative ideas, deterministic campaign-state techniques, sprite atlas work, and release evidence.

This new project does **not** copy its vendored runtime or monolithic JavaScript browser architecture. Reuse is selective:

- migrate original content/data only when it fits this shmup design,
- port deterministic helpers behind typed modules and tests,
- consume `@arcade/runtime` directly instead of vendoring runtime files,
- keep the requested five-stage vertical-shooter scope authoritative over the older exploration/multiplayer scope.

## 23. Definition of release-ready

Hyperblast Shooter is release-ready only when:

1. all five stages are playable from title to ending;
2. all five bosses are beatable and phase transitions cannot deadlock;
3. three player weapon families, bombs, lives/continues, power-ups, scoring, graze, combo, and rank are integrated;
4. deterministic tests cover movement, collision, patterns, waves, bosses, scoring, and rank;
5. production asset manifests validate through the runtime sprite-manifest API;
6. build, typecheck, lint, and test suites pass;
7. a browser playthrough validates pause/resume, resize, persistence, and accessibility settings;
8. measured max-density performance meets the documented runtime budgets or any revised evidence-backed thresholds;
9. README, CHANGELOG, and release notes accurately describe the shipped behavior.
