import { describe, expect, it } from 'vitest'
import { ENEMY_SOFT_CAP, PICKUP_SOFT_CAP, PROJECTILE_CAPACITY } from './constants'
import { createHyperblastSimulation } from './simulation'
import { STAGE_1 } from './stage1'
import { STAGE_2 } from './stage2'
import { STAGE_3 } from './stage3'
import { STAGE_4 } from './stage4'
import { STAGE_5 } from './stage5'

const combatInput = {
  left: false,
  right: false,
  up: false,
  down: false,
  focus: true,
  fire: true,
  bomb: false,
}

describe.each([STAGE_1, STAGE_2, STAGE_3, STAGE_4, STAGE_5])('$title bounded simulation soak', (stage) => {
  it('clears without unbounded entity/projectile growth and records simulation cost', () => {
    const simulation = createHyperblastSimulation({ seed: `${stage.id}:soak`, stageDefinition: stage })
    simulation.startRun()
    simulation.weapon.powerLevel = 3
    simulation.state.player.invulnerableTicks = 30_000

    const started = performance.now()
    for (let tick = 0; tick < 10_000 && simulation.state.mode !== 'result'; tick += 1) {
      simulation.step(combatInput)
    }
    const elapsedMs = performance.now() - started
    const meanStepMs = elapsedMs / Math.max(1, simulation.metrics.steps)

    console.info(
      'hyperblast-stage-soak',
      JSON.stringify({ stageId: stage.id, ...simulation.metrics, elapsedMs: Number(elapsedMs.toFixed(3)), meanStepMs: Number(meanStepMs.toFixed(6)) }),
    )

    expect(simulation.state.mode).toBe('result')
    expect(simulation.metrics.maxProjectiles).toBeLessThan(PROJECTILE_CAPACITY)
    expect(simulation.metrics.maxEnemies).toBeLessThanOrEqual(ENEMY_SOFT_CAP)
    expect(simulation.metrics.maxPickups).toBeLessThanOrEqual(PICKUP_SOFT_CAP)
    expect(simulation.projectiles.snapshot().capacity).toBe(PROJECTILE_CAPACITY)
  })
})
