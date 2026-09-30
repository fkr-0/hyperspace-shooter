# Arcade Runtime

Canonical checkout: `/home/user/code/arcade-runtime`

Package name: `@arcade/runtime`

Current release target: **1.13.0**. Next maintenance line: **1.13.1**; next feature line: **1.14.0**.

One shared browser-arcade runtime. It combines renderer-neutral engine services with optional PixiJS 8 lifecycle and rendering services. Games keep their rules and content, while loop timing, semantic input, scene lifecycle, events, animation clocks, fixed-capacity pools, deterministic replay, numeric integration, collision primitives, camera transforms and renderer ownership come from one tested package.

Release operations are documented in [`docs/releasing.md`](./docs/releasing.md). The path to API level 2 is tracked in [`docs/roadmap.md`](./docs/roadmap.md), machine-readable [`roadmap.yml`](./roadmap.yml), and the current [`major-release readiness review`](./docs/major-release-readiness.md).

## Package boundaries

The package now exposes stable capability-oriented entry points while preserving the complete root export:

```js
import { createArcadeRuntimeHost, createCollisionWorld } from '@arcade/runtime/core';
import { createPixiSceneGraph, createPixiSpritePool } from '@arcade/runtime/pixi';
import {
  normalizeArcadeSpriteManifest,
  inspectArcadeSpriteFrame,
  drawArcadeSpriteCanvasFrame,
} from '@arcade/runtime/sprites';
import { createAssetLoader } from '@arcade/runtime/assets';
import { createAudioMixer } from '@arcade/runtime/audio';
import {
  createArcadeUiTheme,
  createFocusNavigator,
  drawArcadePanelCanvas,
} from '@arcade/runtime/ui';
import {
  createResolutionEvidenceTracker,
  createResourcePoolState,
  tryStartGameplayAction,
} from '@arcade/runtime/gameplay';
import { createStageGraph, createEncounterPlan } from '@arcade/runtime/stages';
import {
  createPersistenceFeedback,
  createVersionedStore,
  createRunSummary,
} from '@arcade/runtime/storage';
import { createRollbackSession } from '@arcade/runtime/netcode';
import { createRuntimeInspector } from '@arcade/runtime/tooling';
```

`@arcade/runtime/testing` contains deterministic replay and snapshot tools. `@arcade/runtime/sprites` contains renderer-neutral manifest, frame-addressing, event, inspection, normalization, geometry, Canvas drawing and review-sheet primitives. `@arcade/runtime/gameplay` contains policy-neutral resources, action gates and grace-window state. `@arcade/runtime/stages` contains validated stage graphs, encounter plans and scoped stage-service installation. `@arcade/runtime/compat` contains only legacy names and compatibility constants. Renderer-neutral entry points do not import PixiJS at module evaluation time.

## Maintainer source architecture

The published and vendored runtime remains one self-contained ESM file, but that file is no longer the maintainer source of truth. Runtime implementation and declarations are organized into ordered fragments under `source/runtime/` and `source/types/`:

```text
source/runtime/*.js.inc  -> src/index.js
source/types/*.d.ts.inc -> src/index.d.ts
```

Use `npm run source:build` after editing a fragment. `npm run source:check`, the normal build, the API snapshot updater and the release gate all compare the generated outputs byte-for-byte and fail on drift. The `source/` tree is intentionally excluded from the published package; consumers continue receiving the checksum-verifiable standalone module and declaration file.

## Collision and actor foundation

Version 0.13 adds deterministic spatial hashing, layer/mask filtering, collision manifolds, swept AABB, contact begin/stay/end events, hitbox/hurtbox resolution, projectile pools and native Pixi world/HUD/parallax roots. Movement feel and combat policy remain game-owned.

## Assets and audio

Version 0.14 adds validated asset manifests, dependency ordering, preload groups and budgets, retry/fallback loading, abort signals, scene-scoped resource lifetimes and dependency-injected Web Audio buses with mute, ducking, panning and suspend/resume support.

## UI, accessibility and localization

Version 0.15 adds safe-area layout resolution, deterministic focus navigation, active-input hint tracking, reduced-motion/contrast/caption preferences, fallback message catalogs and deterministic text-measure caching. The 1.11 feature line adds an optional themeable Canvas composition layer—backdrops, clipped panels, menu rows, chips, meters, screen titles and footers—without prescribing game palettes or scene content. Version 1.12 extends that layer with measured text fitting and wrapping, semantic device-aware command bars, deterministic transient notices, focus-index control and focus-replacement events.

The interaction layer additionally provides gamepad-friendly ragged-grid focus and deterministic held-direction repeat. Grid navigation preserves a preferred column across short final rows, skips disabled or hidden entries, and can use row-local or sequence-style horizontal movement. The repeater fires an immediate edge, then crosses every configured repeat boundary even under a large fixed step.

