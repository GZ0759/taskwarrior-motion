<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check, Play, Square } from '@lucide/vue'
import { Motion } from 'motion-v'

import { useSound } from '@/composables/useSound'
import { useTimeTracking } from '@/composables/useTimeTracking'
import { getCardStyle } from '@/utils/card-styles'
import { formatDue, isOverdue } from '@/utils/date'
import type { Task } from '@/types/task'

const props = defineProps<{
  task: Task
  index: number
  selected: boolean
  allProjects: string[]
  allTags: string[]
}>()

const emit = defineEmits<{
  (e: 'complete', uuid: string, desc: string): void
  (e: 'edit', task: Task): void
  (e: 'delete', uuid: string): void
  (e: 'timer', task: Task): void
}>()

const { playComplete } = useSound()
const { activeTask, formattedTime, elapsedTime } = useTimeTracking()

const style = computed(() => getCardStyle(props.task.project ?? '', props.index))

const shaking = ref(false)
const checked = ref(false)
const removing = ref(false)

const isTracking = computed(() => activeTask.value?.uuid === props.task.uuid)
const elapsed = computed(() => {
  if (isTracking.value) return elapsedTime.value
  return 0
})

const overdue = computed(() => isOverdue(props.task.due))
const dueLabel = computed(() => formatDue(props.task.due))

function handleCheck() {
  if (shaking.value || removing.value) return
  shaking.value = true
  playComplete()
  setTimeout(() => {
    shaking.value = false
    checked.value = true
    setTimeout(() => {
      removing.value = true
      setTimeout(() => emit('complete', props.task.uuid, props.task.description), 330)
    }, 380)
  }, 520)
}

function openEdit() {
  emit('edit', props.task)
}

function openTimer() {
  emit('timer', props.task)
}
</script>

<style scoped>
.check-circle:hover {
  border-color: var(--txt-on-color);
  background-color: var(--glass-panel-hover-bg);
}

.action-btn:hover {
  background-color: var(--glass-panel-hover-bg);
}
</style>

<template>
  <Motion
    :initial="{ opacity: 0, y: 14, scale: 0.97 }"
    :animate="removing
      ? { opacity: 0, y: 0, scale: 0.93 }
      : { opacity: 1, y: 0, scale: 1 }"
    :transition="{ duration: 0.30, ease: [0.16, 1, 0.3, 1] }"
    class="mb-2.5"
    :style="removing ? { height: 0, overflow: 'hidden', marginBottom: 0, pointerEvents: 'none' } : {}"
    tag="div"
  >
    <div
      class="rounded-2xl overflow-hidden backdrop-blur-xl cursor-pointer"
      :class="{ shaking }"
      :style="{
        background: style.gradient,
        boxShadow: `0 5px 28px ${style.glow}, var(--glass-card-inset)${selected ? ',0 0 0 2.5px var(--glass-card-selected-ring)' : ''}`,
        border: '1px solid var(--glass-card-border)',
      }"
      @click="openEdit"
    >
      <div class="flex items-center gap-3.5 px-4 py-3">
        <button
          class="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-150 focus:outline-none cursor-pointer check-circle"
          :style="{
            borderColor: checked ? 'var(--txt-on-color)' : 'var(--glass-card-border)',
            backgroundColor: checked ? 'var(--txt-on-color)' : 'transparent',
          }"
          @click.stop="handleCheck"
        >
          <Check
            v-if="checked"
            :size="12"
            :stroke-width="3.5"
            class="check-pop"
            :style="{ color: style.accent }"
          />
        </button>

        <span
          class="flex-1 text-sm font-semibold text-white leading-snug truncate"
          :class="{ 'line-through opacity-50': checked }"
        >{{ task.description }}</span>

        <template v-if="task.tags && task.tags.length > 0">
          <span
            v-for="tag in task.tags.slice(0, 2)"
            :key="tag"
            class="shrink-0 text-[10px] px-2 py-0.5 rounded-lg"
            :style="{ background: 'var(--glass-card-tag-bg)', color: 'var(--glass-card-tag-text)' }"
          >{{ tag }}</span>
          <span
            v-if="task.tags.length > 2"
            class="shrink-0 text-[10px] px-2 py-0.5 rounded-lg"
            :style="{ background: 'var(--glass-card-tag-bg)', color: 'var(--txt-muted)' }"
          >+{{ task.tags.length - 2 }}</span>
        </template>

        <span
          v-if="task.priority"
          class="shrink-0 text-[10px] px-2 py-0.5 rounded-lg font-semibold"
          :class="{
            'priority-h': task.priority === 'H',
            'priority-m': task.priority === 'M',
            'priority-l': task.priority === 'L',
          }"
        >{{ task.priority === 'H' ? '紧急' : task.priority === 'M' ? '普通' : '低优' }}</span>

        <span
          v-if="dueLabel"
          class="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold"
          :class="overdue ? 'due-overdue' : 'due-normal'"
        >{{ dueLabel }}</span>

        <span
          v-if="elapsed > 0"
          class="shrink-0 text-[10px] font-mono"
          :style="{ color: 'var(--glass-card-tag-text)' }"
        >{{ formattedTime }}</span>

        <button
          v-if="task.status === 'pending'"
          class="shrink-0 p-1 rounded-lg transition-colors cursor-pointer action-btn"
          :style="{ color: isTracking ? 'var(--txt-accent)' : 'var(--txt-muted)' }"
          @click.stop="openTimer"
        >
          <Square v-if="isTracking" :size="12" fill="currentColor" />
          <Play v-else :size="12" fill="currentColor" />
        </button>
      </div>
    </div>
  </Motion>
</template>
