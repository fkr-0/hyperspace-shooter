# Hyperblast Shooter mobile hardening qualification

Date: 2026-09-29 (requalified; original qualification 2026-09-28)
Current HEAD: 20538b1bab8c3eb0b1d4566e9fd7bd7e28e3cc61
Original baseline HEAD: f9ec3db9e3d20bcb613120c3b39a070a4f255b34
Scope: mobile/touch readiness verification against the existing dirty working tree. Existing gameplay/render/audio/campaign edits were preserved and not rewritten.

## 2026-09-29 requalification

The mobile implementation is now tracked through the following scoped commits on `main`:

- `b7bb6f5` — mobile touch controller.
- `ed98621` — touch-zone hardening.
- `1d6bd44` — restricted-storage/high-score fallback hardening.
- `75cb99a` — transient touch-input lifecycle recovery across blur/visibility suspension.
- `bc63fc0` — drag pursuit uses normal movement at distance and precision focus near the target, avoiding slow full-screen pursuit on phones.

Fresh R20 verification against the current integrated dirty tree:

- Canonical OCP task: `HYPERBLAST-GAMEPLAY-R20-20260929`.
- No new mobile source defect reproduced; existing dirty campaign/render integration was preserved.
- TypeScript typecheck: pass.
- Biome lint: pass, 134 files checked.
- Vitest: 22 test files, 74/74 tests passed (fresh R20 run).
- Mobile touch mapping: 9/9 passed.
- Transient input lifecycle: 2/2 passed.
- High-score persistence: 4/4 passed.
- Production Vite build: pass; 745 modules transformed; main JS 475.54 kB / 140.71 kB gzip, CSS 6.22 kB / 1.89 kB gzip.

Fresh managed-Chromium evidence:

- iPhone-15-sized portrait emulation: 393×852 CSS px at DPR 3; document width 393 px with no horizontal overflow.
- Pixi backing canvas: 960×1440 while CSS canvas measured about 376.6×565.9 px; runtime diagnostic render resolution remained capped at 2.
- Title-scene runtime frame work over the initial 9-frame sample: mean ~2.31 ms, p95 16.6 ms, max 16.6 ms. This is desktop headless Chromium evidence, not physical-phone GPU certification.
- Landscape 844×390 forced-touch presentation: document scroll width exactly 844 px; playfield about 252.5×378.8 px; fire zone about 58.1×90.9 px; special zone about 45.5×60.6 px.
- Synthetic WebGL lifecycle events moved runtime diagnostics from `ready` → `lost` → `ready`, incrementing context loss/restore counters from 0/0 to 1/1.
- The ABC Chromium device preset still reports `navigator.maxTouchPoints = 0`, so fresh device-preset automation cannot truthfully claim native touch capability detection. Touch semantics remain verified by runtime-pointer tests and the earlier synthetic `PointerEvent(pointerType='touch')` browser evidence below.

No new source defect was reproduced during this requalification. The large uncommitted campaign/render/audio working tree remains unrelated inherited work and was intentionally not included in the mobile documentation commit.

## Working-tree implementation found

The live working tree already contains the mobile implementation requested by this lane:

- `src/input/mobile-touch.ts`: @arcade/runtime PointerDevice-backed multi-touch mapping with drag-to-target movement, independent fire zone, one-shot special/bomb edge detection, and optional movement-driven auto-fire.
- `src/input/mobile-touch.test.ts`: 8 deterministic mapping/multi-touch tests.
- `src/main.ts`: runtime pointer integration, DPR-capped Pixi resolution (`min(devicePixelRatio, 2)`), touch capability detection, touch overlay, auto-fire toggle, pause-when-hidden runtime option, and mobile diagnostics.
- `src/style.css`: responsive portrait/landscape layout and visible touch zones.
- `src/persistence/high-scores.ts`: runtime storage adapter + versioned store, migration, corruption recovery, and in-memory fallback when browser storage throws.
- `src/persistence/high-scores.test.ts`: 4 persistence tests including SecurityError/QuotaExceededError fallback.

These files were already dirty/untracked at pickup and were therefore treated as pre-existing owner work, not silently claimed as new implementation.

## Automated verification

`pnpm check` passed before qualification:

