import { describe, expect, it } from 'vitest'
import { FIXED_STEP_SECONDS, PLAYER } from './constants'
import { createPlayerState, stepPlayer } from './player'

const noInput = {
  left: false,
  right: false,
  up: false,
  down: false,
  focus: false,
  fire: false,
}

describe('player movement', () => {
  it('normalizes diagonal movement to the same scalar speed as cardinal movement', () => {
    const cardinal = createPlayerState()
    const diagonal = createPlayerState()
    stepPlayer(cardinal, { ...noInput, right: true }, FIXED_STEP_SECONDS)
    stepPlayer(diagonal, { ...noInput, right: true, up: true }, FIXED_STEP_SECONDS)

    expect(Math.hypot(cardinal.vx, cardinal.vy)).toBeCloseTo(PLAYER.speed, 8)
    expect(Math.hypot(diagonal.vx, diagonal.vy)).toBeCloseTo(PLAYER.speed, 8)
  })

  it('uses the authored focus speed multiplier without changing the damage hitbox', () => {
    const player = createPlayerState()
    const damageRadius = player.damageRadius
    stepPlayer(player, { ...noInput, right: true, focus: true }, FIXED_STEP_SECONDS)

    expect(player.vx).toBeCloseTo(PLAYER.speed * PLAYER.focusSpeedMultiplier, 8)
    expect(player.focus).toBe(true)
    expect(player.damageRadius).toBe(damageRadius)
  })
})
