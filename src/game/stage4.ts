import type { BossEncounterDefinition, StageDefinition, StageWaveDefinition } from './stage'
import type { BossPhaseDefinition, PatternDefinition } from './types'

function organicSpread(
  cadenceTicks: number,
  count: number,
  speed: number,
  spreadRadians: number,
  acceleration = 0,
): PatternDefinition {
  return {
    kind: 'spread',
    cadenceTicks: Math.ceil(cadenceTicks * 1.18),
    warmupTicks: 24,
    count: Math.max(3, count - 2),
    speed,
    acceleration,
    spreadRadians,
    radius: 4,
    lifetimeTicks: 420,
  }
}

function wave(id: string, enemies: StageWaveDefinition['enemies']): StageWaveDefinition {
  return { id, enemies }
}

export const BROOD_LENS_PHASES: readonly BossPhaseDefinition[] = [
  {
    id: 'brood-lens:petal-bloom',
    hp: 165,
    timeoutTicks: 1080,
    pattern: {
      kind: 'ring',
      cadenceTicks: 58,
      warmupTicks: 24,
      count: 8,
      speed: 86,
      acceleration: 4.5,
      phaseStep: 0.085,
      radius: 4,
      lifetimeTicks: 440,
    },
  },
  {
    id: 'brood-lens:venom-fold',
    hp: 185,
    timeoutTicks: 1080,
    pattern: {
      kind: 'spiral',
      cadenceTicks: 28,
      warmupTicks: 18,
      count: 4,
      speed: 92,
      acceleration: 3,
      phaseStep: 0.155,
      radius: 4,
      lifetimeTicks: 420,
    },
  },
]

export const QUEEN_RECURSOR_PHASES: readonly BossPhaseDefinition[] = [
  {
    id: 'queen-recursor:petal-rings',
    hp: 205,
    timeoutTicks: 1320,
    pattern: {
      kind: 'ring',
      cadenceTicks: 62,
      warmupTicks: 24,
      count: 8,
      speed: 80,
      acceleration: 2.5,
      phaseStep: 0.07,
      radius: 4,
      lifetimeTicks: 420,
    },
  },
  {
    id: 'queen-recursor:dna-spiral',
    hp: 225,
    timeoutTicks: 1380,
    pattern: {
      kind: 'spiral',
      cadenceTicks: 32,
      warmupTicks: 18,
      count: 3,
      speed: 88,
      acceleration: 2,
      phaseStep: 0.21,
      radius: 4,
      lifetimeTicks: 400,
    },
  },
  {
    id: 'queen-recursor:shield-node-survival',
    hp: 245,
    timeoutTicks: 1440,
    pattern: {
      kind: 'random-spread',
      cadenceTicks: 46,
      warmupTicks: 18,
      count: 5,
      speed: 94,
      acceleration: 1.5,
      spreadRadians: 1.15,
      jitterAngle: 0.06,
      jitterSpeed: 6,
      radius: 4,
      lifetimeTicks: 380,
    },
  },
  {
    id: 'queen-recursor:recursive-bloom',
    hp: 270,
    timeoutTicks: 1560,
    pattern: {
      kind: 'spiral',
      cadenceTicks: 32,
      warmupTicks: 16,
      count: 4,
      speed: 98,
      acceleration: 1.25,
      phaseStep: 0.137,
      radius: 4,
      lifetimeTicks: 360,
    },
  },
]

export const BROOD_LENS_ENCOUNTER: BossEncounterDefinition = {
  id: 's4:boss:brood-lens',
  kind: 'brood-lens',
  phases: BROOD_LENS_PHASES,
  scoreValue: 7_800,
  drop: 'power',
  y: 116,
  amplitude: 68,
}

export const QUEEN_RECURSOR_ENCOUNTER: BossEncounterDefinition = {
  id: 's4:boss:queen-recursor',
  kind: 'queen-recursor',
  phases: QUEEN_RECURSOR_PHASES,
  scoreValue: 18_000,
  y: 106,
  amplitude: 82,
}

