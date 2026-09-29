import { describe, expect, it } from 'vitest'
import { createHyperblastSimulation } from './simulation'
import { createStageScheduler, stepStageScheduler, validateStageDefinition } from './stage'
import { STAGE_1, VECTOR_WARDEN_PHASES } from './stage1'

const idle = {
  left: false,
  right: false,
  up: false,
  down: false,
  focus: false,
  fire: false,
  bomb: false,
}

describe('Stage 1 authored schedule', () => {
  it('has stable unique event/wave IDs and fires exactly on authored ticks', () => {
    expect(validateStageDefinition(STAGE_1)).toEqual([])
    const eventIds = STAGE_1.events.map((event) => event.id)
    const waveIds = STAGE_1.events.filter((event) => event.kind === 'wave').map((event) => event.wave.id)
    expect(new Set(eventIds).size).toBe(eventIds.length)
    expect(new Set(waveIds).size).toBe(waveIds.length)

    const scheduler = createStageScheduler(STAGE_1)
    const fired: Array<Readonly<{ id: string; tick: number }>> = []
    for (let tick = 1; tick <= 1200; tick += 1) {
      for (const event of stepStageScheduler(scheduler)) fired.push({ id: event.id, tick })
    }
    expect(fired).toEqual(STAGE_1.events.map((event) => ({ id: event.id, tick: event.atTick })))
  })

  it('advances Vector Warden through every phase exactly once and reaches a result', () => {
    const simulation = createHyperblastSimulation({ seed: 'boss-gate-test' })
    simulation.startRun()
    simulation.weapon.powerLevel = 3
    simulation.state.player.invulnerableTicks = 20_000
    const seenPhases: number[] = []

    for (let tick = 0; tick < 8_000 && simulation.state.mode !== 'result'; tick += 1) {
      simulation.step({ ...idle, fire: true })
      const boss = simulation.state.enemies.find((enemy) => enemy.kind === 'vector-warden')?.boss
      if (boss && seenPhases.at(-1) !== boss.phaseIndex) seenPhases.push(boss.phaseIndex)
    }

    expect(seenPhases).toEqual(VECTOR_WARDEN_PHASES.map((_, index) => index))
    expect(simulation.state.mode).toBe('result')
    expect(simulation.state.result).not.toBeNull()
    expect(simulation.state.stats.bossPhaseClearTicks).toHaveLength(VECTOR_WARDEN_PHASES.length)
    expect(simulation.state.stats.bossPhaseClearTicks.every((ticks) => ticks > 0)).toBe(true)
  })

  it('consumes bombs on input edges and gives life-loss respawn invulnerability', () => {
    const simulation = createHyperblastSimulation({ seed: 'survival-invariants' })
    simulation.startRun()

    simulation.step({ ...idle, bomb: true })
    simulation.step({ ...idle, bomb: true })
    expect(simulation.state.player.bombs).toBe(2)
    expect(simulation.state.stats.bombsUsed).toBe(1)
    simulation.step(idle)
    simulation.step({ ...idle, bomb: true })
    expect(simulation.state.player.bombs).toBe(1)
    expect(simulation.state.stats.bombsUsed).toBe(2)

    simulation.state.player.invulnerableTicks = 0
    simulation.projectiles.spawn({
      kind: 'enemy',
      x: simulation.state.player.x,
      y: simulation.state.player.y,
      vx: 0,
      vy: 0,
    })
    simulation.step(idle)
    expect(simulation.state.player.lives).toBe(2)
    expect(simulation.state.player.invulnerableTicks).toBeGreaterThan(0)

    simulation.projectiles.spawn({
      kind: 'enemy',
      x: simulation.state.player.x,
      y: simulation.state.player.y,
      vx: 0,
      vy: 0,
    })
    simulation.step(idle)
    expect(simulation.state.player.lives).toBe(2)
    expect(simulation.state.stats.livesLost).toBe(1)
  })
})
