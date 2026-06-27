import { ref } from 'vue'

const soundEnabled = ref(true)

// 从 localStorage 初始化
const saved = localStorage.getItem('sound-enabled')
if (saved !== null) {
  soundEnabled.value = saved === 'true'
}

// 模块级 AudioContext 单例
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  // 处理 suspended 状态（浏览器自动暂停策略）
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// Web Audio API 合成音效 — 从 design-tokens.md 精确提取
function playTone(
  startFreq: number,
  endFreq: number,
  duration: number,
  startGain: number,
  rampTime: number,
) {
  if (!soundEnabled.value) return
  try {
    const ctx = getAudioContext()
    const gain = ctx.createGain()
    const osc = ctx.createOscillator()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.setValueAtTime(startFreq, ctx.currentTime)
    if (endFreq !== startFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + rampTime)
    }
    gain.gain.setValueAtTime(startGain, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // 静默失败
  }
}

export function useSound() {
  function playComplete() {
    // 523 → 1047 Hz, 0.32s
    playTone(523, 1047, 0.32, 0.13, 0.18)
  }

  function playAdd() {
    // 660 Hz, 0.10s
    playTone(660, 660, 0.10, 0.09, 0.10)
  }

  function playDelete() {
    // 删除音效：低频下落
    playTone(400, 200, 0.15, 0.08, 0.15)
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
    localStorage.setItem('sound-enabled', String(soundEnabled.value))
  }

  function setSoundEnabled(enabled: boolean) {
    soundEnabled.value = enabled
    localStorage.setItem('sound-enabled', String(enabled))
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