export const STAGE_4: StageDefinition = {
  id: 'stage-4-verdant-hive',
  title: 'Verdant Hive',
  theme: 'verdant-hive',
  events: [
    {
      id: 's4:event:spore-lattice',
      atTick: 70,
      kind: 'wave',
      wave: wave('s4:wave:spore-lattice', [
        { id: 'a', kind: 'shield', x: 116, y: -18, hp: 22, shieldHp: 28, vy: 74, path: 'drift', scoreValue: 360, pattern: organicSpread(72, 3, 96, 0.5, 3) },
        { id: 'b', kind: 'drifter', x: 196, y: -52, hp: 18, vy: 106, path: 'drift', scoreValue: 270, pattern: organicSpread(66, 3, 92, 0.42, 3.5) },
        { id: 'c', kind: 'drifter', x: 284, y: -52, hp: 18, vy: 106, path: 'drift', scoreValue: 270, drop: 'score', pattern: organicSpread(66, 3, 92, 0.42, 3.5) },
        { id: 'd', kind: 'shield', x: 364, y: -18, hp: 22, shieldHp: 28, vy: 74, path: 'drift', scoreValue: 360, pattern: organicSpread(72, 3, 96, 0.5, 3) },
      ]),
    },
    {
      id: 's4:event:membrane-pulse',
      atTick: 220,
      kind: 'wave',
      wave: wave('s4:wave:membrane-pulse', [
        { id: 'left', kind: 'turret', x: 82, y: -18, hp: 34, vy: 48, path: 'straight', scoreValue: 480, pattern: organicSpread(54, 7, 98, 0.92, 3.8) },
        { id: 'core', kind: 'shield', x: 240, y: -62, hp: 28, shieldHp: 36, vy: 78, path: 'drift', scoreValue: 440, drop: 'power', pattern: organicSpread(58, 5, 94, 0.68, 4.2) },
        { id: 'right', kind: 'turret', x: 398, y: -18, hp: 34, vy: 48, path: 'straight', scoreValue: 480, pattern: organicSpread(54, 7, 98, 0.92, 3.8) },
      ]),
    },
    {
      id: 's4:event:brood-crossing',
      atTick: 390,
      kind: 'wave',
      wave: wave('s4:wave:brood-crossing', [
        { id: 'c1', kind: 'chaser', x: 94, y: -20, hp: 25, vy: 104, path: 'chase', scoreValue: 390, pattern: organicSpread(56, 3, 112, 0.48, 2.4) },
        { id: 's1', kind: 'shield', x: 180, y: -54, hp: 24, shieldHp: 30, vy: 82, path: 'drift', scoreValue: 390, pattern: organicSpread(60, 5, 98, 0.62, 3.4) },
        { id: 's2', kind: 'shield', x: 300, y: -54, hp: 24, shieldHp: 30, vy: 82, path: 'drift', scoreValue: 390, drop: 'bomb', pattern: organicSpread(60, 5, 98, 0.62, 3.4) },
        { id: 'c2', kind: 'chaser', x: 386, y: -20, hp: 25, vy: 104, path: 'chase', scoreValue: 390, pattern: organicSpread(56, 3, 112, 0.48, 2.4) },
      ]),
    },
    { id: 's4:event:brood-lens', atTick: 600, kind: 'midboss', encounter: BROOD_LENS_ENCOUNTER },
    {
      id: 's4:event:rib-corridor',
      atTick: 760,
      kind: 'wave',
      wave: wave('s4:wave:rib-corridor', [
        { id: 'a', kind: 'shield', x: 110, y: -22, hp: 26, shieldHp: 34, vy: 86, path: 'drift', scoreValue: 430, pattern: organicSpread(50, 5, 104, 0.66, 3.6) },
        { id: 'b', kind: 'turret', x: 240, y: -64, hp: 40, vy: 54, path: 'straight', scoreValue: 560, drop: 'power', pattern: organicSpread(42, 9, 104, 1.08, 3.2) },
        { id: 'c', kind: 'shield', x: 370, y: -22, hp: 26, shieldHp: 34, vy: 86, path: 'drift', scoreValue: 430, pattern: organicSpread(50, 5, 104, 0.66, 3.6) },
      ]),
    },
    {
      id: 's4:event:queen-escort',
      atTick: 940,
      kind: 'wave',
      wave: wave('s4:wave:queen-escort', [
        { id: 'guard-left', kind: 'shield', x: 112, y: -20, hp: 30, shieldHp: 42, vy: 90, path: 'drift', scoreValue: 520, pattern: organicSpread(44, 5, 110, 0.7, 3.8) },
        { id: 'guard-mid', kind: 'shield', x: 240, y: -64, hp: 32, shieldHp: 46, vy: 88, path: 'drift', scoreValue: 580, drop: 'bomb', pattern: organicSpread(40, 7, 108, 0.86, 3.8) },
        { id: 'guard-right', kind: 'shield', x: 368, y: -20, hp: 30, shieldHp: 42, vy: 90, path: 'drift', scoreValue: 520, pattern: organicSpread(44, 5, 110, 0.7, 3.8) },
      ]),
    },
    { id: 's4:event:queen-recursor', atTick: 1180, kind: 'boss', encounter: QUEEN_RECURSOR_ENCOUNTER },
  ],
}