```js
import {
  createGridFocusNavigator,
  createUiNavigationRepeater,
} from '@arcade/runtime/ui';

const focus = createGridFocusNavigator({
  columns: 6,
  items: roster.map((fighter) => ({ id: fighter.id, disabled: !fighter.unlocked })),
});
const repeat = createUiNavigationRepeater({
  initialDelay: 14,
  repeatInterval: 4,
  mode: 'dominant',
});

for (const direction of repeat.step(menuInput, 1)) focus.move(direction);
```

The Canvas composition functions accept a complete theme object and remain usable through the root export or `@arcade/runtime/ui`. Ethic Brawl and Badger Sprawl Runner now keep only palette adapters while sharing geometry, focus treatment, measured text, semantic command prompts and transient notice behavior. Command prompts describe actions rather than hard-coding one device, so the same authored UI can resolve keyboard, gamepad, pointer or touch labels without changing game policy. The ownership model and adoption rules are documented in [`docs/ui-experience-architecture.md`](./docs/ui-experience-architecture.md).

### Hardware-specific rendering budgets

`detectArcadeHardwareTier()` classifies a browser/device profile as `low`, `balanced`, or `high`. `createHardwareBudgetMonitor()` then evaluates one rolling sample stream against tier-specific limits for frame mean/p95/max, allocation bytes per frame, upload bytes per frame, transferred bundle bytes, heap bytes and minimum sample count.

```js
import {
  createHardwareBudgetMonitor,
  detectArcadeHardwareTier,
} from '@arcade/runtime/tooling';

const device = {
  deviceMemory: navigator.deviceMemory,
  hardwareConcurrency: navigator.hardwareConcurrency,
  devicePixelRatio,
};

const monitor = createHardwareBudgetMonitor({
  tier: detectArcadeHardwareTier(device),
  device,
});

monitor.record({
  frameMs,
  allocationBytes,
  uploadBytes,
  heapBytes: performance.memory?.usedJSHeapSize ?? 0,
});
monitor.setBundleBytes(transferredJavaScriptBytes);

const result = monitor.evaluate();
```

Canvas texture-pass state exposes `textureBytes`, `uploads`, `lastUploadBytes`, and `totalUploadBytes`, allowing bridge migrations to enforce upload budgets instead of relying on frame time alone.

### API level 2 and reference hosts

The 2.0 migration contract is machine-readable at `api/api-level-2.json`. Run `npm run api:level2:check` to reject deprecated API-level-1 names and private package imports, or `npm run api:level2:migrate` to inspect codemod-ready replacements. Minimal fighter, runner, and shooter hosts live under `templates/` and demonstrate fixed-step simulation without importing consumer-specific gameplay policy.

Patch/minor boundaries and synchronized consumer targets are documented in `docs/release-train.md` and verified with `npm run release:trains:check`.

Browser certification is reproducible with `npm run certify:browsers`. Set `ARCADE_LONG_SESSION_SECONDS` for sustained runs; see `docs/hardware-certification.md` for the physical-device evidence requirements and currently pending gates.

## Buffered real-time input

`@arcade/runtime/core` includes a bounded, immutable queue for input forgiveness. Time units are consumer-defined, so the same contract works for fighting-game command windows, jump buffering, coyote actions, interaction prompts or ability queuing.

```js
import {
  consumeBufferedInput,
  createBufferedInputQueue,
  pushBufferedInput,
} from '@arcade/runtime/core';

let buffered = createBufferedInputQueue({ window: 8, capacity: 16 });
buffered = pushBufferedInput(buffered, { action: 'jump' }, simulationFrame);

const consumed = consumeBufferedInput(buffered, simulationFrame + 4, {
  predicate: (input) => input.action === 'jump' && actor.canJump,
});
buffered = consumed.queue;
if (consumed.value) actor.jump();
```

The runtime handles ordering, expiry, capacity and latest/oldest matching. It does not interpret commands, decide action legality or prescribe frame versus time units.

## Reusable gameplay modules

Version 1.7 adds immutable named resources, action gates, unit-neutral grace windows and renderer-neutral HUD gauge models. These contracts unify difficult bookkeeping while keeping damage, movement, move legality, visual styling and game feel in each consumer.

```js
import {
  createActionGraceState,
  createGameplayActionState,
  createResourcePoolState,
  resolveHudGauge,
  stepActionGrace,
  tryStartGameplayAction,
} from '@arcade/runtime/gameplay';

const resources = createResourcePoolState('player', [
  { id: 'stamina', value: 4, max: 5, regenPerUnit: 1.5 },
  { id: 'ammo', value: 2, max: 8 },
]);
let actions = createGameplayActionState('player', resources);

const dash = tryStartGameplayAction(actions, {
  id: 'dash',
  cooldown: 0.4,
  costs: [{ id: 'stamina', amount: 2 }],
  queueWindow: 0.12,
}, { queueIfBlocked: true });
actions = dash.state;

let jump = createActionGraceState({ graceDuration: 0.08, bufferDuration: 0.1 });
jump = stepActionGrace(jump, {
  delta: fixedDelta,
  available: actor.onGround,
  requested: input.jumpPressed,
}).state;

const health = resolveHudGauge({
  value: actor.health,
  max: actor.maxHealth,
  segments: actor.maxHealth,
  lowThreshold: 0.35,
});
```

