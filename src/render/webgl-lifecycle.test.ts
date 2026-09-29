import { describe, expect, it, vi } from 'vitest'
import { installWebglContextLifecycle } from './webgl-lifecycle'

describe('WebGL context lifecycle', () => {
  it('cancels context loss so restoration remains possible and reports both transitions', () => {
    const target = new EventTarget()
    const onLost = vi.fn()
    const onRestored = vi.fn()
    const lifecycle = installWebglContextLifecycle(target, { onLost, onRestored })

    const lost = new Event('webglcontextlost', { cancelable: true })
    expect(target.dispatchEvent(lost)).toBe(false)
    expect(lost.defaultPrevented).toBe(true)
    expect(onLost).toHaveBeenCalledTimes(1)

    target.dispatchEvent(new Event('webglcontextrestored'))
    expect(onRestored).toHaveBeenCalledTimes(1)

    lifecycle.destroy()
    target.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
    target.dispatchEvent(new Event('webglcontextrestored'))
    expect(onLost).toHaveBeenCalledTimes(1)
    expect(onRestored).toHaveBeenCalledTimes(1)
  })
})
