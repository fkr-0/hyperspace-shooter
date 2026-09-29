import type { BossEncounterDefinition, StageDefinition, StageWaveDefinition } from './stage'
import type { BossPhaseDefinition, PatternDefinition } from './types'

function spread(cadenceTicks: number, count: number, speed: number, radians: number): PatternDefinition {
  return {
    kind: 'spread',
    cadenceTicks,
    warmupTicks: 22,
    count,
    speed,
    spreadRadians: radians,
    radius: 4,
    lifetimeTicks: 420,
  }
}

function wave(id: string, enemies: StageWaveDefinition['enemies']): StageWaveDefinition {
  return { id, enemies }
}

export const SKYLINE_PURSUER_PHASES: readonly BossPhaseDefinition[] = [
  {
    id: 'skyline-pursuer:charge-fan',
    hp: 145,
    timeoutTicks: 960,
    pattern: spread(26, 5, 168, 0.62),
  },
  {
    id: 'skyline-pursuer:rain-cut',
    hp: 165,
    timeoutTicks: 1020,
    pattern: {
      kind: 'random-spread',
      cadenceTicks: 22,
      warmupTicks: 18,
      count: 8,
      speed: 132,
      spreadRadians: 1.02,
      jitterAngle: 0.075,
      jitterSpeed: 9,
      radius: 4,
    },
  },
]

export const MUNICIPAL_GHOST_PHASES: readonly BossPhaseDefinition[] = [
  {
    id: 'municipal-ghost:decoy-sweeps',
    hp: 180,
    timeoutTicks: 1260,
    pattern: spread(30, 9, 132, 1.18),
  },
  {
    id: 'municipal-ghost:laser-cages',
    hp: 205,
    timeoutTicks: 1320,
    pattern: {
      kind: 'ring',
      cadenceTicks: 32,
      warmupTicks: 18,
      count: 16,
      speed: 112,
      phaseStep: 0.11,
      radius: 4,
    },
  },
  {
    id: 'municipal-ghost:polygon-collapse',
    hp: 235,
    timeoutTicks: 1560,
    pattern: {
      kind: 'spiral',
      cadenceTicks: 14,
      warmupTicks: 16,
      count: 7,
      speed: 124,
      phaseStep: 0.19,
      radius: 4,
    },
  },
]

export const SKYLINE_PURSUER_ENCOUNTER: BossEncounterDefinition = {
  id: 's3:boss:skyline-pursuer',
  kind: 'skyline-pursuer',
  phases: SKYLINE_PURSUER_PHASES,
  scoreValue: 6_500,
  drop: 'power',
  y: 118,
  amplitude: 118,
}

export const MUNICIPAL_GHOST_ENCOUNTER: BossEncounterDefinition = {
  id: 's3:boss:municipal-ghost',
  kind: 'municipal-ghost',
  phases: MUNICIPAL_GHOST_PHASES,
  scoreValue: 15_000,
  y: 108,
  amplitude: 104,
}