Resource events report exact before/after values and reasons. Action events distinguish cooldown, resource and queue outcomes. HUD gauges expose ratios, partial segments, warning state and a deterministic pulse scalar without prescribing colors or drawing APIs.

`createResolutionEvidenceTracker()` generalizes mixed-resolution bookkeeping used by combat, stealth, social, exploration and technical routes. Consumers define the approach vocabulary and constraint predicates; the runtime owns deterministic accumulation, sorted snapshots, revisioning and change events. `createPersistenceFeedback()` similarly provides timestamped event-bus and optional browser-event delivery while leaving serialization and storage ownership in the game.

## Stage and encounter composition

Version 1.8 adds serializable stage graphs and sequential encounter plans. Consumers retain authored content, save schemas, combat rules and scene presentation; the runtime owns validation, deterministic transition ordering, immutable progress state and scoped service teardown.

```js
import {
  advanceEncounter,
  advanceStageGraph,
  createEncounterPlan,
  createEncounterState,
  createStageGraph,
  createStageGraphState,
  installStageServices,
} from '@arcade/runtime/stages';

const campaign = createStageGraph({
  id: 'campaign',
  startNodeId: 'street',
  nodes: [
    {
      id: 'street',
      actors: ['thug'],
      encounterPlans: ['street-waves'],
      services: ['music'],
      transitions: [{ to: 'tower', signal: 'clear' }],
    },
    { id: 'tower', actors: ['boss'], services: ['music'], terminal: true },
  ],
}, {
  actors: ['thug', 'boss'],
  encounterPlans: ['street-waves'],
  services: ['music'],
});

let campaignState = createStageGraphState(campaign);
campaignState = advanceStageGraph(campaign, campaignState, 'clear').state;

const encounters = createEncounterPlan({
  id: 'street-waves',
  encounters: [
    { id: 'wave-1', actors: ['thug'] },
    { id: 'wave-2', actors: ['thug'] },
  ],
});
let encounterState = createEncounterState(encounters);
encounterState = advanceEncounter(encounters, encounterState).state;

const installed = await installStageServices(campaign, campaignState, {
  music: () => ({ resource: music.play('tower'), dispose: (track) => track.stop() }),
});
await installed.release();
```

Reference catalogs can validate actors, assets, spawn tables, objectives, services and encounter plans before a run starts. Branch policy remains injectable through `canTransition`; encounter completion policy remains injectable through `canAdvance`.

## Native Pixi ownership

Version 1.9 adds two production-oriented ownership primitives for native Pixi paths while preserving renderer-neutral simulation and game-owned visual policy.

`createPixiFramePool()` lazily grows a bounded set of display objects and assigns each acquired object to exactly one entity for the current frame. Overflow is dropped and reported rather than silently recycling an object that is still visible elsewhere in the same frame.

```js
import { createPixiFramePool } from '@arcade/runtime/pixi';

const projectiles = createPixiFramePool({
  container: projectileLayer,
  maxCapacity: 160,
  createSprite: () => new Sprite({ texture: projectileTexture }),
  activate(sprite, projectile) {
    sprite.position.set(projectile.x, projectile.y);
    sprite.rotation = Math.atan2(projectile.vy, projectile.vx);
  },
});

projectiles.beginFrame();
for (const projectile of simulation.projectiles) projectiles.acquire(projectile);
const poolStats = projectiles.endFrame();
```

`createPixiHudGauge()` renders the existing deterministic gauge model directly into a Pixi `Graphics` object. Layout, colors, segmented presentation and direction remain consumer-configurable.

```js
import { createPixiHudGauge } from '@arcade/runtime/pixi';

const health = createPixiHudGauge({
  PIXI: { Container, Graphics },
  container: hudLayer,
  layout: { x: 24, y: 24, width: 220, height: 14, gap: 3 },
  style: { background: 0x202633, fill: 0x67f3c4, warning: 0xff5e7a },
});

health.update({
  value: actor.health,
  max: actor.maxHealth,
  segments: actor.maxHealth,
  lowThreshold: 0.4,
});
```

Hyperblast uses the shared frame pool for native projectiles and enemies. Badger Sprawl Runner uses the same ownership model for native actors and combat VFX, Runtime sprite-frame addressing for retained backdrop/parallax textures, and the shared gauge for runner vitals while retaining game-owned animation, scrolling, boss-scale, and combat policy. Ethic Brawl uses native fighter/projectile ownership plus the shared fight HUD. Badger reports both steady-state renderer guardrails and low/balanced/high frame, allocation, texture-upload, bundle, and heap budgets through the Runtime performance services.

