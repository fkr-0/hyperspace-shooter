import type { BossEncounterDefinition, StageDefinition, StageWaveDefinition } from './stage'
import type { BossPhaseDefinition, PatternDefinition } from './types'

function spread(
  cadenceTicks: number,
  count: number,
  speed: number,
  spreadRadians: number,
): PatternDefinition {
  return {
    kind: 'spread',
    cadenceTicks,
    warmupTicks: 28,
    count,
    speed,
    spreadRadians,
    radius: 4,
    lifetimeTicks: 390,
  }
}

function wave(id: string, enemies: StageWaveDefinition['enemies']): StageWaveDefinition {
  return { id, enemies }
}

export const DOCKMASTER_ARRAY_PHASES: readonly BossPhaseDefinition[] = [
  {
    id: 'dockmaster-array:rotor-ring',
    hp: 125,
    timeoutTicks: 960,
    pattern: {
      kind: 'ring',
      cadenceTicks: 54,
      warmupTicks: 20,
      count: 10,
      speed: 100,
      phaseStep: 0.13,
      radius: 4,
    },
  },
  {
    id: 'dockmaster-array:docking-fan',
    hp: 120,
    timeoutTicks: 960,
    pattern: spread(38, 5, 136, 0.78),
  },
]

export const HELIX_FOUNDRY_PHASES: readonly BossPhaseDefinition[] = [
  {
    id: 'helix-foundry:armor-shutters',
    hp: 145,
    timeoutTicks: 1260,
    pattern: spread(44, 5, 132, 0.84),
  },
  {
    id: 'helix-foundry:mirrored-spreads',
    hp: 165,
    timeoutTicks: 1260,
    pattern: {
      kind: 'random-spread',
      cadenceTicks: 36,
      warmupTicks: 18,
      count: 7,
      speed: 142,
      spreadRadians: 1.06,
      jitterAngle: 0.055,
      jitterSpeed: 8,
      radius: 4,
    },
  },
  {
    id: 'helix-foundry:reactor-spiral',
    hp: 190,
    timeoutTicks: 1500,
    pattern: {
      kind: 'spiral',
      cadenceTicks: 22,
      warmupTicks: 18,
      count: 5,
      speed: 122,
      phaseStep: 0.145,
      radius: 4,
    },
  },
]

export const DOCKMASTER_ARRAY_ENCOUNTER: BossEncounterDefinition = {
  id: 's2:boss:dockmaster-array',
  kind: 'dockmaster-array',
  phases: DOCKMASTER_ARRAY_PHASES,
  scoreValue: 5_500,
  drop: 'power',
  y: 118,
  amplitude: 76,
}

export const HELIX_FOUNDRY_ENCOUNTER: BossEncounterDefinition = {
  id: 's2:boss:helix-foundry',
  kind: 'helix-foundry',
  phases: HELIX_FOUNDRY_PHASES,
  scoreValue: 13_000,
  y: 106,
  amplitude: 70,
}

