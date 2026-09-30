# Changelog

## 0.0.2 - 2026-09-30

### Mobile hardening and touch gameplay

- Added and qualified runtime-pointer touch controls with drag-to-target movement, independent fire/special zones, simultaneous move + fire, optional auto-fire, and stale-input recovery after browser suspension.
- Hardened portrait and short-landscape layouts, touch target sizing, DPR-capped Pixi rendering, WebGL context loss/restoration, and browser-backed high-score persistence with restricted-storage memory fallback.
- Requalified the five-stage campaign with 79 passing deterministic/unit tests and bounded Stage 1–5 soak coverage while preserving desktop keyboard gameplay.

### Final five-stage campaign tranche

- Added authored Stage 4 “Verdant Hive” and Stage 5 “Hyperglass Corridor” through the existing StageDefinition/event/wave/boss scheduler.
- Added readable multi-phase Brood Lens, Queen Recursor, Echo Composite and Hyperblast Engine encounters with deterministic transition cleanup and bounded projectile lifetimes.
- Added deterministic accelerating projectile support for the hive grammar while retaining the shared pattern emitter and projectile pool.
- Added versioned local stage-best/recent-result persistence with migration, corruption recovery and a memory fallback.
- Extended production hull aliases, stage palettes and deterministic procedural audio across all five stage identities without claiming unique Stage 4/5 boss art.
- Added campaign progression, Stage 4/5 deterministic/soak coverage and release-browser qualification targets.

### Release infrastructure

- Made the repository CI-self-contained by vendoring the clean `@arcade/runtime` v1.13.0 release source from commit `57aa56d77e7c1d36d6dd28131cf6386578b2bab3`.
- Added tag-triggered GitHub Actions verification, production archive/checksum publication, GitHub Release creation, and GitHub Pages deployment.

## 0.0.1 - 2026-08-27

- Establish the initial Hyperblast Shooter implementation baseline.
- Add `src/assets/hero.atls` as the first-class player sprite authoring project, preserving center-anchor and procedural-facing semantics while runtime adoption remains explicitly pending.
- Add validation coverage for the `.atls` project contract and shared `@arcade/atlas-tools/atls` compatibility.