## Persistence and progression

Version 0.16 adds checksum-backed versioned stores, ordered migrations, temporary/backup recovery, profile slots, deterministic conflict resolution, statistics, achievements and replay-verifiable run summaries. Consumer schemas and progression rules remain outside the runtime.

## Rollback networking adapters

The `@arcade/runtime/netcode` entry point provides bounded state history, configurable input delay, prediction, late-input rollback/resimulation, checksum comparison and dependency-injected local transports. It deliberately does not prescribe WebRTC, WebSocket, server authority or matchmaking.

Rollback retention follows the configured state-history window. Inputs older than the oldest retained rollback base emit `rollback:input-too-old` so the consumer can request a state resynchronization instead of crashing or silently diverging. `cloneState` and `cloneInput` are separate because simulation state and transport packets commonly need different cloning strategies.

## Inspector and performance tooling

The `@arcade/runtime/tooling` entry point provides runtime snapshot capture, replay timeline seeking, headless deterministic scenarios and enforceable mean/p95/max frame budgets. Captures and replay frames use the same stable snapshot/hash contracts as the deterministic simulation layer.

Inspector capture indices are monotonic for the lifetime of an inspector, including after bounded-history eviction or `clear()`, making exported captures safe to correlate with external logs.

## 1.0 compatibility contract

Version 1.0 freezes API level 1 and publishes a machine-readable capability/stability manifest. Legacy Pixi/core constants and prefixed scalar helpers remain available from the root and `@arcade/runtime/compat`, but are marked deprecated with stable replacements. No compatibility façade contains implementation.

## Renderer-neutral core

Version 0.8 merges the former `arcade-core` package into this package. The same module now provides:

- fixed-step loops with interpolation, pause/resume and manual deterministic advancement
- keyboard held/pressed/released lifecycle and rebinding capture
- semantic keyboard/gamepad action maps
- push/pop/replace scene stacks and validated async transition graphs
- focus and visibility lifecycle handling
- shared acceleration, body integration, velocity approach, AABB overlap and one-way platform landing

These APIs do not import PixiJS at runtime. Pixi remains dependency-injected only when renderer services are created.

```js
import { createActionInput, createFixedStepLoop } from '@arcade/runtime';

const input = createActionInput({
  actions: ['left', 'right', 'jump'],
  bindings: { left: ['KeyA'], right: ['KeyD'], jump: ['Space', { type: 'button', index: 0 }] },
});

const loop = createFixedStepLoop({
  fixedStep: 1 / 60,
  update: (dt) => world.update(dt, input.advance()),
  render: (alpha) => renderer.render(world, alpha),
});
```

## Deterministic randomness and cooldowns

Version 0.10 extracts Badger Sprawl Runner's replay-safe random number generator and consolidates the cooldown patterns used by all three games. The APIs are renderer-neutral and unit-agnostic: cooldown values may represent fixed frames, seconds or milliseconds as long as callers step them consistently.

```js
import {
  createDeterministicRng,
  createSeededRandom,
  rngWeightedPick,
  startCooldown,
  stepCooldownState,
} from '@arcade/runtime';

let rng = createDeterministicRng('stage-4:wave-2');
const drop = rngWeightedPick(rng, [
  { id: 'scrap', weight: 8 },
  { id: 'railgun', weight: 1 },
]);
rng = drop.state;

// Existing APIs that accept `random = Math.random` can use this directly.
const random = createSeededRandom('elite-spawn');
const y = 80 + random() * 440;

let cooldowns = startCooldown({}, 'dash', 12);
cooldowns = stepCooldownState(cooldowns, 1);
```

The pure RNG state is serializable and reports its call count for replay diagnostics. `createSeededRandom()` is a compatibility adapter with `snapshot()` and `restore()` methods for existing spawn, loot and AI functions that expect a zero-argument random callback.

## Ticked command recording and deterministic replay

Version 0.11 extracts Badger Sprawl Runner's stable snapshot hashing and replay diagnostics, then adds a game-neutral semantic command stream. Commands are JSON-compatible values tagged with monotonic ticks and sequences. The runtime can bound recordings, serialize and validate them, replay them through a caller-provided reducer, hash every resulting state, and report exact divergence paths.

```js
import {
  createCommandRecorder,
  diffSnapshots,
  replayCommandStream,
  verifyReplayHashes,
} from '@arcade/runtime';

const recorder = createCommandRecorder({
  capacity: 600,
  metadata: { game: 'example', seed: 'stage-2' },
});

recorder.record({ left: true, fire: false });
recorder.advance();
recorder.record({ left: false, fire: true });

const replay = replayCommandStream({
  initialState: { x: 0, shots: 0 },
  stream: recorder.snapshot(),
  reduce: (state, command) => ({
    x: state.x + (command.left ? -1 : 0),
    shots: state.shots + (command.fire ? 1 : 0),
  }),
  includeSnapshots: true,
});

const mismatches = verifyReplayHashes(replay, expectedHashes);
const divergence = diffSnapshots({
  left: expectedState,
  right: replay.finalState,
  ignorePaths: ['renderTime'],
});
```

