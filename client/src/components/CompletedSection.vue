<script setup lang="ts">
import { ref } from 'vue'
import { ChevronUp, ChevronDown, CircleCheckBig } from '@lucide/vue'
import { Motion, AnimatePresence } from 'motion-v'
import type { Task } from '@/types/task'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'uncomplete', id: string): void
}>()

const open = ref(false)
</script>

<template>
  <div v-if="tasks.length > 0" class="mt-3">
    <button
      class="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-colors cursor-pointer"
      :style="{
        background: 'var(--glass-input-bg)',
        border: '1px solid var(--glass-input-border)',
      }"
      @click="open = !open"
    >
      <span class="text-sm font-semibold" :style="{ color: 'var(--txt-muted)' }">已完成 ({{ tasks.length }})</span>
      <ChevronUp v-if="open" :size="14" :style="{ color: 'var(--txt-subtle)' }" />
      <ChevronDown v-else :size="14" :style="{ color: 'var(--txt-subtle)' }" />
    </button>
    <AnimatePresence>
      <Motion
        v-if="open"
        :initial="{ height: 0, opacity: 0 }"
        :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0 }"
        :transition="{ duration: 0.22 }"
        class="overflow-hidden"
      >
        <div class="mt-2 space-y-1">
          <div
            v-for="t in tasks.slice(0, 20)"
            :key="t.uuid"
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl"
            :style="{ background: 'var(--glass-input-bg)' }"
          >
            <CircleCheckBig :size="14" :style="{ color: 'var(--txt-success)', flexShrink: 0 }" />
            <span class="flex-1 text-sm line-through" :style="{ color: 'var(--txt-muted)' }">{{ t.description }}</span>
            <span class="text-[10px]" :style="{ color: 'var(--txt-subtle)' }">{{ t.end }}</span>
            <button
              class="text-[10px] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
              :style="{
                color: 'var(--txt-subtle)',
                background: 'var(--glass-input-bg)',
              }"
              @click="emit('uncomplete', t.uuid)"
            >
              取消完成
            </button>
          </div>
        </div>
      </Motion>
    </AnimatePresence>
  </div>
</template>
