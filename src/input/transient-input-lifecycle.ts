export type EventListenerTarget = Readonly<{
  addEventListener(type: string, listener: EventListener): void
  removeEventListener(type: string, listener: EventListener): void
}>

export type TransientInputLifecycle = Readonly<{
  destroy(): void
}>

/**
 * Mobile browsers can suspend a page without delivering the pointer-up/key-up
 * events for contacts that were active immediately before suspension. Clear
 * transient input whenever focus is lost and whenever the document becomes
 * hidden so stale contacts cannot survive a resume.
 */
export function installTransientInputLifecycle(options: Readonly<{
  windowTarget: EventListenerTarget
  documentTarget: EventListenerTarget
  isDocumentHidden: () => boolean
  reset: () => void
}>): TransientInputLifecycle {
  const onBlur: EventListener = () => options.reset()
  const onVisibilityChange: EventListener = () => {
    if (options.isDocumentHidden()) options.reset()
  }

  options.windowTarget.addEventListener('blur', onBlur)
  options.documentTarget.addEventListener('visibilitychange', onVisibilityChange)

  return Object.freeze({
    destroy(): void {
      options.windowTarget.removeEventListener('blur', onBlur)
      options.documentTarget.removeEventListener('visibilitychange', onVisibilityChange)
    },
  })
}