Stable snapshots sort object keys, normalize floating-point noise to configurable precision, omit named volatile keys, and reject cycles or non-JSON state. Games retain ownership of their reducers, cloning policy and simulation rules.

## Shared engine services

Version 0.12 converges the remaining duplicated engine shell in Ethic Brawl and Badger Sprawl Runner. Both games now use the same mutation-safe event bus, fixed-capacity recycling pool, and animation clock while retaining their own event types, particle presentation, sprite manifests, movement and combat rules.

```js
import {
  advanceArcadeAnimationClock,
  createArcadeAnimationClock,
  createEventBus,
  createRecyclingPool,
} from '@arcade/runtime';

const events = createEventBus();
const unsubscribe = events.on('hit', ({ damage }) => console.log(damage));
events.once('round:end', saveReplay);

const particles = createRecyclingPool({
  capacity: 320,
  create: () => ({ x: 0, y: 0, life: 0 }),
  reset: (particle) => Object.assign(particle, { x: 0, y: 0, life: 0 }),
});
particles.acquire((particle) => Object.assign(particle, { x: 20, y: 40, life: 1 }));

let animation = { ...createArcadeAnimationClock(), playing: true };
animation = advanceArcadeAnimationClock(animation, 1 / 60, {
  frameCount: 8,
  frameDuration: 1 / 12,
  mode: 'loop',
});
for (const frame of animation.advancedFrames) dispatchFrameEvents(frame);

unsubscribe();
```

Event emission iterates over a listener snapshot, so listeners may safely subscribe or unsubscribe during dispatch. Recycling pools own a fixed number of reusable values, expose active iteration without allocation, recycle deterministically when full, and report acquisition/release/recycle telemetry.

## Camera and combat-contact services

Version 1.1 adds two policy-neutral services extracted from Ethic Brawl and Badger Sprawl Runner:

- `createCameraRig()` owns weighted target averaging, velocity lookahead, bounded smoothing, zoom and deterministic shake.
- `createHitContactLedger()` owns per-target hit counts and rehit timing without interpreting attacks or damage.
- `resolveHitboxContacts()` exposes typed hitbox/hurtbox bodies while leaving lanes, guards, parries, pierce, bounce and damage policy in consumers.

```js
import { createCameraRig, createHitContactLedger, resolveHitboxContacts } from '@arcade/runtime/core';

const camera = createCameraRig({ x: 0, y: 0, zoom: 1 });
camera.follow([{ x: player.x, y: player.y }, { x: rival.x, y: rival.y }]);
camera.step(dt, {
  velocityX: player.vx,
  lookaheadScaleX: 0.24,
  followRate: 5,
  minX: stage.left,
  maxX: stage.right,
});

const contacts = createHitContactLedger();
if (contacts.canRegister(target.id, tick, { maxHitsPerTarget: 2, rehitDelayTicks: 4 })) {
  contacts.register(target.id, tick);
}

const overlaps = resolveHitboxContacts({ hitboxes, hurtboxes });
```

## Timeline and timed-effect services

Version 1.2 extracts two additional deterministic services from Ethic Brawl and Badger Sprawl Runner:

- `createTimelineQueue()`, `enqueueTimelineEntry()` and `stepTimelineQueue()` schedule arbitrary values with stable insertion order for equal timestamps.
- `applyTimedEffect()`, `stepTimedEffects()` and `hasTimedEffect()` own duration, periodic tick and expiration bookkeeping while consumers keep effect meaning and target mutation.

```js
import {
  applyTimedEffect,
  createTimelineQueue,
  enqueueTimelineEntry,
  stepTimedEffects,
  stepTimelineQueue,
} from '@arcade/runtime/core';

let timeline = createTimelineQueue(cues, {
  time: -1,
  getAt: (cue) => cue.frame,
});
timeline = enqueueTimelineEntry(timeline, delayedAction, { at: 12 });
const frame = stepTimelineQueue(timeline, 1);
for (const cue of frame.due) emitPresentationCue(cue);
timeline = frame.state;

const applied = applyTimedEffect(activeEffects, burn, {
  match: 'id-or-kind',
  merge: 'stack',
  refreshDuration: 'max',
});
const effects = stepTimedEffects(applied.effects, dt);
for (const event of effects.events) resolveGameSpecificEffectEvent(event);
```

The runtime does not decide damage, healing, movement multipliers, guards, visual effects, combat targets or action execution. It only supplies deterministic ordering and lifecycle bookkeeping.

## Deferred entity worlds

Version 1.6 adds structural ownership without imposing an ECS:

