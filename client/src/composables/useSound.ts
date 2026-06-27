import { ref } from 'vue'
import { Howl } from 'howler'

const soundEnabled = ref(true)

const sounds = {
  complete: new Howl({
    src: ['/sounds/complete.mp3'],
    volume: 0.5,
    preload: true,
  }),
  delete: new Howl({
    src: ['/sounds/delete.mp3'],
    volume: 0.3,
    preload: true,
  }),
  add: new Howl({
    src: ['/sounds/add.mp3'],
    volume: 0.4,
    preload: true,
  }),
}

export function useSound() {
  function playComplete() {
    if (soundEnabled.value) {
      sounds.complete.play()
    }
  }

  function playDelete() {
    if (soundEnabled.value) {
      sounds.delete.play()
    }
  }

  function playAdd() {
    if (soundEnabled.value) {
      sounds.add.play()
    }
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
    localStorage.setItem('sound-enabled', String(soundEnabled.value))
  }

  function setSoundEnabled(enabled: boolean) {
    soundEnabled.value = enabled
    localStorage.setItem('sound-enabled', String(enabled))
  }

  // Initialize from localStorage
  const saved = localStorage.getItem('sound-enabled')
  if (saved !== null) {
    soundEnabled.value = saved === 'true'
  }

  return {
    soundEnabled,
    playComplete,
    playDelete,
    playAdd,
    toggleSound,
    setSoundEnabled,
  }
}
