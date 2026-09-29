import type { BossEncounterDefinition, StageDefinition, StageWaveDefinition } from './stage'
import type { BossPhaseDefinition, PatternDefinition } from './types'

function spread(cadenceTicks: number, count: number, speed: number, radians: number): PatternDefinition {
  return {
    kind: 'spread',
    cadenceTicks: Math.ceil(cadenceTicks * 1.28),
    warmupTicks: 16,
    count: Math.max(3, count - 2),
    speed: Math.min(speed, 128),
    spreadRadians: radians,
    radius: 4,
    lifetimeTicks: 360,
  }
}

function wave(id: string, enemies: StageWaveDefinition['enemies']): StageWaveDefinition {
  return { id, enemies }
}

export const ECHO_COMPOSITE_PHASES: readonly BossPhaseDefinition[] = [
  {
    id: 'echo-composite:relay-ring',
    hp: 190,
    timeoutTicks: 960,
    pattern: { kind: 'ring', cadenceTicks: 62, warmupTicks: 18, count: 7, speed: 94, phaseStep: 0.09, radius: 4 },
  },
  {
    id: 'echo-composite:city-pursuit',
    hp: 205,
    timeoutTicks: 1020,
    pattern: {
      kind: 'random-spread',
      cadenceTicks: 54,
      warmupTicks: 18,
      count: 3,
      speed: 100,
      spreadRadians: 0.9,
      jitterAngle: 0.06,
      jitterSpeed: 8,
      radius: 4,
    },
  },
  {
    id: 'echo-composite:hive-spiral',
    hp: 220,
    timeoutTicks: 1080,
    pattern: { kind: 'spiral', cadenceTicks: 48, warmupTicks: 18, count: 3, speed: 90, acceleration: 1, phaseStep: 0.18, radius: 4 },
  },
]

export const HYPERBLAST_ENGINE_PHASES: readonly BossPhaseDefinition[] = [
  {
    id: 'hyperblast-engine:vector-memory',
    hp: 180,
    timeoutTicks: 1140,
    pattern: spread(56, 5, 108, 0.92),
  },
  {
    id: 'hyperblast-engine:furnace-memory',
    hp: 190,
    timeoutTicks: 1200,
    pattern: { kind: 'ring', cadenceTicks: 62, warmupTicks: 16, count: 7, speed: 96, phaseStep: 0.12, radius: 4, lifetimeTicks: 360 },
  },
  {
    id: 'hyperblast-engine:meridian-memory',
    hp: 200,
    timeoutTicks: 1260,
    pattern: {
      kind: 'random-spread',
      cadenceTicks: 60,
      warmupTicks: 16,
      count: 3,
      speed: 100,
      spreadRadians: 1.0,
      jitterAngle: 0.07,
      jitterSpeed: 8,
      radius: 4,
      lifetimeTicks: 330,
    },
  },
  {
    id: 'hyperblast-engine:hive-memory',
    hp: 210,
    timeoutTicks: 1320,
    pattern: { kind: 'spiral', cadenceTicks: 54, warmupTicks: 16, count: 3, speed: 88, acceleration: 0.7, phaseStep: 0.205, radius: 4, lifetimeTicks: 330 },
  },
  {
    id: 'hyperblast-engine:hyperglass-collapse',
    hp: 220,
    timeoutTicks: 1380,
    pattern: { kind: 'spiral', cadenceTicks: 52, warmupTicks: 14, count: 3, speed: 92, phaseStep: 0.143, radius: 4, lifetimeTicks: 320 },
  },
  {
    id: 'hyperblast-engine:final-survival',
    hp: 230,
    timeoutTicks: 1500,
    pattern: {
      kind: 'random-spread',
      cadenceTicks: 58,
      warmupTicks: 14,
      count: 3,
      speed: 98,
      spreadRadians: 1.1,
      jitterAngle: 0.06,
      jitterSpeed: 7,
      radius: 4,
      lifetimeTicks: 300,
    },
  },
]

export const ECHO_COMPOSITE_ENCOUNTER: BossEncounterDefinition = {
  id: 's5:boss:echo-composite',
  kind: 'echo-composite',
  phases: ECHO_COMPOSITE_PHASES,
  scoreValue: 10_000,
  drop: 'power',
  y: 112,
  amplitude: 104,
}

export const HYPERBLAST_ENGINE_ENCOUNTER: BossEncounterDefinition = {
  id: 's5:boss:hyperblast-engine',
  kind: 'hyperblast-engine',
  phases: HYPERBLAST_ENGINE_PHASES,
  scoreValue: 25_000,
  y: 104,
  amplitude: 118,
}

