import { createFixedStepLoop } from '@arcade/runtime/core'
import { describe, expect, it } from 'vitest'
import { FIXED_STEP_SECONDS } from './constants'
import { createHyperblastSimulation } from './simulation'

const heldInput = {
  left: false,
  right: true,
  up: true,
  down: false,
  focus: false,
  fire: true,
  bomb: false,
}

function runPartitions(partitions: readonly number[]) {
  const simulation = createHyperblastSimulation({ seed: 'partition-test' })
  simulation.startRun()
  const loop = createFixedStepLoop({
    fixedStep: FIXED_STEP_SECONDS,
    maxFrame: 1,
    update: (delta) => simulation.step(heldInput, delta),
    render: () => {},
  })
  for (const elapsed of partitions) loop.advance(elapsed)
  return simulation.snapshot()
}

function runCommandScript(seed: string) {
  const simulation = createHyperblastSimulation({ seed })
  simulation.startRun()
  simulation.state.player.invulnerableTicks = 10_000
  for (let tick = 0; tick < 1_800; tick += 1) {
    simulation.step({
      left: tick % 240 >= 120,
      right: tick % 240 < 120,
      up: tick % 180 < 60,
      down: false,
      focus: tick % 90 < 45,
      fire: true,
      bomb: tick === 500 || tick === 1_200,
    })
  }
  return { snapshot: simulation.snapshot(), hash: simulation.hash() }
}

describe('fixed-step simulation', () => {
  it('is repeatable across equivalent elapsed-time partitions', () => {
    const fine = Array.from({ length: 60 }, () => FIXED_STEP_SECONDS)
    const coarse = Array.from({ length: 10 }, () => 0.1)
    expect(runPartitions(coarse)).toEqual(runPartitions(fine))
  })

  it('replays the same seed and input commands to exact state equality', () => {
    const first = runCommandScript('same-stage-seed')
    const second = runCommandScript('same-stage-seed')
    expect(first.snapshot).toEqual(second.snapshot)
    expect(first.hash).toBe(second.hash)
  })
})
