# Hyperblast Shooter

Hyperblast Shooter is a deterministic five-stage browser shoot-em-up built with TypeScript, PixiJS 8 and the local `@arcade/runtime` package.

## Play loop

1. Choose one of the five authored stages from the title overlay.
2. Move with WASD or arrow keys, hold Shift to focus, fire with Space, bomb with X and pause with Escape.
3. Clear the stage's wave schedule, mid-boss and multi-phase final boss.
4. Review the stage result and local stage best, then restart or advance to the next stage.

High scores/results use a versioned `@arcade/runtime/storage` seam. Corrupt or older local records fail soft and migrate without entering deterministic simulation/replay state.

## Content and assets

- Stages 1–5: Neon Drift Expanse, Orbital Furnace, Chrome Meridian, Verdant Hive and Hyperglass Corridor.
- Production ship and VFX sprite banks are runtime-loaded and bounded through pooled Pixi frames.
- Stage 4/5 boss gameplay identities deliberately reuse proven production hull clips; their names do not claim bespoke boss artwork.
- Primary stage/boss music is the v3 Hyperblast score generated from Sample Lab / ACE reference lineages (Nightglass Grit Circuit, Afterglow Break Circuit and Velvet Broken Pressure). The deterministic procedural Web Audio engine remains as a fail-safe when a score asset cannot be loaded.
- Narrative presentation is deliberately outside deterministic simulation state: every run opens with an in-universe exchange, early enemy contact receives live dialogue, and mid-boss/boss/result states continue the stage story without changing replay behavior.
- The 2:3 playfield is constrained by both viewport width and dynamic viewport height so portrait/desktop layouts scale vertically rather than assuming a fixed 720px field.

## Development

Run the release-development gate with:

    pnpm check

The game owns a fixed 60 Hz simulation. Gameplay code must not depend on wall-clock time, ambient randomness, audio timing or browser storage side effects.
