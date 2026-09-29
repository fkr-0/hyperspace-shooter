import { describe, expect, it } from 'vitest'
import { createHyperblastSimulation } from './simulation'
import { createStageScheduler, stepStageScheduler, validateStageDefinition } from './stage'
import { QUEEN_RECURSOR_PHASES, STAGE_4 } from './stage4'
import { HYPERBLAST_ENGINE_PHASES, STAGE_5 } from './stage5'

const fire = Object.freeze({
  left: false,
  right: false,
  up: false,
  down: false,
  focus: true,
  fire: true,
  bomb: false,
})

describe.each([
  ['Stage 4', STAGE_4, QUEEN_RECURSOR_PHASES.length],
  ['Stage 5', STAGE_5, HYPERBLAST_ENGINE_PHASES.length],
] as const)('%s terminal campaign content', (_label, stage, finalPhaseCount) => {
  it('has an ordered deterministic schedule with one stable firing tick per event', () => {
    expect(validateStageDefinition(stage)).toEqual([])
    const scheduler = createStageScheduler(stage)
    const fired: Array<Readonly<{ id: string; tick: number }>> = []
    const finalTick = stage.events.at(-1)?.atTick ?? 0
    for (let tick = 1; tick <= finalTick; tick += 1) {
      for (const event of stepStageScheduler(scheduler)) fired.push({ id: event.id, tick })
    }
    expect(fired).toEqual(stage.events.map((event) => ({ id: event.id, tick: event.atTick })))
  })

  it('clears every final-boss phase exactly once and reproduces the same final snapshot', () => {
    const run = () => {
      const simulation = createHyperblastSimulation({ seed: `${stage.id}:terminal-test`, stageDefinition: stage })
      simulation.startRun()
      simulation.weapon.powerLevel = 3
      simulation.state.player.invulnerableTicks = 40_000
      for (let tick = 0; tick < 20_000 && simulation.state.mode !== 'result'; tick += 1) simulation.step(fire)
      return simulation
    }

    const first = run()
    const second = run()
    expect(first.state.mode).toBe('result')
    expect(first.state.stats.bossPhaseClearTicks).toHaveLength(finalPhaseCount)
    expect(first.state.stats.bossPhaseClearTicks.every((ticks) => ticks > 0)).toBe(true)
    expect(first.state.enemies).toHaveLength(0)
    expect(first.projectiles.values().filter((projectile) => projectile.kind === 'enemy')).toHaveLength(0)
    expect(second.snapshot()).toEqual(first.snapshot())
    expect(second.hash()).toBe(first.hash())
  })
})

describe('Stage 4/5 identity and pressure', () => {
  it('uses accelerating hive projectile grammar in Stage 4 without changing the shared pattern authority', () => {
    const patterns = STAGE_4.events.flatMap((event) =>
      event.kind === 'wave'
        ? event.wave.enemies.map((enemy) => enemy.pattern).filter((pattern) => pattern !== undefined)
        : event.encounter.phases.map((phase) => phase.pattern),
    )
    expect(patterns.some((pattern) => (pattern.acceleration ?? 0) > 0)).toBe(true)
    expect(Math.min(...QUEEN_RECURSOR_PHASES.map((phase) => phase.pattern.cadenceTicks))).toBeGreaterThanOrEqual(32)
    expect(Math.max(...QUEEN_RECURSOR_PHASES.map((phase) => phase.pattern.count))).toBeLessThanOrEqual(8)
    expect(Math.max(...QUEEN_RECURSOR_PHASES.map((phase) => phase.pattern.speed))).toBeLessThanOrEqual(98)
  })

  it('remixes all four minor enemy grammars and six readable final phases in Stage 5', () => {
    const kinds = new Set(
      STAGE_5.events.flatMap((event) => (event.kind === 'wave' ? event.wave.enemies.map((enemy) => enemy.kind) : [])),
    )
    expect(kinds).toEqual(new Set(['drifter', 'turret', 'shield', 'chaser']))
    expect(HYPERBLAST_ENGINE_PHASES.map((phase) => phase.id)).toEqual([
      'hyperblast-engine:vector-memory',
      'hyperblast-engine:furnace-memory',
      'hyperblast-engine:meridian-memory',
      'hyperblast-engine:hive-memory',
      'hyperblast-engine:hyperglass-collapse',
      'hyperblast-engine:final-survival',
    ])
    expect(Math.min(...HYPERBLAST_ENGINE_PHASES.map((phase) => phase.pattern.cadenceTicks))).toBeGreaterThanOrEqual(40)
    expect(Math.max(...HYPERBLAST_ENGINE_PHASES.map((phase) => phase.pattern.count))).toBeLessThanOrEqual(8)
    expect(Math.max(...HYPERBLAST_ENGINE_PHASES.map((phase) => phase.pattern.speed))).toBeLessThanOrEqual(118)
  })
})
