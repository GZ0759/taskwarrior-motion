<script setup lang="ts">
import { ref } from 'vue'
import { ChevronUp, ChevronDown, CircleCheckBig } from '@lucide/vue'
import { Motion, AnimatePresence } from 'motion-v'
import type { Task } from '@/types/task'

const props = defineProps<{
  tasks: Task[]
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'uncomplete', id: string): void
}>()

const open = ref(false)

const tp = () => props.isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)'
const tm = () => props.isDark ? 'rgba(255,255,255,0.48)' : 'rgba(15,10,40,0.44)'
const ts = () => props.isDark ? 'rgba(255,255,255,0.28)' : 'rgba(15,10,40,0.24)'

function handleUncompleteHover(e: MouseEvent, enter: boolean) {
  const el = e.currentTarget as HTMLElement
  el.style.color = enter ? tp() : ts()
}
</script>

<template>
  <div v-if="tasks.length > 0" class="mt-3">
    <button
      class="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-colors cursor-pointer"
      :style="{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
      }"
      @click="open = !open"
    >
      <span class="text-sm font-semibold" :style="{ color: tm() }">已完成 ({{ tasks.length }})</span>
      <ChevronUp v-if="open" :size="14" :style="{ color: ts() }" />
      <ChevronDown v-else :size="14" :style="{ color: ts() }" />
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
            :style="{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }"
          >
            <CircleCheckBig :size="14" :style="{ color: '#4ADE80', flexShrink: 0 }" />
            <span class="flex-1 text-sm line-through" :style="{ color: tm() }">{{ t.description }}</span>
            <span class="text-[10px]" :style="{ color: ts() }">{{ t.end }}</span>
            <button
              class="text-[10px] px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
              :style="{
                color: ts(),
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              }"
              @mouseenter="handleUncompleteHover($event, true)"
              @mouseleave="handleUncompleteHover($event, false)"
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
