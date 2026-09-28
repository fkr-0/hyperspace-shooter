# Hyperblast Shooter mobile QA — 2026-09-28

## Scope

Mobile readiness and touch-gameplay verification against the current dirty checkout.
Existing unrelated/cross-cutting edits in `src/main.ts` and `src/style.css` were treated as protected baseline and were not rewritten or committed by this lane.

## Verified implementation

- `src/input/mobile-touch.ts` is already tracked in Git and maps `@arcade/runtime` pointer contacts to:
  - drag-to-target movement in fixed 480×720 logical coordinates,
  - separate fire-zone hold,
  - special/bomb edge-trigger zone,
  - simultaneous move + fire multi-touch,
  - optional movement-driven auto-fire.
- Current browser integration uses `createPointerDevice` from `@arcade/runtime/core`.
- Pixi runtime is configured with `resolution = min(devicePixelRatio, 2)`, `pauseWhenHidden: true`, and a fixed 480×720 logical surface.
- Canvas and playfield disable browser touch scrolling via `touch-action: none`.
- Touch affordances are exposed only when the application detects coarse/touch input.
- High-score persistence uses the `@arcade/runtime/storage` versioned-store API and falls back to in-memory storage when the primary adapter throws.

## Automated checks

- Mobile-touch + persistence focused tests: 12/12 passed.
- Full Vitest suite: 21 files, 71/71 tests passed.
- TypeScript typecheck: passed.
- Production Vite build: passed.

Simulation soak evidence from the full suite:
- Stage 1: 1,828 fixed steps; max 150 projectiles; mean simulation step 0.151 ms.
- Stage 2: 1,748 fixed steps; max 168 projectiles; mean simulation step 0.074 ms.
- Stage 3: 2,448 fixed steps; max 215 projectiles; mean simulation step 0.060 ms.
- Stage 4: 2,303 fixed steps; max 158 projectiles; mean simulation step 0.053 ms.
- Stage 5: 3,283 fixed steps; max 187 projectiles; mean simulation step 0.055 ms.

These are simulation costs on the development machine, not physical-phone GPU benchmarks.

## Browser/mobile viewport evidence

Managed Chromium was used through ABC v2.

### Portrait

Viewport: 390×844, emulated DPR: 3, renderer DPR cap: 2.

Measured layout:
- document width: 375 CSS px; no horizontal overflow,
- playfield: 360.6×540.9 CSS px,
- fire zone: 82.9×129.8 CSS px,
- special zone: 64.9×86.5 CSS px,
- touch overlay visible in forced touch-layout state.

Screenshot:
`.ws-bridge/evidence/hyperblast-mobile-portrait.png`

### Landscape

Viewport: 844×390.

Measured layout:
- document size: 844×390 CSS px; no horizontal or vertical page overflow,
- playfield: 252.5×378.8 CSS px,
- fire zone: 58.1×90.9 CSS px.

A synthetic multi-pointer probe with auto-fire disabled produced:
- simultaneous movement and firing,
- player focus active while dragging,
- 12 player projectiles after 45 fixed simulation steps.

Renderer frame timing over the latest 240-frame sample:
- mean: 0.204 ms,
- p95: 0.400 ms,
- max: 1.900 ms.

Screenshot:
`.ws-bridge/evidence/hyperblast-mobile-landscape.png`

### WebGL lifecycle

Synthetic canvas context events were handled by the runtime:
- after `webglcontextlost`: `contextLosses=1`, state `lost`,
- after `webglcontextrestored`: `contextRestores=1`, state `ready`.

## Persistence evidence

The persistence test suite covers:
- stage-best persistence,
- bounded recent-run storage,
- legacy migration,
- corrupt-data soft failure,
- restricted/throwing storage fallback.

This specifically covers the failure mode seen in restricted browser storage environments such as private-browsing/storage-denied contexts without coupling gameplay state to persistence availability.

## Remaining qualification gaps

- No physical iOS Safari or Android Chrome device was attached during this run, so touch latency, thermal throttling, and actual mobile-GPU 60 FPS behavior remain hardware qualification items.
- ABC's current Chromium device preset changed viewport/DPR but reported `navigator.maxTouchPoints=0`; touch-layout visual QA therefore forced the app's touch-layout state, while gameplay input was verified using synthetic `PointerEvent(pointerType='touch')` events.
- A complete browser-driven stage clear from title → result overlay → persisted score was not accelerated through a test-only hook. Equivalent stage-clear behavior is covered by deterministic stage/soak tests and persistence recording is covered independently by the high-score tests.
