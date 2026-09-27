import type { PointerDevice, PointerContactState } from '@arcade/runtime/core'
import type { PlayerInput } from '../game/types'

export type TouchRect = Readonly<{ left: number; top: number; width: number; height: number }>
export type LogicalPoint = Readonly<{ x: number; y: number }>

export type MobileTouchSnapshot = Readonly<{
  input: PlayerInput
  active: boolean
  moving: boolean
  firing: boolean
  specialPressed: boolean
  target: LogicalPoint | null
}>

export type MobileTouchController = Readonly<{
  read(player: LogicalPoint, autoFire: boolean): MobileTouchSnapshot
  reset(): void
}>

function contains(rect: TouchRect, point: LogicalPoint): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.left + rect.width &&
    point.y >= rect.top &&
    point.y <= rect.top + rect.height
  )
}

export function clientToLogical(
  point: LogicalPoint,
  rect: TouchRect,
  logicalWidth: number,
  logicalHeight: number,
): LogicalPoint | null {
  if (rect.width <= 0 || rect.height <= 0 || !contains(rect, point)) return null
  return Object.freeze({
    x: ((point.x - rect.left) / rect.width) * logicalWidth,
    y: ((point.y - rect.top) / rect.height) * logicalHeight,
  })
}

export function touchInputTowardTarget(
  player: LogicalPoint,
  target: LogicalPoint | null,
  options?: Readonly<{ deadZone?: number; fire?: boolean; bomb?: boolean }>,
): PlayerInput {
  const deadZone = Math.max(0, options?.deadZone ?? 8)
  const dx = target ? target.x - player.x : 0
  const dy = target ? target.y - player.y : 0
  return Object.freeze({
    left: dx < -deadZone,
    right: dx > deadZone,
    up: dy < -deadZone,
    down: dy > deadZone,
    focus: target !== null,
    fire: options?.fire === true,
    bomb: options?.bomb === true,
  })
}

function latestContact(contacts: readonly PointerContactState[]): PointerContactState | null {
  let latest: PointerContactState | null = null
  for (const contact of contacts) {
    if (!latest || contact.sequence > latest.sequence) latest = contact
  }
  return latest
}

export function createMobileTouchController(options: Readonly<{
  pointer: PointerDevice
  playfieldRect: () => TouchRect
  fireRect: () => TouchRect
  specialRect: () => TouchRect
  logicalWidth: number
  logicalHeight: number
  deadZone?: number
}>): MobileTouchController {
  const knownTouchIds = new Set<number>()

  return Object.freeze({
    read(player: LogicalPoint, autoFire: boolean): MobileTouchSnapshot {
      const contacts = options.pointer
        .snapshot()
        .pointers.filter((contact) => contact.pointerType === 'touch' && contact.buttons !== 0)
      const currentIds = new Set(contacts.map((contact) => contact.pointerId))
      const playfieldRect = options.playfieldRect()
      const fireRect = options.fireRect()
      const specialRect = options.specialRect()
      const fireContacts = contacts.filter((contact) => contains(fireRect, contact))
      const specialContacts = contacts.filter((contact) => contains(specialRect, contact))
      const movementContacts = contacts.filter(
        (contact) =>
          contains(playfieldRect, contact) &&
          !contains(fireRect, contact) &&
          !contains(specialRect, contact),
      )
      const movement = latestContact(movementContacts)
      const target = movement
        ? clientToLogical(movement, playfieldRect, options.logicalWidth, options.logicalHeight)
        : null
      const specialPressed = specialContacts.some((contact) => !knownTouchIds.has(contact.pointerId))
      const firing = fireContacts.length > 0 || (autoFire && target !== null)
      const input = touchInputTowardTarget(player, target, {
        deadZone: options.deadZone,
        fire: firing,
        bomb: specialPressed,
      })

      knownTouchIds.clear()
      for (const pointerId of currentIds) knownTouchIds.add(pointerId)

      return Object.freeze({
        input,
        active: contacts.length > 0,
        moving: movement !== null,
        firing,
        specialPressed,
        target,
      })
    },
    reset(): void {
      knownTouchIds.clear()
    },
  })
}
