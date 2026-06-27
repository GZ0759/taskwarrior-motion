import { ref, watch } from 'vue'

type Theme = 'light' | 'dark' | 'system'

// 模块级单例状态
const theme = ref<Theme>('system')
const isDark = ref(false)
let initialized = false

function getSystemTheme(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme() {
  const dark = theme.value === 'dark' || (theme.value === 'system' && getSystemTheme())
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.classList.toggle('light', !dark)
}

function init() {
  if (initialized) return
  initialized = true

  // 从 localStorage 恢复
  const saved = localStorage.getItem('twm-theme') as Theme | null
  if (saved) {
    theme.value = saved
  }
  applyTheme()

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (theme.value === 'system') {
      applyTheme()
    }
  })

  // 监听 theme 变化
  watch(theme, applyTheme)
}

export function useTheme() {
  // 首次调用时初始化
  init()

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('twm-theme', newTheme)
    applyTheme()
  }

  function toggleTheme() {
    if (theme.value === 'light') {
      setTheme('dark')
    } else if (theme.value === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
