import { createProjectilePool } from '@arcade/runtime/core'
import { PLAYFIELD, PROJECTILE_CAPACITY } from './constants'
import type { Projectile, ProjectileSpawn } from './types'

export type ProjectileSystem = ReturnType<typeof createProjectileSystem>

function resetProjectile(projectile: Projectile): void {
  projectile.active = false
  projectile.grazedByPlayerId = null
  projectile.ageTicks = 0
}

export function createProjectileSystem(capacity = PROJECTILE_CAPACITY) {
  const pool = createProjectilePool<Projectile>({
    capacity,
    create: (index) => ({
      id: `projectile:${index}:0`,
      kind: 'enemy',
      active: false,
      x: 0,
      y: 0,
      previousX: 0,
      previousY: 0,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: 0,
      radius: 3,
      damage: 1,
      ageTicks: 0,
      lifetimeTicks: 240,
      grazedByPlayerId: null,
    }),
    reset: resetProjectile,
  })

  return {
    spawn(spec: ProjectileSpawn): Projectile {
      return pool.spawn((projectile, context) => {
        projectile.id = `${spec.kind}:${context.index}:${context.generation}`
        projectile.kind = spec.kind
        projectile.active = true
        projectile.x = spec.x
        projectile.y = spec.y
        projectile.previousX = spec.x
        projectile.previousY = spec.y
        projectile.vx = spec.vx
        projectile.vy = spec.vy
        projectile.ax = spec.ax ?? 0
        projectile.ay = spec.ay ?? 0
        projectile.radius = spec.radius ?? (spec.kind === 'player' ? 2 : 4)
        projectile.damage = spec.damage ?? 1
        projectile.ageTicks = 0
        projectile.lifetimeTicks = spec.lifetimeTicks ?? 240
        projectile.grazedByPlayerId = null
      })
    },
    despawn(projectile: Projectile): boolean {
      projectile.active = false
      return pool.despawn(projectile)
    },
    step(delta: number): number {
      return pool.step(
        delta,
        (projectile, stepDelta) => {
          projectile.previousX = projectile.x
          projectile.previousY = projectile.y
          projectile.vx += projectile.ax * stepDelta
          projectile.vy += projectile.ay * stepDelta
          projectile.x += projectile.vx * stepDelta
          projectile.y += projectile.vy * stepDelta
          projectile.ageTicks += 1
          if (
            projectile.ageTicks >= projectile.lifetimeTicks ||
            projectile.x < -48 ||
            projectile.x > PLAYFIELD.width + 48 ||
            projectile.y < -48 ||
            projectile.y > PLAYFIELD.height + 48
          ) {
            projectile.active = false
          }
        },
      )
    },
    values(): Projectile[] {
      return pool.activeValues()
    },
    clear(): number {
      return pool.clear()
    },
    clearKind(kind: Projectile['kind']): number {
      let cleared = 0
      for (const projectile of pool.activeValues()) {
        if (projectile.kind !== kind) continue
        if (pool.despawn(projectile)) cleared += 1
      }
      return cleared
    },
    snapshot() {
      return pool.snapshot()
    },
  }
}

export function resetProjectileGraze(projectile: Projectile): void {
  projectile.grazedByPlayerId = null
}
