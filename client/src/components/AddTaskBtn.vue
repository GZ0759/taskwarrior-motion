<script setup lang="ts">
import { Plus } from '@lucide/vue'
import { Motion } from 'motion-v'

const emit = defineEmits<{
  (e: 'open'): void
}>()
</script>

<template>
  <Motion
    tag="button"
    :whileHover="{ scale: 1.01 }"
    :whileTap="{ scale: 0.98 }"
    class="add-task-btn w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl backdrop-blur-xl transition-all group cursor-pointer"
    @click="emit('open')"
  >
    <div
      class="icon-circle w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all"
    >
      <Plus :size="13" :stroke-width="2.5" class="transition-colors" />
    </div>
    <span class="text-sm font-semibold transition-colors">添加任务</span>
  </Motion>
</template>
