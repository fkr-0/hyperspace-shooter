import { createDeterministicRng, rngRange } from '@arcade/runtime'
import type { ProjectileSystem } from './projectiles'
import type { PatternDefinition, PatternEmitterState } from './types'

const TAU = Math.PI * 2

export function createPatternEmitter(
  id: string,
  definition: PatternDefinition,
  seed: number | string,
): PatternEmitterState {
  return {
    id,
    definition,
    ticksUntilShot: Math.max(0, definition.warmupTicks ?? 0),
    emissionIndex: 0,
    rng: createDeterministicRng(`${String(seed)}:${id}`),
  }
}

function patternAngle(
  definition: PatternDefinition,
  emissionIndex: number,
  projectileIndex: number,
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
): number {
  const aimed = Math.atan2(targetY - originY, targetX - originX)
  const offset = definition.angleOffset ?? 0
  if (definition.kind === 'ring' || definition.kind === 'spiral') {
    const phase = definition.kind === 'spiral' ? emissionIndex * (definition.phaseStep ?? 0.12) : 0
    return offset + phase + (TAU * projectileIndex) / definition.count
  }

  if (definition.count <= 1) return aimed + offset
  const spread = definition.spreadRadians ?? Math.PI / 4
  const fraction = projectileIndex / (definition.count - 1) - 0.5
  return aimed + offset + fraction * spread
}

export function stepPatternEmitter(
  emitter: PatternEmitterState,
  projectiles: ProjectileSystem,
  origin: Readonly<{ x: number; y: number }>,
  target: Readonly<{ x: number; y: number }>,
): number {
  if (emitter.ticksUntilShot > 0) {
    emitter.ticksUntilShot -= 1
    return 0
  }

  const definition = emitter.definition
  const count = Math.max(1, Math.floor(definition.count))
  for (let index = 0; index < count; index += 1) {
    let angle = patternAngle(
      definition,
      emitter.emissionIndex,
      index,
      origin.x,
      origin.y,
      target.x,
      target.y,
    )
    let speed = definition.speed
    if (definition.kind === 'random-spread') {
      const angleRoll = rngRange(emitter.rng, -(definition.jitterAngle ?? 0.08), definition.jitterAngle ?? 0.08)
      emitter.rng = angleRoll.state
      angle += angleRoll.value
      const speedRoll = rngRange(emitter.rng, -(definition.jitterSpeed ?? 8), definition.jitterSpeed ?? 8)
      emitter.rng = speedRoll.state
      speed += speedRoll.value
    }

    projectiles.spawn({
      kind: 'enemy',
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: definition.radius ?? 4,
      lifetimeTicks: definition.lifetimeTicks ?? 360,
    })
  }

  emitter.emissionIndex += 1
  emitter.ticksUntilShot = Math.max(1, Math.floor(definition.cadenceTicks)) - 1
  return count
}