- TypeScript: pass
- Biome lint: pass
- Vitest: 21 files passed, 71 tests passed
- Vite production build: pass
- Production JS bundle: 474.73 kB / 140.49 kB gzip
- Production CSS bundle: 6.15 kB / 1.88 kB gzip at baseline verification

Relevant focused tests:

- Touch input: 8/8 pass
- High-score persistence: 4/4 pass
- Full deterministic simulation/stage suites remained green inside the 71-test run

## Browser/mobile evidence

Browser route: local production preview through the managed ABC Chromium session.

### Portrait 393 × 852, DPR 3 emulation

- Document scroll width: 393 px for a 393 px viewport: no horizontal overflow.
- Playfield: ~378.6 × 567.9 px, preserving the 2:3 logical aspect ratio.
- Backing canvas: 960 × 1440 with CSS size ~376.6 × 565.9 px.
- Runtime diagnostic render resolution: 2, confirming the intended DPR cap on a DPR-3 emulation.
- Production sprite/VFX atlas mode loaded successfully.
- Touch controls were forced visible for interaction testing because this Chromium device preset changes viewport/DPR but reports `navigator.maxTouchPoints = 0` and `(pointer: coarse) = false`.

### Multi-touch interaction

A two-contact synthetic touch sequence was delivered through browser PointerEvents to the runtime pointer device:

- Contact 1: movement target in the playfield.
- Contact 2: independent fire-zone hold.
- Player moved from (240, 628) to approximately (208.18, 596.18).
- Focus/precision mode was active while dragging.
- 8 player projectiles were present while movement and firing were simultaneous.
- After pointer release, velocity returned to zero and focus returned false.

This verifies concurrent move + fire through the runtime pointer snapshot rather than a keyboard fallback.

### Landscape 852 × 393

- Document scroll width: 852 px for an 852 px viewport: no horizontal overflow.
- Playfield: ~254.5 × 381.8 px.
- Telemetry: ~578.3 × 381.8 px beside the playfield.
- Orientation diagnostic: landscape.
- The playfield retained 2:3 aspect while the telemetry occupied the remaining horizontal space.

### Narrow 320 × 568

- Document scroll width equals the 320 px viewport width.
- No actual horizontal overflow was reproduced.
- Five stage-selector touch targets measure 44 × 44 px when the touch presentation is active.
- An initial comparison against `documentElement.clientWidth` was discarded because it counted the scrollbar gutter as overflow; `scrollWidth <= innerWidth` is the relevant check here.

### Accessibility smoke

Axe 4.12.1, WCAG 2 A/AA tags:

- 0 violations
- 22 passes
- 1 incomplete rule: color contrast could not be automatically determined for 48 nodes because the page uses gradients/overlap. This is not a pass; manual contrast inspection remains appropriate.

### Runtime performance sample

After active gameplay input, the @arcade/runtime rolling frame sample reported:

- 240 frames sampled
- mean frame work: ~0.227 ms
- p50: ~0.200 ms
- p95: ~0.400 ms
- max: ~2.900 ms

These are headless desktop Chromium timing measurements, not physical-mobile-GPU FPS certification. They demonstrate ample CPU/render-work headroom in this environment but should not be represented as device-level 60 FPS evidence.

## Persistence qualification

The existing persistence tests verify:

- stage-best retention
- bounded recent-run history
- migration of legacy plain JSON into the current versioned envelope
- corruption fail-soft behavior
- explicit clear behavior
- in-memory fallback when a browser-like storage adapter throws `SecurityError` or `QuotaExceededError`

The browser diagnostic reported storage fallback disabled in the normal preview environment.

## Remaining qualification gaps

- The browser automation device preset does not expose real touch-capability media features, so capability auto-detection itself was not reproduced under a true mobile browser; the runtime PointerEvent path was tested directly.
- No physical iOS Safari/Android Chrome GPU run was available, so thermal throttling, real touch latency, Safari private-mode behavior, and device-level sustained 60 FPS remain device-lab items.
- The complete title → gameplay → stage-clear result → persisted high-score UI sequence was not played to completion in real time in the browser session. The title/gameplay transition and live touch gameplay were exercised; deterministic stage-clear/result behavior and persistence are covered by the passing simulation/stage and persistence test suites.
- Axe could not automatically resolve contrast over gradients/overlays; that remains a manual visual check.
