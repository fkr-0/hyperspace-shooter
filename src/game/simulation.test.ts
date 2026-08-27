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
}

function runPartitions(partitions: readonly number[]) {
  const simulation = createHyperblastSimulation({ seed: 'partition-test' })
  const loop = createFixedStepLoop({
    fixedStep: FIXED_STEP_SECONDS,
    maxFrame: 1,
    update: (delta) => simulation.step(heldInput, delta),
    render: () => {},
  })
  for (const elapsed of partitions) loop.advance(elapsed)
  return simulation.snapshot()
}

describe('fixed-step simulation', () => {
  it('is repeatable across equivalent elapsed-time partitions', () => {
    const fine = Array.from({ length: 60 }, () => FIXED_STEP_SECONDS)
    const coarse = Array.from({ length: 10 }, () => 0.1)
    expect(runPartitions(coarse)).toEqual(runPartitions(fine))
  })
})
