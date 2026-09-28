import { describe, expect, it, vi } from 'vitest'
import { installTransientInputLifecycle } from './transient-input-lifecycle'

describe('transient mobile input lifecycle', () => {
  it('clears held input when the browser window loses focus', () => {
    const windowTarget = new EventTarget()
    const documentTarget = new EventTarget()
    const reset = vi.fn()
    const lifecycle = installTransientInputLifecycle({
      windowTarget,
      documentTarget,
      isDocumentHidden: () => false,
      reset,
    })

    windowTarget.dispatchEvent(new Event('blur'))
    expect(reset).toHaveBeenCalledTimes(1)

    lifecycle.destroy()
    windowTarget.dispatchEvent(new Event('blur'))
    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('clears held input when a mobile browser hides the document', () => {
    const windowTarget = new EventTarget()
    const documentTarget = new EventTarget()
    const reset = vi.fn()
    let hidden = false
    const lifecycle = installTransientInputLifecycle({
      windowTarget,
      documentTarget,
      isDocumentHidden: () => hidden,
      reset,
    })

    documentTarget.dispatchEvent(new Event('visibilitychange'))
    expect(reset).not.toHaveBeenCalled()

    hidden = true
    documentTarget.dispatchEvent(new Event('visibilitychange'))
    expect(reset).toHaveBeenCalledTimes(1)
    lifecycle.destroy()
  })
})
