<script setup lang="ts">
import { computed } from 'vue'
import ModalShell from './ModalShell.vue'
import { useTimeTracking } from '@/composables/useTimeTracking'
import type { Task } from '@/types/task'

const props = defineProps<{
  task: Task
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'start', uuid: string): void
  (e: 'stop', uuid: string): void
}>()

const { activeTask, formattedTime, elapsedTime } = useTimeTracking()

const isTracking = computed(() => activeTask.value?.uuid === props.task.uuid)

const displayTime = computed(() => {
  if (!isTracking.value) return '00:00:00'
  const seconds = elapsedTime.value
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const statusText = computed(() => isTracking.value ? '计时中' : '未开始')

function handleToggle() {
  if (isTracking.value) {
    emit('stop', props.task.uuid)
  } else {
    emit('start', props.task.uuid)
  }
}
</script>

<template>
  <ModalShell
    :title="task.description.length > 30 ? task.description.slice(0, 30) + '…' : task.description"
    :is-dark="isDark"
    max-w="max-w-sm"
    @close="emit('close')"
  >
    <div class="flex flex-col items-center gap-4 py-4">
      <span
        class="font-mono font-black tabular-nums"
        :style="{
          fontSize: 48,
          color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)',
        }"
      >{{ displayTime }}</span>

      <span
        class="text-xs font-semibold"
        :style="{ color: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(15,10,40,0.46)' }"
      >{{ statusText }}</span>

      <button
        class="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
        :style="{
          background: isTracking
            ? 'linear-gradient(135deg,#F59E0B,#D97706)'
            : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
          boxShadow: isTracking
            ? '0 4px 18px rgba(245,158,11,0.40)'
            : '0 4px 18px rgba(99,102,241,0.45)',
        }"
        @click="handleToggle"
      >{{ isTracking ? '暂停' : '开始' }}</button>
    </div>
  </ModalShell>
</template>
