import { PLAYER_PROJECTILE_SPEED, PLAYER_SHOT_CADENCE_TICKS } from './constants'
import type { ProjectileSystem } from './projectiles'
import type { PlayerState } from './types'

export type WeaponEmitterState = {
  family: 'spread'
  powerLevel: number
}

export function createBaselineWeaponEmitter(): WeaponEmitterState {
  return { family: 'spread', powerLevel: 1 }
}

export function stepBaselineWeapon(
  player: PlayerState,
  emitter: WeaponEmitterState,
  projectiles: ProjectileSystem,
): number {
  if (player.shotCooldownTicks > 0) player.shotCooldownTicks -= 1
  if (!player.firing || player.shotCooldownTicks > 0) return 0

  player.shotCooldownTicks = PLAYER_SHOT_CADENCE_TICKS
  const power = Math.max(1, Math.min(3, Math.floor(emitter.powerLevel)))
  const spread = player.focus ? 4 : 8
  const offsets =
    power === 1
      ? [-spread, spread]
      : power === 2
        ? [-spread, 0, spread]
        : [-spread * 2, -spread, 0, spread, spread * 2]
  const damage = power >= 3 ? 3 : 2
  for (const offset of offsets) {
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
  return offsets.length
}

export function gainWeaponPower(emitter: WeaponEmitterState, amount = 1): number {
  emitter.powerLevel = Math.max(1, Math.min(3, emitter.powerLevel + Math.max(0, Math.floor(amount))))
  return emitter.powerLevel
}

export function loseWeaponPower(emitter: WeaponEmitterState, amount = 1): number {
  emitter.powerLevel = Math.max(1, emitter.powerLevel - Math.max(0, Math.floor(amount)))
  return emitter.powerLevel
}