export const STAGE_3: StageDefinition = {
  id: 'stage-3-chrome-meridian',
  title: 'Chrome Meridian',
  theme: 'chrome-meridian',
  events: [
    {
      id: 's3:event:traffic-split',
      atTick: 50,
      kind: 'wave',
      wave: wave('s3:wave:traffic-split', [
        { id: 'a', kind: 'drifter', x: 74, y: -20, hp: 14, vy: 138, path: 'drift', scoreValue: 220, pattern: spread(50, 3, 126, 0.4) },
        { id: 'b', kind: 'drifter', x: 156, y: -48, hp: 14, vy: 142, path: 'drift', scoreValue: 220 },
        { id: 'c', kind: 'drifter', x: 240, y: -76, hp: 16, vy: 146, path: 'drift', scoreValue: 250, drop: 'score', pattern: spread(46, 5, 130, 0.54) },
        { id: 'd', kind: 'drifter', x: 324, y: -48, hp: 14, vy: 142, path: 'drift', scoreValue: 220 },
        { id: 'e', kind: 'drifter', x: 406, y: -20, hp: 14, vy: 138, path: 'drift', scoreValue: 220, pattern: spread(50, 3, 126, 0.4) },
      ]),
    },
    {
      id: 's3:event:rooftop-chasers',
      atTick: 170,
      kind: 'wave',
      wave: wave('s3:wave:rooftop-chasers', [
        { id: 'left', kind: 'chaser', x: 90, y: -24, hp: 22, vy: 112, path: 'chase', scoreValue: 310, pattern: spread(48, 3, 148, 0.44) },
        { id: 'right', kind: 'chaser', x: 390, y: -58, hp: 22, vy: 112, path: 'chase', scoreValue: 310, drop: 'power', pattern: spread(48, 3, 148, 0.44) },
      ]),
    },
    {
      id: 's3:event:city-crossfire',
      atTick: 300,
      kind: 'wave',
      wave: wave('s3:wave:city-crossfire', [
        { id: 'turret-a', kind: 'turret', x: 70, y: -16, hp: 30, vy: 60, path: 'straight', scoreValue: 390, pattern: spread(42, 7, 136, 0.9) },
        { id: 'runner-a', kind: 'drifter', x: 172, y: -48, hp: 18, vy: 150, path: 'drift', scoreValue: 260, pattern: spread(54, 3, 132, 0.46) },
        { id: 'runner-b', kind: 'drifter', x: 308, y: -48, hp: 18, vy: 150, path: 'drift', scoreValue: 260, pattern: spread(54, 3, 132, 0.46) },
        { id: 'turret-b', kind: 'turret', x: 410, y: -16, hp: 30, vy: 60, path: 'straight', scoreValue: 390, drop: 'bomb', pattern: spread(42, 7, 136, 0.9) },
      ]),
    },
    {
      id: 's3:event:pursuit-net',
      atTick: 450,
      kind: 'wave',
      wave: wave('s3:wave:pursuit-net', [
        { id: 'c1', kind: 'chaser', x: 105, y: -20, hp: 24, vy: 120, path: 'chase', scoreValue: 340, pattern: spread(42, 5, 145, 0.56) },
        { id: 'c2', kind: 'chaser', x: 240, y: -60, hp: 26, vy: 124, path: 'chase', scoreValue: 380, drop: 'score', pattern: spread(38, 5, 150, 0.6) },
        { id: 'c3', kind: 'chaser', x: 375, y: -20, hp: 24, vy: 120, path: 'chase', scoreValue: 340, pattern: spread(42, 5, 145, 0.56) },
      ]),
    },
    { id: 's3:event:skyline-pursuer', atTick: 610, kind: 'midboss', encounter: SKYLINE_PURSUER_ENCOUNTER },
    {
      id: 's3:event:rain-grid',
      atTick: 760,
      kind: 'wave',
      wave: wave('s3:wave:rain-grid', [
        { id: 'a', kind: 'drifter', x: 78, y: -18, hp: 20, vy: 154, path: 'drift', scoreValue: 290, pattern: spread(44, 5, 140, 0.62) },
        { id: 'b', kind: 'chaser', x: 184, y: -48, hp: 26, vy: 126, path: 'chase', scoreValue: 370, pattern: spread(40, 5, 148, 0.62) },
        { id: 'c', kind: 'chaser', x: 296, y: -48, hp: 26, vy: 126, path: 'chase', scoreValue: 370, drop: 'power', pattern: spread(40, 5, 148, 0.62) },
        { id: 'd', kind: 'drifter', x: 402, y: -18, hp: 20, vy: 154, path: 'drift', scoreValue: 290, pattern: spread(44, 5, 140, 0.62) },
      ]),
    },
    {
      id: 's3:event:municipal-escort',
      atTick: 930,
      kind: 'wave',
      wave: wave('s3:wave:municipal-escort', [
        { id: 'left', kind: 'turret', x: 82, y: -18, hp: 36, vy: 64, path: 'straight', scoreValue: 460, pattern: spread(36, 7, 145, 0.92) },
        { id: 'center', kind: 'chaser', x: 240, y: -62, hp: 30, vy: 130, path: 'chase', scoreValue: 420, drop: 'score', pattern: spread(34, 7, 150, 0.72) },
        { id: 'right', kind: 'turret', x: 398, y: -18, hp: 36, vy: 64, path: 'straight', scoreValue: 460, pattern: spread(36, 7, 145, 0.92) },
      ]),
    },
    { id: 's3:event:municipal-ghost', atTick: 1180, kind: 'boss', encounter: MUNICIPAL_GHOST_ENCOUNTER },
  ],
}
