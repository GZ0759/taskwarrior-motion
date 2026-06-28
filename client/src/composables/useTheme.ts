import { ref } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')
const isDark = ref(false)
let initialized = false

function applyTheme() {
  isDark.value = theme.value === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)
  document.documentElement.classList.toggle('light', !isDark.value)
}

export function useTheme() {
  if (!initialized) {
    initialized = true
    const saved = localStorage.getItem('twm-theme') as Theme | null
    if (saved === 'light' || saved === 'dark') {
      theme.value = saved
    } else if (saved === 'system' || !saved) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
    applyTheme()
  }

  function setTheme(t: Theme) {
    theme.value = t
    localStorage.setItem('twm-theme', t)
    applyTheme()
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  return { theme, isDark, setTheme, toggleTheme }
}