- immutable world snapshots with stable entity sequence and revision numbers
- deferred spawn, despawn, replace and shallow-patch commands
- explicit duplicate and missing-entity policies
- deterministic structural lifecycle events
- stable ID, value and predicate queries
- a mutable registry facade whose writes remain invisible until `flush()`

```js
import {
  createEntityCommandBuffer,
  createEntityWorld,
  entityWorldValues,
  flushEntityCommands,
  queueEntityDespawn,
  queueEntityPatch,
  queueEntitySpawn,
} from '@arcade/runtime/core';

const world = createEntityWorld([
  { id: 'fighter', hp: 10 },
  { id: 'old-projectile', life: 1 },
]);

let commands = createEntityCommandBuffer();
commands = queueEntityPatch(commands, 'fighter', { hp: 8 });
commands = queueEntityDespawn(commands, 'old-projectile');
commands = queueEntitySpawn(commands, { id: 'new-projectile', life: 30 });

const result = flushEntityCommands(world, commands);
console.log(result.events, entityWorldValues(result.world));
```

Entity values remain consumer-owned and may contain game-specific classes or data. The runtime owns only stable structural identity, ordering and mutation boundaries.

## Action phases and cancel routes

Version 1.5 adds a unit-neutral action clock for attacks, abilities and other authored actions:

- startup, active, recovery and done phases
- deterministic phase-entry and completion events
- correct traversal when one step crosses several phase boundaries
- active-window queries for hitbox and presentation code
- hit, block and whiff outcome recording
- deterministic cancel-route ordering
- definition-level and per-route hit-confirm gates

```js
import {
  createActionPhaseState,
  getActionCancelRoutes,
  markActionOutcome,
  stepActionPhase,
} from '@arcade/runtime/core';

const jab = {
  id: 'jab',
  startup: 6,
  active: 4,
  recovery: 12,
  cancelInto: ['cross'],
  onHitCancelInto: ['launcher'],
};

let action = createActionPhaseState(jab);
action = stepActionPhase(jab, action, 6).state;
action = markActionOutcome(action, 'hit');
action = stepActionPhase(jab, action, 4).state;
console.log(getActionCancelRoutes(jab, action));
```

The runtime does not prescribe frames versus seconds, attack damage, hit detection, input buffering or the meaning of a cancel. Consumers provide those policies.

## Ordered system pipelines

Version 1.4 adds a renderer-neutral scheduler for complete simulation frames rather than only Pixi render systems:

- named phases with stable phase order
- deterministic `order`, `priority` and registration-sequence sorting
- same-phase `before` and `after` dependencies with cycle detection
- conditional systems, enable/disable controls and selected-phase runs
- `halt`, `skipPhase` and `skipPhases` control results
- inspectable run counts, execution totals and per-system telemetry

```js
import { createSystemPipeline } from '@arcade/runtime/core';

const frame = createSystemPipeline({
  phases: ['input', 'simulation', 'contacts', 'presentation'],
});

frame.add('intent', readIntent, { phase: 'input' });
frame.add('physics', stepPhysics, { phase: 'simulation' });
frame.add('melee', resolveMelee, { phase: 'contacts' });
frame.add('projectiles', resolveProjectiles, {
  phase: 'contacts',
  after: 'melee',
});
frame.add('hit-freeze', (context) => (
  context.hitFreeze > 0 ? { halt: true } : undefined
), { phase: 'contacts', after: 'projectiles' });

const result = frame.run(context);
console.log(result.executed, frame.snapshot());
```

Dependencies intentionally operate inside one phase. Cross-phase ordering comes only from the declared phase list, keeping the schedule legible and preventing hidden backwards edges.

## Pixi runtime contract

The runtime provides:

- PixiJS application creation and deterministic teardown
- explicit named display layers
- isolated ordered render passes
- declarative cross-game render plans
- a managed requestAnimationFrame loop
- an authoritative fixed-step/Pixi composition helper that keeps simulation time renderer-neutral
- ordered frame systems with enable/disable controls
- manual stepping for deterministic tests and tools
- nearest-neighbour texture defaults and asset helpers
- resize observation and explicit logical resizing
- visibility-aware pause/resume
- context-loss and lifecycle events
- tracked application disposers
- telemetry and inspectable canvas data attributes
- an optional Canvas2D-to-Pixi texture bridge for staged migrations

The default layer order is:

```text
backdrop
  -> world-back
  -> world
  -> actors
  -> projectiles
  -> effects
  -> world-front
  -> hud
  -> overlay
```

Games may supply a smaller or custom ordered layer list.

For deterministic games, prefer `createArcadePixiFixedStepHost()` over letting the Pixi runtime own game time. The adapter delegates stepping to the existing fixed-step loop, sends only the authored fixed delta to simulation, and forwards interpolation alpha plus presentation timing to Pixi. Context loss and document visibility suspend the loop and reset its wall-clock baseline on resume, so hidden time is never replayed as a large simulation update; clamped catch-up remains inspectable through the loop's `droppedTime` telemetry. The helper rejects a Pixi runtime whose managed frame loop is already running, preventing accidental dual schedulers.

