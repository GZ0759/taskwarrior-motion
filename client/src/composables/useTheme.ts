import { ref, onMounted, watch } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const theme = ref<Theme>('system')
const isDark = ref(false)

export function useTheme() {
  function getSystemTheme(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  function applyTheme() {
    const dark = theme.value === 'dark' || (theme.value === 'system' && getSystemTheme())
    isDark.value = dark
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.classList.toggle('light', !dark)
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
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

  onMounted(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) {
      theme.value = saved
    }
    applyTheme()

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme()
      }
    })
  })

  watch(theme, applyTheme)

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
