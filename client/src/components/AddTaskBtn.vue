<script setup lang="ts">
import { Plus } from '@lucide/vue'
import { Motion } from 'motion-v'

const props = defineProps<{
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'open'): void
}>()

const glass = () => props.isDark
  ? 'bg-white/[0.07] border-white/[0.13]'
  : 'bg-white/60 border-white/75'

const lbl = () => props.isDark
  ? 'text-white/45 group-hover:text-white/80'
  : 'text-gray-400 group-hover:text-gray-700'

const ic = () => props.isDark
  ? 'border-white/30 group-hover:border-white/60 group-hover:bg-white/12'
  : 'border-indigo-300 group-hover:border-indigo-400'
</script>

<template>
  <Motion
    tag="button"
    :whileHover="{ scale: 1.01 }"
    :whileTap="{ scale: 0.98 }"
    :class="['w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl backdrop-blur-xl border transition-all group cursor-pointer', glass()]"
    @click="emit('open')"
  >
    <div
      :class="['w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all', ic()]"
    >
      <Plus :size="13" :stroke-width="2.5" :class="['transition-colors', lbl()]" />
    </div>
    <span :class="['text-sm font-semibold transition-colors', lbl()]">添加任务</span>
  </Motion>
</template>
