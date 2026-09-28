import type { PointerContactState, PointerDevice } from '@arcade/runtime/core'
import { describe, expect, it } from 'vitest'
import { clientToLogical, createMobileTouchController, touchInputTowardTarget } from './mobile-touch'

describe('mobile touch input mapping', () => {
  it('maps client coordinates into the fixed logical playfield', () => {
    expect(
      clientToLogical(
        { x: 150, y: 250 },
        { left: 50, top: 100, width: 200, height: 300 },
        480,
        720,
      ),
    ).toEqual({ x: 240, y: 360 })
  })

  it('rejects touches outside the rendered playfield', () => {
    expect(
      clientToLogical(
        { x: 20, y: 20 },
        { left: 50, top: 100, width: 200, height: 300 },
        480,
        720,
      ),
    ).toBeNull()
  })

  it('converts a drag target into deterministic directional input with precision focus', () => {
    expect(touchInputTowardTarget({ x: 100, y: 200 }, { x: 150, y: 120 }, { deadZone: 8 })).toEqual({
      left: false,
      right: true,
      up: true,
      down: false,
      focus: true,
      fire: false,
      bomb: false,
    })
  })

  it('keeps motion neutral inside the dead zone while preserving fire and special actions', () => {
    expect(
      touchInputTowardTarget(
        { x: 100, y: 200 },
        { x: 105, y: 196 },
        { deadZone: 8, fire: true, bomb: true },
      ),
    ).toEqual({
      left: false,
      right: false,
      up: false,
      down: false,
      focus: true,
      fire: true,
      bomb: true,
    })
  })

  it('supports simultaneous move and fire contacts through the runtime pointer snapshot', () => {
    let pointers: readonly PointerContactState[] = [
      {
        pointerId: 1,
        pointerType: 'touch',
        x: 100,
        y: 120,
        pressure: 1,
        buttons: 1,
        isPrimary: true,
        sequence: 1,
      },
      {
        pointerId: 2,
        pointerType: 'touch',
        x: 430,
        y: 650,
        pressure: 1,
        buttons: 1,
        isPrimary: false,
        sequence: 2,
      },
    ]
    const pointer = {
      snapshot: () => ({ pointers }),
    } as PointerDevice
    const controller = createMobileTouchController({
      pointer,
      playfieldRect: () => ({ left: 0, top: 0, width: 480, height: 720 }),
      fireRect: () => ({ left: 360, top: 540, width: 120, height: 180 }),
      specialRect: () => ({ left: 390, top: 0, width: 90, height: 130 }),
      logicalWidth: 480,
      logicalHeight: 720,
    })

    const snapshot = controller.read({ x: 240, y: 628 }, false)
    expect(snapshot.moving).toBe(true)
    expect(snapshot.firing).toBe(true)
    expect(snapshot.input).toMatchObject({ left: true, up: true, fire: true, bomb: false })
    expect(snapshot.target).toEqual({ x: 100, y: 120 })

    pointers = []
    expect(controller.read({ x: 240, y: 628 }, false).active).toBe(false)
  })

  it('ignores active touches outside the playfield so telemetry taps cannot move or auto-fire', () => {
    const pointers: readonly PointerContactState[] = [
      {
        pointerId: 9,
        pointerType: 'touch',
        x: 620,
        y: 260,
        pressure: 1,
        buttons: 1,
        isPrimary: true,
        sequence: 1,
      },
    ]
    const pointer = {
      snapshot: () => ({ pointers }),
    } as PointerDevice
    const controller = createMobileTouchController({
      pointer,
      playfieldRect: () => ({ left: 0, top: 0, width: 480, height: 720 }),
      fireRect: () => ({ left: 360, top: 540, width: 120, height: 180 }),
      specialRect: () => ({ left: 390, top: 0, width: 90, height: 130 }),
      logicalWidth: 480,
      logicalHeight: 720,
    })

    const snapshot = controller.read({ x: 240, y: 628 }, true)
    expect(snapshot).toMatchObject({
      active: true,
      moving: false,
      firing: false,
      specialPressed: false,
      target: null,
    })
    expect(snapshot.input).toMatchObject({ fire: false, bomb: false, left: false, right: false })
  })

  it('reads each control rectangle once per input frame even with multiple contacts', () => {
    const pointers: readonly PointerContactState[] = [
      {
        pointerId: 1,
        pointerType: 'touch',
        x: 100,
        y: 120,
        pressure: 1,
        buttons: 1,
        isPrimary: true,
        sequence: 1,
      },
      {
        pointerId: 2,
        pointerType: 'touch',
        x: 430,
        y: 650,
        pressure: 1,
        buttons: 1,
        isPrimary: false,
        sequence: 2,
      },
    ]
    const pointer = { snapshot: () => ({ pointers }) } as PointerDevice
    const reads = { playfield: 0, fire: 0, special: 0 }
    const controller = createMobileTouchController({
      pointer,
      playfieldRect: () => {
        reads.playfield += 1
        return { left: 0, top: 0, width: 480, height: 720 }
      },
      fireRect: () => {
        reads.fire += 1
        return { left: 360, top: 540, width: 120, height: 180 }
      },
      specialRect: () => {
        reads.special += 1
        return { left: 390, top: 0, width: 90, height: 130 }
      },
      logicalWidth: 480,
      logicalHeight: 720,
    })

    controller.read({ x: 240, y: 628 }, false)
    expect(reads).toEqual({ playfield: 1, fire: 1, special: 1 })
  })

  it('turns a special-zone contact into one bomb edge and supports movement-driven auto fire', () => {
    let pointers: readonly PointerContactState[] = [
      {
        pointerId: 7,
        pointerType: 'touch',
        x: 420,
        y: 80,
        pressure: 1,
        buttons: 1,
        isPrimary: true,
        sequence: 1,
      },
    ]
    const pointer = {
      snapshot: () => ({ pointers }),
    } as PointerDevice
    const controller = createMobileTouchController({
      pointer,
      playfieldRect: () => ({ left: 0, top: 0, width: 480, height: 720 }),
      fireRect: () => ({ left: 360, top: 540, width: 120, height: 180 }),
      specialRect: () => ({ left: 390, top: 0, width: 90, height: 130 }),
      logicalWidth: 480,
      logicalHeight: 720,
    })

    expect(controller.read({ x: 240, y: 628 }, false).specialPressed).toBe(true)
    expect(controller.read({ x: 240, y: 628 }, false).specialPressed).toBe(false)

    pointers = [
      {
        pointerId: 8,
        pointerType: 'touch',
        x: 240,
        y: 400,
        pressure: 1,
        buttons: 1,
        isPrimary: true,
        sequence: 2,
      },
    ]
    const autoFire = controller.read({ x: 240, y: 628 }, true)
    expect(autoFire.firing).toBe(true)
    expect(autoFire.input.fire).toBe(true)
    expect(autoFire.input.up).toBe(true)
  })

  it('suppresses stale held contacts after an interruption until all contacts clear', () => {
    let pointers: readonly PointerContactState[] = [
      {
        pointerId: 11,
        pointerType: 'touch',
        x: 120,
        y: 180,
        pressure: 1,
        buttons: 1,
        isPrimary: true,
        sequence: 1,
      },
    ]
    const pointer = { snapshot: () => ({ pointers }) } as PointerDevice
    const controller = createMobileTouchController({
      pointer,
      playfieldRect: () => ({ left: 0, top: 0, width: 480, height: 720 }),
      fireRect: () => ({ left: 360, top: 540, width: 120, height: 180 }),
      specialRect: () => ({ left: 390, top: 0, width: 90, height: 130 }),
      logicalWidth: 480,
      logicalHeight: 720,
    })

    expect(controller.read({ x: 240, y: 628 }, true).moving).toBe(true)
    controller.reset()

    expect(controller.read({ x: 240, y: 628 }, true)).toMatchObject({
      active: true,
      moving: false,
      firing: false,
      specialPressed: false,
      target: null,
      input: { left: false, right: false, up: false, down: false, focus: false, fire: false, bomb: false },
    })

    pointers = []
    expect(controller.read({ x: 240, y: 628 }, true).active).toBe(false)

    pointers = [
      {
        pointerId: 12,
        pointerType: 'touch',
        x: 120,
        y: 180,
        pressure: 1,
        buttons: 1,
        isPrimary: true,
        sequence: 2,
      },
    ]
    expect(controller.read({ x: 240, y: 628 }, true)).toMatchObject({ moving: true, firing: true })
    controller.destroy()
  })
})
