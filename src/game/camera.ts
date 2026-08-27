import { createDeterministicRng, rngRange } from '@arcade/runtime'
import type { CameraState } from './types'

const TRAUMA_DECAY_PER_TICK = 0.018
const MAX_SHAKE_PIXELS = 9

export function createCameraState(seed: number | string, reducedMotion = false): CameraState {
  return {
    trauma: 0,
    shakeX: 0,
    shakeY: 0,
    reducedMotion,
    slowMotionTicks: 0,
    slowMotionScale: 1,
    rng: createDeterministicRng(`${String(seed)}:camera`),
  }
}

export function addCameraTrauma(camera: CameraState, amount: number): void {
  camera.trauma = Math.max(0, Math.min(1, camera.trauma + amount))
}

export function triggerBossKillSlowMotion(
  camera: CameraState,
  durationTicks = 90,
  timeScale = 0.35,
): void {
  if (camera.reducedMotion) {
    camera.slowMotionTicks = 0
    camera.slowMotionScale = 1
    return
  }
  camera.slowMotionTicks = Math.max(0, Math.floor(durationTicks))
  camera.slowMotionScale = Math.max(0.1, Math.min(1, timeScale))
}

export function setReducedMotion(camera: CameraState, reducedMotion: boolean): void {
  camera.reducedMotion = reducedMotion
  if (reducedMotion) {
    camera.shakeX = 0
    camera.shakeY = 0
  }
}

export function stepCamera(camera: CameraState): void {
  if (camera.slowMotionTicks > 0) {
    camera.slowMotionTicks -= 1
  } else {
    camera.slowMotionScale = 1
  }

  camera.trauma = Math.max(0, camera.trauma - TRAUMA_DECAY_PER_TICK)
  if (camera.reducedMotion || camera.trauma <= 0) {
    camera.shakeX = 0
    camera.shakeY = 0
    return
  }

  const amplitude = camera.trauma * camera.trauma * MAX_SHAKE_PIXELS
  const rollX = rngRange(camera.rng, -1, 1)
  camera.rng = rollX.state
  const rollY = rngRange(camera.rng, -1, 1)
  camera.rng = rollY.state
  camera.shakeX = rollX.value * amplitude
  camera.shakeY = rollY.value * amplitude
}
