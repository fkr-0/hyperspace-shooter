import { describe, expect, it } from 'vitest'
import { createPatternEmitter, stepPatternEmitter } from './patterns'
import { createProjectileSystem } from './projectiles'

function runPattern(seed: string) {
  const system = createProjectileSystem(64)
  const emitter = createPatternEmitter(
    'repeatability',
    {
      kind: 'random-spread',
      cadenceTicks: 3,
      count: 4,
      speed: 120,
      spreadRadians: 0.6,
      jitterAngle: 0.12,
      jitterSpeed: 14,
    },
    seed,
  )
  for (let tick = 0; tick < 10; tick += 1) {
    stepPatternEmitter(emitter, system, { x: 240, y: 100 }, { x: 230, y: 600 })
  }
  return system.values().map((projectile) => ({
    id: projectile.id,
    vx: projectile.vx,
    vy: projectile.vy,
  }))
}

describe('authored projectile patterns', () => {
  it('repeats exactly for the same seed and authored inputs', () => {
    expect(runPattern('same-seed')).toEqual(runPattern('same-seed'))
  })

  it('changes seeded random-spread output for a different seed', () => {
    expect(runPattern('seed-a')).not.toEqual(runPattern('seed-b'))
  })
})
