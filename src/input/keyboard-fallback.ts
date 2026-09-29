export type KeyboardCodeFallbackEvent = Readonly<{
  code: string
  key: string
  location?: number
}>

const LETTER_CODES: Readonly<Record<string, string>> = Object.freeze({
  a: 'KeyA',
  d: 'KeyD',
  s: 'KeyS',
  w: 'KeyW',
  x: 'KeyX',
})

/**
 * Resolve a gameplay code only when a browser/assistive/synthetic key event has
 * no physical `KeyboardEvent.code`. Real keyboard events remain authoritative
 * through @arcade/runtime's keyboard device.
 */
export function fallbackKeyboardCode(event: KeyboardCodeFallbackEvent): string | null {
  if (event.code.length > 0) return null

  if (
    event.key === 'ArrowLeft' ||
    event.key === 'ArrowRight' ||
    event.key === 'ArrowUp' ||
    event.key === 'ArrowDown'
  ) {
    return event.key
  }

  if (event.key === 'Shift') return event.location === 2 ? 'ShiftRight' : 'ShiftLeft'
  if (event.key === ' ' || event.key === 'Space' || event.key === 'Spacebar') return 'Space'

  return LETTER_CODES[event.key.toLowerCase()] ?? null
}
