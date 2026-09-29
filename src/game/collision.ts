import type { ProjectileSystem } from './projectiles'
import type { PlayerState, Projectile, TargetState } from './types'

export type PlayerProjectileContact = 'hit' | 'graze' | 'none'

export function classifyPlayerProjectileContact(
  player: PlayerState,
  projectile: Projectile,
): PlayerProjectileContact {
  const distanceX = projectile.x - player.x
  const distanceY = projectile.y - player.y
  const distanceSquared = distanceX * distanceX + distanceY * distanceY
  const hitDistance = player.damageRadius + projectile.radius
  if (distanceSquared <= hitDistance * hitDistance) return 'hit'
  const grazeDistance = player.grazeRadius + projectile.radius
  if (distanceSquared <= grazeDistance * grazeDistance) return 'graze'
  return 'none'
}

export function resolveHostileProjectileContacts(
  player: PlayerState,
  projectiles: ProjectileSystem,
  options?: Readonly<{ canTakeHit?: boolean; canGraze?: boolean }>,
): Readonly<{ hits: number; grazes: number }> {
  let hits = 0
  let grazes = 0
  const hostile = projectiles
    .values()
    .filter((projectile) => projectile.kind === 'enemy')
    .sort((left, right) => left.id.localeCompare(right.id))

  for (const projectile of hostile) {
    const contact = classifyPlayerProjectileContact(player, projectile)
    if (contact === 'hit') {
      if (options?.canTakeHit ?? true) {
        hits += 1
        projectiles.despawn(projectile)
      }
      continue
    }
    if (
      (options?.canGraze ?? true) &&
      contact === 'graze' &&
      projectile.grazedByPlayerId !== player.id
    ) {
      projectile.grazedByPlayerId = player.id
      grazes += 1
    }
  }
  return { hits, grazes }
}

function circleIntersectsAabb(projectile: Projectile, target: TargetState): boolean {
  const halfWidth = target.width / 2
  const halfHeight = target.height / 2
  const closestX = Math.max(target.x - halfWidth, Math.min(target.x + halfWidth, projectile.x))
  const closestY = Math.max(target.y - halfHeight, Math.min(target.y + halfHeight, projectile.y))
  const distanceX = projectile.x - closestX
  const distanceY = projectile.y - closestY
  return distanceX * distanceX + distanceY * distanceY <= projectile.radius * projectile.radius
}

export function resolvePlayerProjectileTargets(
  projectiles: ProjectileSystem,
  targets: readonly TargetState[],
): Readonly<{ targetId: string; damage: number; projectileId: string }>[] {
  const hits: { targetId: string; damage: number; projectileId: string }[] = []
  const orderedTargets = [...targets].filter((target) => target.active).sort((a, b) => a.id.localeCompare(b.id))
  const orderedProjectiles = projectiles
    .values()
    .filter((projectile) => projectile.kind === 'player')
    .sort((a, b) => a.id.localeCompare(b.id))

  for (const projectile of orderedProjectiles) {
    for (const target of orderedTargets) {
      if (!circleIntersectsAabb(projectile, target)) continue
      hits.push({ targetId: target.id, damage: projectile.damage, projectileId: projectile.id })
      projectiles.despawn(projectile)
      break
    }
  }
  return hits
}
