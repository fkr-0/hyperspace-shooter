import { createFixedStepLoop } from '@arcade/runtime/core'
import { describe, expect, it } from 'vitest'

describe('Hyperblast scaffold', () => {
  it('consumes the shared deterministic fixed-step runtime', () => {
    let updates = 0
    let renders = 0

    const loop = createFixedStepLoop({
      fixedStep: 1 / 60,
      update: () => {
        updates += 1
      },
      render: () => {
        renders += 1
      },
    })

    const result = loop.advance(1 / 60)

    expect(result.updates).toBe(1)
    expect(updates).toBe(1)
    expect(renders).toBe(1)
  })
})
