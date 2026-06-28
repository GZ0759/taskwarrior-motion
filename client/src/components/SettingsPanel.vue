<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Volume2, Medal } from '@lucide/vue'
import { Motion } from 'motion-v'
import ToggleSwitch from './ToggleSwitch.vue'

const props = defineProps<{
  isDark: boolean
  pos: { top: number; left: number }
  soundEnabled: boolean
  achievementEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:soundEnabled', value: boolean): void
  (e: 'update:achievementEnabled', value: boolean): void
  (e: 'close'): void
}>()

const tp = () => props.isDark ? 'rgba(255,255,255,0.88)' : 'rgba(15,10,40,0.85)'
const tm = () => props.isDark ? 'rgba(255,255,255,0.42)' : 'rgba(15,10,40,0.44)'
const divider = () => props.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'

const panelStyle = () => {
  if (props.isDark) {
    return {
      background: 'rgba(14,8,32,0.90)',
      backdropFilter: 'blur(40px) saturate(200%)',
      WebkitBackdropFilter: 'blur(40px) saturate(200%)',
      border: '1px solid rgba(255,255,255,0.13)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.10) inset, 0 24px 60px rgba(0,0,0,0.60)',
    }
  }
  return {
    background: 'rgba(252,250,255,0.90)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.92)',
    boxShadow: '0 1px 0 rgba(255,255,255,0.88) inset, 0 20px 50px rgba(80,60,180,0.12)',
  }
}

const rows = [
  { label: '音效', key: 'soundEnabled' as const, icon: Volume2 },
  { label: '完成成就', key: 'achievementEnabled' as const, icon: Medal },
]

function handleClickOutside(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('[data-settings-panel]')) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <Motion
    data-settings-panel=""
    :initial="{ opacity: 0, scale: 0.94, y: -8 }"
    :animate="{ opacity: 1, scale: 1, y: 0 }"
    :exit="{ opacity: 0, scale: 0.94, y: -8 }"
    :transition="{ type: 'spring', stiffness: 420, damping: 30 }"
    :style="{ ...panelStyle(), position: 'fixed', top: pos.top + 'px', left: pos.left + 'px', width: 196 + 'px', zIndex: 9999, borderRadius: 16 + 'px', overflow: 'hidden' }"
  >
    <div class="px-4 py-3 border-b" :style="{ borderColor: divider() }">
      <span class="text-[10px] font-black uppercase tracking-widest" :style="{ color: tm() }">设置</span>
    </div>
    <div
      v-for="(r, i) in rows"
      :key="r.key"
      :class="['flex items-center justify-between px-4 py-3', i < rows.length - 1 ? 'border-b' : '']"
      :style="{ borderColor: divider() }"
    >
      <div class="flex items-center gap-2.5">
        <span :style="{ color: tm() }">
          <component :is="r.icon" :size="13" />
        </span>
        <span class="text-sm font-medium" :style="{ color: tp() }">{{ r.label }}</span>
      </div>
      <ToggleSwitch
        :on="r.key === 'soundEnabled' ? soundEnabled : achievementEnabled"
        @update:on="(v: boolean) => emit(r.key === 'soundEnabled' ? 'update:soundEnabled' : 'update:achievementEnabled', v)"
      />
    </div>
  </Motion>
</template>
