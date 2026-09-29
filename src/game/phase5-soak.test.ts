import { describe, expect, it } from 'vitest'
import { ENEMY_SOFT_CAP, PICKUP_SOFT_CAP, PROJECTILE_CAPACITY } from './constants'
import { createHyperblastSimulation } from './simulation'
import { STAGE_4 } from './stage4'
import { STAGE_5 } from './stage5'

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
  [STAGE_4.title, STAGE_4, 200],
  [STAGE_5.title, STAGE_5, 240],
] as const)('%s terminal bounded soak', (_title, stage, projectilePressureLimit) => {
  it('clears under the authored pressure envelope, fixed-step entity caps, and simulation mean budget', () => {
    const simulation = createHyperblastSimulation({ seed: `${stage.id}:phase5-soak`, stageDefinition: stage })
    simulation.startRun()
    simulation.weapon.powerLevel = 3
    simulation.state.player.invulnerableTicks = 40_000

    const started = performance.now()
    for (let tick = 0; tick < 20_000 && simulation.state.mode !== 'result'; tick += 1) simulation.step(fire)
    const elapsedMs = performance.now() - started
    const meanStepMs = elapsedMs / Math.max(1, simulation.metrics.steps)

    console.info(
      'hyperblast-phase5-soak',
      JSON.stringify({
        stageId: stage.id,
        ...simulation.metrics,
        elapsedMs: Number(elapsedMs.toFixed(3)),
        meanStepMs: Number(meanStepMs.toFixed(6)),
      }),
    )

    expect(simulation.state.mode).toBe('result')
    expect(simulation.metrics.maxProjectiles).toBeLessThan(PROJECTILE_CAPACITY)
    expect(simulation.metrics.maxProjectiles).toBeLessThanOrEqual(projectilePressureLimit)
    expect(simulation.metrics.maxEnemies).toBeLessThanOrEqual(ENEMY_SOFT_CAP)
    expect(simulation.metrics.maxPickups).toBeLessThanOrEqual(PICKUP_SOFT_CAP)
    expect(meanStepMs).toBeLessThan(2)
  })
})
