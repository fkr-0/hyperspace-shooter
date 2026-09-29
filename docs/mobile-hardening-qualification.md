# Hyperblast Shooter mobile hardening qualification

Date: 2026-09-29 (requalified; original qualification 2026-09-28)
Current HEAD before this evidence-only update: 11c5841d6fbd49f3d63d5814b42178f06eab1e1a
Original baseline HEAD: f9ec3db9e3d20bcb613120c3b39a070a4f255b34
Scope: mobile/touch readiness verification against the existing dirty working tree. Existing gameplay/render/audio/campaign edits were preserved and not rewritten.

## 2026-09-29 post-narrative mobile revalidation

Fresh verification at HEAD `2a9a668e28171af4a54f028cabae2b376926006b` rechecked mobile behavior after the narrative/story overlay integration. No product-source mobile regression was reproduced.

- Full `pnpm check`: pass — TypeScript, Biome, 23/23 Vitest files with 78/78 tests, and the Vite production build.
- 320×568 portrait touch presentation: document width 320 px with no horizontal overflow; playfield about 282.7×424.0 px; fire zone about 65.0×101.8 px; special zone about 50.9×67.8 px. The tall title card remains scrollable inside the playfield overlay rather than forcing page-width overflow.
- 844×390 short landscape touch presentation: document exactly 844×390 with no page overflow; playfield about 252.5×378.8 px; telemetry about 572.3×378.8 px; fire zone about 58.1×90.9 px; special zone about 45.5×60.6 px.
- iPhone-15-sized emulation produced a 393×852 viewport at DPR 3. The 480×720 logical Pixi surface used a 960×1440 backing canvas, preserving the intentional render-resolution cap of 2.
- Managed Chromium title → gameplay smoke passed: after activating START STAGE 1, diagnostics reported `mode=combat` and advancing fixed-step ticks.
- Rolling runtime frame-work sample in active gameplay (latest 240 frames): mean about 0.56 ms, p95 about 1.0 ms, max about 1.4 ms. This remains desktop/headless evidence, not physical-phone sustained-FPS certification.
- Explicit `WEBGL_lose_context` exercise recovered cleanly: runtime diagnostics advanced from 0/0 to `contextLosses=1`, `contextRestores=1`, with final `contextState=ready`.
- Normal preview persistence diagnostics remained on the browser-backed store (`usingFallback=false`, schema version 2). Restricted-storage fallback remains covered by the 4/4 high-score persistence tests.
- ABC's Chromium device preset still reports `navigator.maxTouchPoints=0` and `(pointer: coarse)=false`; native touch-capability auto-detection therefore still requires physical-device verification. Multi-touch semantics remain covered by the runtime-pointer tests and the prior synthetic PointerEvent browser probe.

No product files were changed in this revalidation. The only remaining material qualification gap is a physical iOS Safari + Android Chrome device-lab run for true multi-touch latency, thermal behavior, background/BFCache resume, private-mode storage behavior, and sustained device GPU frame pacing.

## 2026-09-29 live mobile-hardening pickup

Fresh verification at HEAD `854966c7fe70ae3bb8391c531508f08471d2f6e4` found the requested mobile hardening already landed in the tracked mobile/input/persistence history. The currently dirty story/audio integration owns `src/main.ts` and `src/style.css` through an active ws-bridge claim, so this pickup preserved those concurrent edits and did not replay already-landed mobile source changes.

- Focused mobile/storage suite: 3 files, 15/15 tests passed (`mobile-touch` 9/9, transient lifecycle 2/2, high-score persistence 4/4).
- Full `pnpm check`: pass.
- TypeScript: pass.
- Biome: pass, 138 files checked.
- Vitest: 23 files, 78/78 tests passed.
- Production build: pass, 746 modules transformed; main JS 488.09 kB / 145.61 kB gzip, CSS 7.54 kB / 2.24 kB gzip.
- Deterministic soak samples remained bounded: Stage 1 max 150 projectiles / 10 enemies; Stage 2 168 / 10; Stage 3 215 / 10; Stage 4 158 / 8; Stage 5 187 / 10. The reported mean simulation-step cost stayed below 0.15 ms for all stage soak samples in this run.
- Managed Chromium, iPhone-15-sized portrait emulation: 393×852 CSS px, DPR 3, document width 393 px, playfield about 378.6×567.9 px, backing canvas 960×1440, runtime render resolution 2.
- Managed Chromium landscape: 844×390 CSS px, document 844×390 with no page overflow, playfield about 252.5×378.8 px, fire zone about 58.1×90.9 px, special zone about 45.5×60.6 px.
- The live browser runtime advanced from title into active gameplay during the landscape sample; diagnostics remained available and the Pixi host continued running.
- The current Chromium device preset still reports `navigator.maxTouchPoints = 0` and `(pointer: coarse) = false`; therefore automatic touch-capability detection cannot be truthfully certified from this preset. Runtime-pointer multi-touch behavior remains covered by the 9 deterministic controller tests and prior synthetic PointerEvent browser evidence documented below.
- One first cold-start browser sample observed the Vite shell before the module graph had populated `#app`; a normal reload immediately produced the full game with no browser console/page errors. This was not reproduced as a persistent game defect.

No mobile-source defect was reproduced, so this pickup changes qualification evidence only. Physical iOS Safari/Android Chrome latency, thermal/GPU sustained-60-FPS behavior, and a real-device title → gameplay → result → persisted-high-score run remain device-lab qualification items.

## 2026-09-29 current pickup verification

Fresh verification against the live integrated dirty tree at `11c5841d6fbd49f3d63d5814b42178f06eab1e1a` reproduced no mobile-source defect. No gameplay, rendering, input, persistence, or styling source file was changed in this pickup.

- Focused mobile/storage verification: 3 test files, 15/15 tests passed (`mobile-touch` 9/9, transient input lifecycle 2/2, high-score persistence 4/4).
- Full `pnpm check`: pass.
- TypeScript typecheck: pass.
- Biome lint: pass, 135 files checked.
- Vitest: 22 test files, 74/74 tests passed.
- Production Vite build: pass; 745 modules transformed; main JS 475.54 kB / 140.71 kB gzip, CSS 6.22 kB / 1.89 kB gzip.
- Deterministic soak samples remained bounded: Stage 1 max 150 projectiles / 10 enemies; Stage 2 168 / 10; Stage 3 215 / 10; Stage 4 158 / 8; Stage 5 187 / 10. Mean simulation-step cost reported by the soak tests remained below 0.22 ms for every stage in this run.
- The repository still has a substantial unrelated inherited dirty tree; this qualification update intentionally does not stage or rewrite it.

The device-lab limitations documented below remain unchanged: no physical iOS Safari/Android Chrome run was available in this pickup, and the complete real-time title → gameplay → result → persisted-high-score browser flow was not re-exercised end-to-end.

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
