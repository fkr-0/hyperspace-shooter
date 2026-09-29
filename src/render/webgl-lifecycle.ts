export type WebglContextLifecycle = Readonly<{
  destroy(): void
}>

export function installWebglContextLifecycle(
  target: EventTarget,
  callbacks: Readonly<{
    onLost: () => void
    onRestored: () => void
  }>,
): WebglContextLifecycle {
  const handleLost = (event: Event) => {
    // WebGL contexts are only eligible for browser-managed restoration when
    // the context-lost event is cancelled.
    if (event.cancelable) event.preventDefault()
    callbacks.onLost()
  }
  const handleRestored = () => callbacks.onRestored()

  target.addEventListener('webglcontextlost', handleLost)
  target.addEventListener('webglcontextrestored', handleRestored)

  return Object.freeze({
    destroy(): void {
      target.removeEventListener('webglcontextlost', handleLost)
      target.removeEventListener('webglcontextrestored', handleRestored)
    },
  })
}