```js
import {
  createArcadePixiFixedStepHost,
  createArcadePixiRuntime,
} from '@arcade/runtime/pixi';

const runtime = await createArcadePixiRuntime({
  PIXI,
  logicalWidth: 960,
  logicalHeight: 540,
  autoStart: false,
});

const host = createArcadePixiFixedStepHost({
  runtime,
  fixedStep: 1 / 60,
  maxFrame: 0.1,
  update(delta) {
    world.update(delta); // always exactly 1 / 60
  },
});

runtime.addPass('actors', {
  layer: 'actors',
  update: ({ alpha }) => actors.presentInterpolated(alpha),
});
host.start();
```

## Installation

The package expects PixiJS 8.18 or newer, below PixiJS 9.

```json
{
  "dependencies": {
    "@arcade/runtime": "^1.12.0",
    "pixi.js": "^8.18.0"
  }
}
```

For effective tree-shaking, pass only the Pixi services used by the selected runtime features instead of a namespace import:

```js
import {
  Application,
  Assets,
  Container,
  TextureStyle,
} from 'pixi.js';
import { createArcadePixiRuntime } from '@arcade/runtime';

const runtime = await createArcadePixiRuntime({
  PIXI: { Application, Assets, Container, TextureStyle },
  mount: document.querySelector('#game'),
  logicalWidth: 960,
  logicalHeight: 540,
  layers: ['world', 'effects', 'actors', 'overlay'],
  observeResize: true,
  autoStart: false,
});
```

## Declarative render plans

Version 0.4.0 introduces named render passes and reusable render plans. Each pass owns an isolated child container inside a declared layer.

```js
import {
  defineArcadeRenderPlan,
  installArcadeRenderPlan,
} from '@arcade/runtime';

const plan = defineArcadeRenderPlan([
  { name: 'terrain', layer: 'world', order: 0, priority: 0, required: true },
  { name: 'particles', layer: 'effects', order: 0, priority: 5, required: true },
  { name: 'fighters', layer: 'actors', order: 0, priority: 10, required: true },
]);

const passes = installArcadeRenderPlan(runtime, plan, {
  terrain: {
    layer: 'world',
    create: ({ container }) => createTerrain(container),
  },
  particles: {
    layer: 'effects',
    update: ({ deltaSeconds }) => particles.update(deltaSeconds),
  },
  fighters: {
    layer: 'actors',
    update: ({ deltaSeconds }) => fighters.update(deltaSeconds),
  },
});

passes.particles.setEnabled(false);
passes.terrain.clear();
```

Passes can define `create`, `update`, `resize` and `destroy` hooks. Removing a pass removes its isolated container and updates runtime telemetry.

## Camera transform contract

Version 0.5 adds one reversible camera transform for Canvas2D and Pixi containers. The camera position is the world coordinate placed at the configured viewport anchor. Side-scrollers can use an anchor of `0,0`; centered arena cameras can use `0.5,0.5`.

```js
const camera = createArcadeCameraTransform({
  x: player.x,
  y: player.y,
  zoom: 1.2,
  viewportWidth: 960,
  viewportHeight: 540,
  anchorX: 0.5,
  anchorY: 0.5,
});

camera.applyToCanvas(context);
camera.applyToContainer(worldContainer);
const pointerWorld = camera.screenToWorld(pointerScreen);
```

## Performance comparison

`createArcadeFrameProfiler()` records rolling named samples and reports mean, p50, p95, and maximum durations. The runtime uses it internally for complete frames, updates, renderer submission, systems, and individual passes.

Steady-state Pixi scheduling caches ordered systems and passes until their registries change, and each render pass owns one stable context object. Percentile summaries are cadence-driven (`performanceSummaryEvery`, default `60`) while `performanceSnapshot()` remains an immediate pull-based summary. Set the cadence to `0` when only explicit snapshots are desired.

The runtime leaves `sortableChildren` disabled and sorts pass containers only when pass registration changes. Preserve semantic draw order first; when two draws are visually interchangeable, register atlas/texture- and blend-compatible work adjacently to avoid unnecessary batch breaks. The runtime deliberately does not reorder by texture or blend state because doing so can change visual results.

Pass-level `cullable`, `cullableChildren`, `cullArea`, and `renderGroup` options are opt-in for scenes that have measured benefit; they are not enabled globally. PixiJS 8 culling still requires the application's chosen `Culler`/`CullerPlugin` policy—the runtime only carries the per-pass container hints rather than imposing a global culling traversal.

```js
const profiler = createArcadeFrameProfiler({ sampleSize: 180 });
profiler.record('canvas', canvasDurationMs);
profiler.record('bridge', bridgeDurationMs);
console.table(profiler.compare('canvas', 'bridge'));
```

