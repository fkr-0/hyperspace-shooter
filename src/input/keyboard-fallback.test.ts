import { describe, expect, it } from 'vitest'
import { fallbackKeyboardCode } from './keyboard-fallback'

describe('browser keyboard code fallback', () => {
  it('never overrides a real physical KeyboardEvent.code', () => {
    expect(fallbackKeyboardCode({ code: 'KeyD', key: 'd' })).toBeNull()
    expect(fallbackKeyboardCode({ code: 'ArrowRight', key: 'ArrowRight' })).toBeNull()
  })

  it('normalizes held movement, fire, bomb and focus keys when code is absent', () => {
    expect(fallbackKeyboardCode({ code: '', key: 'ArrowLeft' })).toBe('ArrowLeft')
    expect(fallbackKeyboardCode({ code: '', key: 'd' })).toBe('KeyD')
    expect(fallbackKeyboardCode({ code: '', key: 'W' })).toBe('KeyW')
    expect(fallbackKeyboardCode({ code: '', key: ' ' })).toBe('Space')
    expect(fallbackKeyboardCode({ code: '', key: 'X' })).toBe('KeyX')
    expect(fallbackKeyboardCode({ code: '', key: 'Shift', location: 1 })).toBe('ShiftLeft')
    expect(fallbackKeyboardCode({ code: '', key: 'Shift', location: 2 })).toBe('ShiftRight')
  })

  it('ignores unrelated keys rather than creating hidden input authority', () => {
    expect(fallbackKeyboardCode({ code: '', key: 'Enter' })).toBeNull()
    expect(fallbackKeyboardCode({ code: '', key: 'Escape' })).toBeNull()
  })
})
