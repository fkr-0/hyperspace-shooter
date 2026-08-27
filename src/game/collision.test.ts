import { describe, expect, it } from 'vitest'
import { classifyPlayerProjectileContact, resolveHostileProjectileContacts } from './collision'
import { createPlayerState } from './player'
import { createProjectileSystem, resetProjectileGraze } from './projectiles'

describe('collision and graze', () => {
  it('treats the exact damage boundary as a hit and the exact graze boundary as graze', () => {
    const player = createPlayerState()
    const system = createProjectileSystem(4)
    const hit = system.spawn({
      kind: 'enemy',
      x: player.x + player.damageRadius + 4,
      y: player.y,
      vx: 0,
      vy: 0,
      radius: 4,
    })
    const graze = system.spawn({
      kind: 'enemy',
      x: player.x + player.grazeRadius + 4,
      y: player.y,
      vx: 0,
      vy: 0,
      radius: 4,
    })

    expect(classifyPlayerProjectileContact(player, hit)).toBe('hit')
    expect(classifyPlayerProjectileContact(player, graze)).toBe('graze')
  })

  it('awards at most one graze per hostile projectile until explicitly reset', () => {
    const player = createPlayerState()
    const system = createProjectileSystem(2)
    const projectile = system.spawn({
      kind: 'enemy',
      x: player.x + player.damageRadius + 8,
      y: player.y,
      vx: 0,
      vy: 0,
      radius: 2,
    })

    expect(resolveHostileProjectileContacts(player, system).grazes).toBe(1)
    expect(resolveHostileProjectileContacts(player, system).grazes).toBe(0)
    resetProjectileGraze(projectile)
    expect(resolveHostileProjectileContacts(player, system).grazes).toBe(1)
  })
})