export const STAGE_2: StageDefinition = {
  id: 'stage-2-orbital-furnace',
  title: 'Orbital Furnace',
  theme: 'orbital-furnace',
  events: [
    {
      id: 's2:event:rail-turrets-01',
      atTick: 60,
      kind: 'wave',
      wave: wave('s2:wave:rail-turrets-01', [
        { id: 'left', kind: 'turret', x: 92, y: -18, hp: 28, vy: 42, path: 'straight', scoreValue: 340, pattern: spread(64, 5, 132, 0.62) },
        { id: 'right', kind: 'turret', x: 388, y: -52, hp: 28, vy: 42, path: 'straight', scoreValue: 340, drop: 'score', pattern: spread(64, 5, 132, 0.62) },
      ]),
    },
    {
      id: 's2:event:shield-convoy-01',
      atTick: 180,
      kind: 'wave',
      wave: wave('s2:wave:shield-convoy-01', [
        { id: 'guard-left', kind: 'shield', x: 145, y: -20, hp: 18, shieldHp: 22, vy: 78, path: 'drift', scoreValue: 280, pattern: spread(82, 3, 120, 0.4) },
        { id: 'core', kind: 'turret', x: 240, y: -52, hp: 36, vy: 55, path: 'straight', scoreValue: 480, drop: 'power', pattern: spread(52, 7, 138, 0.76) },
        { id: 'guard-right', kind: 'shield', x: 335, y: -20, hp: 18, shieldHp: 22, vy: 78, path: 'drift', scoreValue: 280, pattern: spread(82, 3, 120, 0.4) },
      ]),
    },
    {
      id: 's2:event:maintenance-crossfire',
      atTick: 330,
      kind: 'wave',
      wave: wave('s2:wave:maintenance-crossfire', [
        { id: 'a', kind: 'drifter', x: 78, y: -18, hp: 14, vy: 112, path: 'drift', scoreValue: 210, pattern: spread(58, 3, 144, 0.44) },
        { id: 'b', kind: 'drifter', x: 174, y: -44, hp: 14, vy: 116, path: 'drift', scoreValue: 210 },
        { id: 'c', kind: 'drifter', x: 306, y: -44, hp: 14, vy: 116, path: 'drift', scoreValue: 210 },
        { id: 'd', kind: 'drifter', x: 402, y: -18, hp: 14, vy: 112, path: 'drift', scoreValue: 210, pattern: spread(58, 3, 144, 0.44) },
      ]),
    },
    {
      id: 's2:event:shield-convoy-02',
      atTick: 470,
      kind: 'wave',
      wave: wave('s2:wave:shield-convoy-02', [
        { id: 'shield-a', kind: 'shield', x: 118, y: -20, hp: 20, shieldHp: 26, vy: 84, path: 'drift', scoreValue: 330, pattern: spread(72, 3, 132, 0.5) },
        { id: 'shield-b', kind: 'shield', x: 362, y: -52, hp: 20, shieldHp: 26, vy: 84, path: 'drift', scoreValue: 330, drop: 'bomb', pattern: spread(72, 3, 132, 0.5) },
      ]),
    },
    { id: 's2:event:dockmaster-array', atTick: 620, kind: 'midboss', encounter: DOCKMASTER_ARRAY_ENCOUNTER },
    {
      id: 's2:event:furnace-grid',
      atTick: 760,
      kind: 'wave',
      wave: wave('s2:wave:furnace-grid', [
        { id: 't-left', kind: 'turret', x: 70, y: -18, hp: 30, vy: 54, path: 'straight', scoreValue: 430, pattern: spread(56, 5, 148, 0.7) },
        { id: 's-left', kind: 'shield', x: 165, y: -46, hp: 22, shieldHp: 28, vy: 88, path: 'drift', scoreValue: 360, pattern: spread(70, 3, 136, 0.48) },
        { id: 's-right', kind: 'shield', x: 315, y: -46, hp: 22, shieldHp: 28, vy: 88, path: 'drift', scoreValue: 360, drop: 'power', pattern: spread(70, 3, 136, 0.48) },
        { id: 't-right', kind: 'turret', x: 410, y: -18, hp: 30, vy: 54, path: 'straight', scoreValue: 430, drop: 'bomb', pattern: spread(56, 5, 148, 0.7) },
      ]),
    },
    {
      id: 's2:event:reactor-escort',
      atTick: 940,
      kind: 'wave',
      wave: wave('s2:wave:reactor-escort', [
        { id: 'lead', kind: 'shield', x: 240, y: -24, hp: 24, shieldHp: 30, vy: 94, path: 'drift', scoreValue: 420, drop: 'bomb', pattern: spread(62, 5, 144, 0.62) },
        { id: 'wing-a', kind: 'drifter', x: 130, y: -62, hp: 16, vy: 132, path: 'drift', scoreValue: 250, pattern: spread(66, 3, 150, 0.42) },
        { id: 'wing-b', kind: 'drifter', x: 350, y: -62, hp: 16, vy: 132, path: 'drift', scoreValue: 250, pattern: spread(66, 3, 150, 0.42) },
      ]),
    },
    { id: 's2:event:helix-foundry', atTick: 1180, kind: 'boss', encounter: HELIX_FOUNDRY_ENCOUNTER },
  ],
}
