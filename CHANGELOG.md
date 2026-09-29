# Changelog

## Unreleased

### Final five-stage campaign tranche

- Added authored Stage 4 “Verdant Hive” and Stage 5 “Hyperglass Corridor” through the existing StageDefinition/event/wave/boss scheduler.
- Added readable multi-phase Brood Lens, Queen Recursor, Echo Composite and Hyperblast Engine encounters with deterministic transition cleanup and bounded projectile lifetimes.
- Added deterministic accelerating projectile support for the hive grammar while retaining the shared pattern emitter and projectile pool.
- Added versioned local stage-best/recent-result persistence with migration, corruption recovery and a memory fallback.
- Extended production hull aliases, stage palettes and deterministic procedural audio across all five stage identities without claiming unique Stage 4/5 boss art.
- Added campaign progression, Stage 4/5 deterministic/soak coverage and release-browser qualification targets.

## 0.0.1 - 2026-08-27

- Establish the initial Hyperblast Shooter implementation baseline.
- Add `src/assets/hero.atls` as the first-class player sprite authoring project, preserving center-anchor and procedural-facing semantics while runtime adoption remains explicitly pending.
- Add validation coverage for the `.atls` project contract and shared `@arcade/atlas-tools/atls` compatibility.
