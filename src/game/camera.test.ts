import { describe, expect, it } from 'vitest'
import { addCameraTrauma, createCameraState, stepCamera, triggerBossKillSlowMotion } from './camera'

describe('camera state', () => {
  it('is deterministic for equal seed and impulses', () => {
    const left = createCameraState('camera-seed')
    const right = createCameraState('camera-seed')
    addCameraTrauma(left, 0.8)
    addCameraTrauma(right, 0.8)
    triggerBossKillSlowMotion(left, 45, 0.4)
    triggerBossKillSlowMotion(right, 45, 0.4)

    for (let tick = 0; tick < 80; tick += 1) {
      stepCamera(left)
      stepCamera(right)
      expect(left).toEqual(right)
    }
    expect(left.slowMotionScale).toBe(1)
  })

  it('keeps deterministic trauma decay while suppressing shake for reduced motion', () => {
    const camera = createCameraState('reduced', true)
    addCameraTrauma(camera, 0.5)
    triggerBossKillSlowMotion(camera, 90, 0.25)
    stepCamera(camera)
    expect(camera.trauma).toBeGreaterThan(0)
    expect(camera.shakeX).toBe(0)
    expect(camera.shakeY).toBe(0)
    expect(camera.slowMotionTicks).toBe(0)
    expect(camera.slowMotionScale).toBe(1)
  })
})
