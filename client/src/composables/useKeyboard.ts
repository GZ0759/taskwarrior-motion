import { onMounted, onUnmounted } from 'vue'

interface KeyboardHandlers {
  onNewTask?: () => void
  onNextTask?: () => void
  onPrevTask?: () => void
  onCompleteTask?: () => void
  onEditTask?: () => void
  onCloseModal?: () => void
  onShowHelp?: () => void
  onUndo?: () => void
}

export function useKeyboard(handlers: KeyboardHandlers) {
  function handleKeydown(e: KeyboardEvent) {
    // Skip if user is typing in an input/textarea
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      // Only handle Escape in inputs
      if (e.key === 'Escape') {
        handlers.onCloseModal?.()
      }
      return
    }

    switch (e.key) {
      case 'n':
        e.preventDefault()
        handlers.onNewTask?.()
        break
      case 'j':
        e.preventDefault()
        handlers.onNextTask?.()
        break
      case 'k':
        e.preventDefault()
        handlers.onPrevTask?.()
        break
      case 'x':
        e.preventDefault()
        handlers.onCompleteTask?.()
        break
      case 'Enter':
        e.preventDefault()
        handlers.onEditTask?.()
        break
      case 'Escape':
        e.preventDefault()
        handlers.onCloseModal?.()
        break
      case '?':
        e.preventDefault()
        handlers.onShowHelp?.()
        break
      case 'z':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          handlers.onUndo?.()
        }
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
