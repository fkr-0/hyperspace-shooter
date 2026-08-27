export const FIXED_STEP_SECONDS = 1 / 60

export const PLAYFIELD = Object.freeze({
  width: 480,
  height: 720,
  left: 22,
  right: 458,
  top: 32,
  bottom: 696,
})

export const PLAYER = Object.freeze({
  speed: 300,
  focusSpeedMultiplier: 0.45,
  damageRadius: 3,
  grazeRadius: 12,
  visualRadius: 14,
  startX: PLAYFIELD.width / 2,
  startY: PLAYFIELD.height - 92,
})

export const PROJECTILE_CAPACITY = 2048
export const PLAYER_PROJECTILE_SPEED = 720
export const PLAYER_SHOT_CADENCE_TICKS = 5
