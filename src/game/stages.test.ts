import { describe, expect, it } from 'vitest'
import { createHyperblastSimulation } from './simulation'
import { createStageScheduler, stepStageScheduler, validateStageDefinition } from './stage'
import { STAGE_2, HELIX_FOUNDRY_PHASES } from './stage2'
import { STAGE_3, MUNICIPAL_GHOST_PHASES } from './stage3'

const fire = {
  left: false,
  right: false,
  up: false,
  down: false,
  focus: true,
  fire: true,
  bomb: false,
}

describe.each([
  ['Stage 2', STAGE_2, HELIX_FOUNDRY_PHASES.length],
  ['Stage 3', STAGE_3, MUNICIPAL_GHOST_PHASES.length],
] as const)('%s authored campaign slice', (_label, stage, finalPhaseCount) => {
  it('has a valid deterministic schedule with stable event IDs', () => {
    expect(validateStageDefinition(stage)).toEqual([])
    const scheduler = createStageScheduler(stage)
    const fired: Array<Readonly<{ id: string; tick: number }>> = []
    const finalTick = stage.events.at(-1)?.atTick ?? 0
    for (let tick = 1; tick <= finalTick; tick += 1) {
      for (const event of stepStageScheduler(scheduler)) fired.push({ id: event.id, tick })
    }
    expect(fired).toEqual(stage.events.map((event) => ({ id: event.id, tick: event.atTick })))
    expect(new Set(fired.map((event) => event.id)).size).toBe(fired.length)
  })

  it('reaches the authored final boss result with every phase gated exactly once', () => {
    const first = createHyperblastSimulation({ seed: `${stage.id}:campaign-test`, stageDefinition: stage })
    first.startRun()
    first.weapon.powerLevel = 3
    first.state.player.invulnerableTicks = 30_000

    for (let tick = 0; tick < 14_000 && first.state.mode !== 'result'; tick += 1) first.step(fire)

    expect(first.state.mode).toBe('result')
    expect(first.state.result?.stageId).toBe(stage.id)
    expect(first.state.stats.bossPhaseClearTicks).toHaveLength(finalPhaseCount)
    expect(first.state.stats.bossPhaseClearTicks.every((ticks) => ticks > 0)).toBe(true)

    const second = createHyperblastSimulation({ seed: `${stage.id}:campaign-test`, stageDefinition: stage })
    second.startRun()
    second.weapon.powerLevel = 3
    second.state.player.invulnerableTicks = 30_000
    for (let tick = 0; tick < 14_000 && second.state.mode !== 'result'; tick += 1) second.step(fire)
    expect(second.snapshot()).toEqual(first.snapshot())
    expect(second.hash()).toBe(first.hash())
  })
})

describe('Stage 2 shield grammar', () => {
  it('enters the mid-boss as a clean authored encounter without leftover minor emitters', () => {
    const simulation = createHyperblastSimulation({ seed: 'encounter-cleanup', stageDefinition: STAGE_2 })
    simulation.startRun()
    simulation.state.player.invulnerableTicks = 10_000
    for (let tick = 0; tick < 620; tick += 1) simulation.step({ ...fire, fire: false })

    expect(simulation.state.mode).toBe('midboss')
    expect(simulation.state.enemies).toHaveLength(1)
    expect(simulation.state.enemies[0]?.kind).toBe('dockmaster-array')
  })

  it('absorbs player damage before hull damage', () => {
    const simulation = createHyperblastSimulation({ seed: 'shield-order', stageDefinition: STAGE_2 })
    simulation.startRun()
    simulation.weapon.powerLevel = 3
    simulation.state.player.invulnerableTicks = 10_000

    for (let tick = 0; tick < 220; tick += 1) simulation.step({ ...fire, fire: false })
    const shield = simulation.state.enemies.find((enemy) => enemy.kind === 'shield')
    expect(shield).toBeDefined()
    if (!shield) return

    shield.x = simulation.state.player.x
    shield.baseX = shield.x
    shield.y = simulation.state.player.y - 82
    shield.vy = 0
    shield.path = 'straight'
    const startingShield = shield.shieldHp
    const startingHull = shield.hp
    for (let tick = 0; tick < 24 && shield.shieldHp === startingShield; tick += 1) simulation.step(fire)

    expect(shield.shieldHp).toBeLessThan(startingShield)
    expect(shield.hp).toBe(startingHull)
  })
})
