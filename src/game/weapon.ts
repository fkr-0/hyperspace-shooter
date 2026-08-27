import { PLAYER_PROJECTILE_SPEED, PLAYER_SHOT_CADENCE_TICKS } from './constants'
import type { ProjectileSystem } from './projectiles'
import type { PlayerState } from './types'

export type WeaponEmitterState = {
  family: 'baseline'
  powerLevel: number
}

export function createBaselineWeaponEmitter(): WeaponEmitterState {
  return { family: 'baseline', powerLevel: 1 }
}

export function stepBaselineWeapon(
  player: PlayerState,
  emitter: WeaponEmitterState,
  projectiles: ProjectileSystem,
): number {
  if (player.shotCooldownTicks > 0) player.shotCooldownTicks -= 1
  if (!player.firing || player.shotCooldownTicks > 0) return 0

  player.shotCooldownTicks = PLAYER_SHOT_CADENCE_TICKS
  const lateralOffset = player.focus ? 4 : 7
  const damage = 2 + Math.max(0, emitter.powerLevel - 1)
  for (const offset of [-lateralOffset, lateralOffset]) {
    projectiles.spawn({
      kind: 'player',
      x: player.x + offset,
      y: player.y - 16,
      vx: 0,
      vy: -PLAYER_PROJECTILE_SPEED,
      radius: 2,
      damage,
      lifetimeTicks: 90,
    })
  }
  return 2
}
