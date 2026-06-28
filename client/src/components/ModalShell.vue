<script setup lang="ts">
import { X } from '@lucide/vue'
import { Motion, AnimatePresence } from 'motion-v'

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  isDark: boolean
  maxW?: string
}>(), {
  maxW: 'max-w-md',
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const cardStyle = () => {
  if (props.isDark) {
    return {
      background: 'rgba(12,6,26,0.62)',
      backdropFilter: 'blur(52px) saturate(220%)',
      WebkitBackdropFilter: 'blur(52px) saturate(220%)',
      border: '1px solid rgba(255,255,255,0.13)',
      boxShadow: '0 1.5px 0 rgba(255,255,255,0.12) inset, 0 50px 100px rgba(0,0,0,0.65), 0 16px 32px rgba(0,0,0,0.35)',
    }
  }
  return {
    background: 'rgba(252,250,255,0.74)',
    backdropFilter: 'blur(52px) saturate(180%)',
    WebkitBackdropFilter: 'blur(52px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.92)',
    boxShadow: '0 1.5px 0 rgba(255,255,255,0.88) inset, 0 32px 80px rgba(80,60,180,0.12), 0 8px 24px rgba(80,60,180,0.06)',
  }
}

const tp = () => props.isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)'
const tm = () => props.isDark ? 'rgba(255,255,255,0.42)' : 'rgba(15,10,40,0.46)'
const divider = () => props.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,10,40,0.07)'

function handleCloseHover(e: MouseEvent, enter: boolean) {
  const el = e.currentTarget as HTMLElement
  el.style.background = enter
    ? (props.isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)')
    : 'transparent'
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-6">
    <Motion
      class="absolute inset-0 glass-overlay"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :transition="{ duration: 0.2 }"
      @click="emit('close')"
    />
    <Motion
      :initial="{ scale: 0.90, opacity: 0, y: 24 }"
      :animate="{ scale: 1, opacity: 1, y: 0 }"
      :exit="{ scale: 0.92, opacity: 0, y: 12 }"
      :transition="{ type: 'spring', stiffness: 340, damping: 28 }"
      :class="['relative z-10 w-full rounded-3xl flex flex-col', maxW]"
      :style="{ ...cardStyle(), maxHeight: '80vh' }"
    >
      <div
        class="flex items-start justify-between px-6 py-5 shrink-0"
        :style="{ borderBottom: `1px solid ${divider()}` }"
      >
        <div>
          <h2 class="text-base font-black" :style="{ color: tp() }">{{ title }}</h2>
          <p v-if="subtitle" class="text-xs mt-0.5" :style="{ color: tm() }">{{ subtitle }}</p>
        </div>
        <button
          class="p-1.5 rounded-xl transition-colors mt-0.5 cursor-pointer"
          :style="{ color: tm() }"
          @mouseenter="handleCloseHover($event, true)"
          @mouseleave="handleCloseHover($event, false)"
          @click="emit('close')"
        >
          <X :size="14" />
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        <slot />
      </div>
    </Motion>
  </div>
</template>
