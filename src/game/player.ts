import { PLAYER, PLAYFIELD } from './constants'
import type { PlayerInput, PlayerState } from './types'

const DIAGONAL_NORMALIZER = Math.SQRT1_2

export function createPlayerState(): PlayerState {
  return {
    id: 'player-1',
    x: PLAYER.startX,
    y: PLAYER.startY,
    previousX: PLAYER.startX,
    previousY: PLAYER.startY,
    vx: 0,
    vy: 0,
    focus: false,
    firing: false,
    damageRadius: PLAYER.damageRadius,
    grazeRadius: PLAYER.grazeRadius,
    shotCooldownTicks: 0,
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value))
}

export function stepPlayer(player: PlayerState, input: PlayerInput, delta: number): void {
  player.previousX = player.x
  player.previousY = player.y
  player.focus = input.focus
  player.firing = input.fire

  let directionX = Number(input.right) - Number(input.left)
  let directionY = Number(input.down) - Number(input.up)
  if (directionX !== 0 && directionY !== 0) {
    directionX *= DIAGONAL_NORMALIZER
    directionY *= DIAGONAL_NORMALIZER
  }

  const speed = PLAYER.speed * (input.focus ? PLAYER.focusSpeedMultiplier : 1)
  player.vx = directionX * speed
  player.vy = directionY * speed
  player.x = clamp(player.x + player.vx * delta, PLAYFIELD.left, PLAYFIELD.right)
  player.y = clamp(player.y + player.vy * delta, PLAYFIELD.top, PLAYFIELD.bottom)
}
