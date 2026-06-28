<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Volume2, Medal } from '@lucide/vue'
import { Motion } from 'motion-v'
import ToggleSwitch from './ToggleSwitch.vue'

const props = defineProps<{
  pos: { top: number; left: number }
  soundEnabled: boolean
  achievementEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:soundEnabled', value: boolean): void
  (e: 'update:achievementEnabled', value: boolean): void
  (e: 'close'): void
}>()

const panelStyle = {
  background: 'var(--glass-overlay-bg)',
  backdropFilter: 'blur(var(--glass-overlay-blur))',
  WebkitBackdropFilter: 'blur(var(--glass-overlay-blur))',
  border: '1px solid var(--glass-overlay-border)',
  boxShadow: 'var(--shadow-dropdown), var(--glass-overlay-inset)',
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
    :style="{ ...panelStyle, position: 'fixed', top: pos.top + 'px', left: pos.left + 'px', width: 196 + 'px', zIndex: 9999, borderRadius: 16 + 'px', overflow: 'hidden' }"
  >
    <div class="px-4 py-3 border-b" :style="{ borderColor: 'var(--divider)' }">
      <span class="text-[10px] font-black uppercase tracking-widest" :style="{ color: 'var(--txt-muted)' }">设置</span>
    </div>
    <div
      v-for="(r, i) in rows"
      :key="r.key"
      :class="['flex items-center justify-between px-4 py-3', i < rows.length - 1 ? 'border-b' : '']"
      :style="{ borderColor: 'var(--divider)' }"
    >
      <div class="flex items-center gap-2.5">
        <span :style="{ color: 'var(--txt-muted)' }">
          <component :is="r.icon" :size="13" />
        </span>
        <span class="text-sm font-medium" :style="{ color: 'var(--txt-primary)' }">{{ r.label }}</span>
      </div>
      <ToggleSwitch
        :on="r.key === 'soundEnabled' ? soundEnabled : achievementEnabled"
        @update:on="(v: boolean) => emit(r.key === 'soundEnabled' ? 'update:soundEnabled' : 'update:achievementEnabled', v)"
      />
    </div>
  </Motion>
</template>
