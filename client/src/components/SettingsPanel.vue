<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Motion } from 'motion-v'
import { Volume2, Medal, Keyboard, Sun, Moon } from '@lucide/vue'
import ToggleSwitch from './ToggleSwitch.vue'

const props = defineProps<{
  pos: { top: number; left: number }
  theme: 'light' | 'dark'
  soundEnabled: boolean
  achievementEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:theme', value: 'light' | 'dark'): void
  (e: 'update:soundEnabled', value: boolean): void
  (e: 'update:achievementEnabled', value: boolean): void
  (e: 'showHelp'): void
  (e: 'close'): void
}>()

const panelStyle = {
  background: 'var(--glass-overlay-bg)',
  backdropFilter: 'blur(var(--glass-overlay-blur))',
  WebkitBackdropFilter: 'blur(var(--glass-overlay-blur))',
  border: '1px solid var(--glass-overlay-border)',
  boxShadow: 'var(--shadow-dropdown), var(--glass-overlay-inset)',
}

const sectionLabelStyle = {
  color: 'var(--txt-muted)',
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

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
  <div data-settings-panel>
    <Motion
      :initial="{ opacity: 0, scale: 0.94, y: -8 }"
      :animate="{ opacity: 1, scale: 1, y: 0 }"
      :exit="{ opacity: 0, scale: 0.94, y: -8 }"
      :transition="{ type: 'spring', stiffness: 420, damping: 30 }"
      :style="{ ...panelStyle, position: 'fixed', top: pos.top + 'px', left: pos.left + 'px', width: 220 + 'px', zIndex: 9999, borderRadius: 16 + 'px', overflow: 'hidden', padding: '12px' }"
    >
      <!-- 标题 -->
      <div class="text-xs font-bold mb-3" :style="{ color: 'var(--txt-primary)' }">设置</div>

      <!-- 外观 -->
      <div class="mb-3">
        <div class="mb-1.5" :style="sectionLabelStyle">外观</div>
        <div class="flex gap-1">
          <button
            class="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
            :style="theme === 'light'
              ? { background: 'var(--accent-indigo)', color: 'var(--txt-on-color)' }
              : { background: 'var(--glass-input-bg)', color: 'var(--txt-muted)' }"
            @click="emit('update:theme', 'light')"
          ><Sun :size="12" />浅色</button>
          <button
            class="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
            :style="theme === 'dark'
              ? { background: 'var(--accent-indigo)', color: 'var(--txt-on-color)' }
              : { background: 'var(--glass-input-bg)', color: 'var(--txt-muted)' }"
            @click="emit('update:theme', 'dark')"
          ><Moon :size="12" />深色</button>
        </div>
      </div>

      <!-- 功能 -->
      <div class="mb-3">
        <div class="mb-1.5" :style="sectionLabelStyle">功能</div>
        <div class="flex items-center justify-between py-1.5">
          <div class="flex items-center gap-2 text-[12px]" :style="{ color: 'var(--txt-primary)' }">
            <Volume2 :size="13" />音效
          </div>
          <ToggleSwitch :on="soundEnabled" @update:on="emit('update:soundEnabled', $event)" />
        </div>
        <div class="flex items-center justify-between py-1.5">
          <div class="flex items-center gap-2 text-[12px]" :style="{ color: 'var(--txt-primary)' }">
            <Medal :size="13" />完成成就
          </div>
          <ToggleSwitch :on="achievementEnabled" @update:on="emit('update:achievementEnabled', $event)" />
        </div>
      </div>

      <!-- 其他 -->
      <div>
        <div class="mb-1.5" :style="sectionLabelStyle">其他</div>
        <button
          class="w-full flex items-center justify-between py-1.5 text-[12px] transition-colors cursor-pointer"
          :style="{ color: 'var(--txt-primary)' }"
          @click="emit('showHelp')"
        >
          <div class="flex items-center gap-2">
            <Keyboard :size="13" />快捷键
          </div>
          <span class="text-[10px]" :style="{ color: 'var(--accent-indigo)' }">查看 →</span>
        </button>
      </div>
    </Motion>
  </div>
</template>