Run `npm run bench:pixi` for the reproducible 100/500/1000-entry hot-path comparison. The latest Phase 1 evidence is recorded in [`docs/benchmarks/pixi-hot-path-phase1.json`](./docs/benchmarks/pixi-hot-path-phase1.json); ratios are workstation-local evidence rather than universal performance promises.

## Frame systems

Systems remain useful for non-rendering orchestration or cross-pass simulation. Higher priorities run first.

```js
const removeSimulation = runtime.addSystem(
  'game:simulation',
  ({ deltaSeconds, tick }) => {
    world.update(deltaSeconds, tick);
  },
  { priority: 20 },
);

runtime.start('game-ready');
runtime.pause('menu-open');
runtime.resume('menu-close');
runtime.step(1000 / 60);
removeSimulation();
```

## Canvas2D migration bridge

Legacy or specialized Canvas2D drawing can be installed as a Pixi-owned texture pass. Include `Texture` and `Sprite` in the supplied Pixi services when using this feature.

```js
import {
  Application,
  Assets,
  Container,
  Sprite,
  Texture,
  TextureStyle,
} from 'pixi.js';
import { createCanvasTexturePass } from '@arcade/runtime';

createCanvasTexturePass(runtime, {
  PIXI: { Application, Assets, Container, Sprite, Texture, TextureStyle },
  name: 'legacy-background',
  layer: 'world-back',
  draw(context, frame) {
    context.fillRect(0, 0, frame.runtime.app.screen.width, frame.runtime.app.screen.height);
  },
});
```

This provides a gradual migration seam without giving up runtime-owned ordering, resize, visibility or cleanup.

## Layers and assets

```js
runtime.layer('actors').addChild(player);

const textures = await runtime.loadTextures({
  player: '/assets/player.png',
  tomb: '/assets/tomb.png',
});

runtime.clearLayer('effects');
```

## Events and cleanup

```js
const offResize = runtime.on('resize', ({ width, height }) => {
  camera.resize(width, height);
});

runtime.track(() => keyboard.destroy());
runtime.track(offResize);
runtime.destroy(true);
```

Built-in events include `start`, `pause`, `tick`, `resize`, `asset-loaded`, `context-lost` and `context-restored`.

## Telemetry

`runtime.snapshot()` returns renderer/backend data, tick and render counts, elapsed frame time, asset and resize counts, lifecycle state, context-loss counts, layer names, system names, pass names and active pass names.

The canvas exposes:

```text
data-arcade-runtime="1.13.0"
data-arcade-pixi-runtime="1.13.0"  # compatibility alias
data-arcade-logical-size="960x540"
data-arcade-state="ready|running|paused|destroyed"
data-context-state="ready|lost"
data-arcade-passes="terrain,particles,fighters"
data-arcade-active-passes="terrain,particles,fighters"
```

These attributes are useful for diagnostics and browser-level integration tests.

## Validation

```sh
npm run source:check
npm test
npm run release:check
npm run release:full   # includes the local Hyperblast/Ethic/Badger matrix
```

The contract suite validates layer ordering, isolated passes, render plans, Canvas2D bridging, managed frame systems, texture setup, telemetry, resize behavior, sync metadata and idempotent cleanup.

See [`docs/integration-review.md`](./docs/integration-review.md) for the consumer audit, completed v0.4 integration work, guardrails, and remaining migration sequence.

See [`docs/roadmap.md`](./docs/roadmap.md) for the path to a full-fledged runtime and [`docs/releasing.md`](./docs/releasing.md) for the exact minor-release procedure.

## Release gate

```sh
npm run release:check
```

The release gate runs the complete tests and syntax checks, verifies the public API snapshot and all version-bearing files, then inspects the package tarball. `npm run release:pack` creates the final tarball only after the same verification has passed.

## Consumers

| Game | Runtime use |
| --- | --- |
| Vim Tomb Raider | Live: application, canvas, resize, frame operation, declarative passes, display layers and teardown are runtime-managed |
| Hyperblast Shooter | Live lifecycle, assets, resize, teardown and seven owned display passes |
| Ethic Brawl | Verified render plan plus dependency-injected ready-pass Canvas bridge adapter |
| Badger Sprawl Runner | Verified render plan plus dependency-injected ready-pass Canvas bridge adapter |

The optional sync tool can vendor the ESM runtime and declarations into repositories that cannot use a workspace or file dependency:

```sh
npm run sync:games -- /absolute/path/to/game
```

Each consumer receives exactly one implementation and checksum path:

```text
vendor/arcade-runtime.mjs
vendor/arcade-runtime.d.mts
vendor/arcade-runtime.meta.json
```

For source compatibility during the merged-runtime migration, the sync command also writes tiny `arcade-core` and `arcade-pixi-runtime` re-export façades. They contain no implementation or metadata and only forward exports to `arcade-runtime.mjs`. Old per-package metadata files are removed and `--check` rejects them if they reappear.