export const STAGE_5: StageDefinition = {
  id: 'stage-5-hyperglass-corridor',
  title: 'Hyperglass Corridor',
  theme: 'hyperglass-corridor',
  events: [
    {
      id: 's5:event:vector-echo',
      atTick: 40,
      kind: 'wave',
      wave: wave('s5:wave:vector-echo', [
        { id: 'a', kind: 'drifter', x: 86, y: -18, hp: 20, vy: 150, path: 'drift', scoreValue: 330, pattern: spread(44, 5, 154, 0.68) },
        { id: 'b', kind: 'drifter', x: 176, y: -48, hp: 20, vy: 154, path: 'drift', scoreValue: 330 },
        { id: 'c', kind: 'drifter', x: 304, y: -48, hp: 20, vy: 154, path: 'drift', scoreValue: 330, drop: 'score' },
        { id: 'd', kind: 'drifter', x: 394, y: -18, hp: 20, vy: 150, path: 'drift', scoreValue: 330, pattern: spread(44, 5, 154, 0.68) },
      ]),
    },
    {
      id: 's5:event:furnace-echo',
      atTick: 125,
      kind: 'wave',
      wave: wave('s5:wave:furnace-echo', [
        { id: 'left', kind: 'turret', x: 76, y: -18, hp: 36, vy: 62, path: 'straight', scoreValue: 520, pattern: spread(38, 7, 152, 0.92) },
        { id: 'shield', kind: 'shield', x: 240, y: -58, hp: 28, shieldHp: 38, vy: 94, path: 'drift', scoreValue: 480, drop: 'power', pattern: spread(46, 5, 140, 0.66) },
        { id: 'right', kind: 'turret', x: 404, y: -18, hp: 36, vy: 62, path: 'straight', scoreValue: 520, pattern: spread(38, 7, 152, 0.92) },
      ]),
    },
    {
      id: 's5:event:meridian-echo',
      atTick: 220,
      kind: 'wave',
      wave: wave('s5:wave:meridian-echo', [
        { id: 'c1', kind: 'chaser', x: 100, y: -22, hp: 28, vy: 128, path: 'chase', scoreValue: 440, pattern: spread(34, 5, 160, 0.62) },
        { id: 'c2', kind: 'chaser', x: 240, y: -62, hp: 30, vy: 132, path: 'chase', scoreValue: 480, drop: 'bomb', pattern: spread(32, 7, 162, 0.76) },
        { id: 'c3', kind: 'chaser', x: 380, y: -22, hp: 28, vy: 128, path: 'chase', scoreValue: 440, pattern: spread(34, 5, 160, 0.62) },
      ]),
    },
    {
      id: 's5:event:hive-echo',
      atTick: 315,
      kind: 'wave',
      wave: wave('s5:wave:hive-echo', [
        { id: 's1', kind: 'shield', x: 120, y: -18, hp: 30, shieldHp: 42, vy: 96, path: 'drift', scoreValue: 500, pattern: { kind: 'spiral', cadenceTicks: 38, warmupTicks: 18, count: 3, speed: 98, acceleration: 1.5, phaseStep: 0.18, radius: 4 } },
        { id: 's2', kind: 'shield', x: 360, y: -52, hp: 30, shieldHp: 42, vy: 96, path: 'drift', scoreValue: 500, pattern: { kind: 'spiral', cadenceTicks: 38, warmupTicks: 18, count: 3, speed: 98, acceleration: 1.5, phaseStep: 0.18, radius: 4 } },
      ]),
    },
    { id: 's5:event:echo-composite', atTick: 520, kind: 'midboss', encounter: ECHO_COMPOSITE_ENCOUNTER },
    {
      id: 's5:event:split-memory',
      atTick: 660,
      kind: 'wave',
      wave: wave('s5:wave:split-memory', [
        { id: 't-left', kind: 'turret', x: 72, y: -18, hp: 40, vy: 64, path: 'straight', scoreValue: 580, pattern: spread(38, 7, 150, 0.96) },
        { id: 'c-left', kind: 'chaser', x: 172, y: -54, hp: 30, vy: 132, path: 'chase', scoreValue: 470, pattern: spread(38, 5, 154, 0.62) },
        { id: 'c-right', kind: 'chaser', x: 308, y: -54, hp: 30, vy: 132, path: 'chase', scoreValue: 470, drop: 'power', pattern: spread(38, 5, 154, 0.62) },
        { id: 't-right', kind: 'turret', x: 408, y: -18, hp: 40, vy: 64, path: 'straight', scoreValue: 580, pattern: spread(38, 7, 150, 0.96) },
      ]),
    },
    {
      id: 's5:event:glass-gauntlet',
      atTick: 820,
      kind: 'wave',
      wave: wave('s5:wave:glass-gauntlet', [
        { id: 'shield-left', kind: 'shield', x: 112, y: -22, hp: 34, shieldHp: 46, vy: 102, path: 'drift', scoreValue: 560, pattern: spread(40, 5, 140, 0.84) },
        { id: 'turret', kind: 'turret', x: 240, y: -66, hp: 46, vy: 68, path: 'straight', scoreValue: 660, drop: 'bomb', pattern: { kind: 'ring', cadenceTicks: 54, warmupTicks: 18, count: 8, speed: 104, phaseStep: 0.11, radius: 4 } },
        { id: 'shield-right', kind: 'shield', x: 368, y: -22, hp: 34, shieldHp: 46, vy: 102, path: 'drift', scoreValue: 560, pattern: spread(40, 5, 140, 0.84) },
      ]),
    },
    {
      id: 's5:event:final-approach',
      atTick: 1010,
      kind: 'wave',
      wave: wave('s5:wave:final-approach', [
        { id: 'a', kind: 'chaser', x: 92, y: -20, hp: 34, vy: 138, path: 'chase', scoreValue: 520, pattern: spread(34, 5, 156, 0.82) },
        { id: 'b', kind: 'shield', x: 188, y: -54, hp: 34, shieldHp: 48, vy: 106, path: 'drift', scoreValue: 590, drop: 'power', pattern: spread(36, 5, 144, 0.9) },
        { id: 'c', kind: 'shield', x: 292, y: -54, hp: 34, shieldHp: 48, vy: 106, path: 'drift', scoreValue: 590, drop: 'bomb', pattern: spread(36, 5, 144, 0.9) },
        { id: 'd', kind: 'chaser', x: 388, y: -20, hp: 34, vy: 138, path: 'chase', scoreValue: 520, drop: 'bomb', pattern: spread(34, 5, 156, 0.82) },
      ]),
    },
    { id: 's5:event:hyperblast-engine', atTick: 1240, kind: 'boss', encounter: HYPERBLAST_ENGINE_ENCOUNTER },
  ],
}
