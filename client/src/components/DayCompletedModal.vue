<script setup lang="ts">
import { CircleCheckBig } from '@lucide/vue'
import ModalShell from './ModalShell.vue'
import EmptyDayIcon from './EmptyDayIcon.vue'
import type { Task } from '@/types/task'

const props = defineProps<{
  date: string
  tasks: Task[]
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const tp = () => props.isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)'
const tm = () => props.isDark ? 'rgba(255,255,255,0.42)' : 'rgba(15,10,40,0.46)'
const ts = () => props.isDark ? 'rgba(255,255,255,0.30)' : 'rgba(15,10,40,0.30)'

function formatDate(dateStr: string): string {
  let d: Date
  if (dateStr.includes('-')) {
    d = new Date(dateStr + 'T00:00:00')
  } else if (dateStr.length >= 8) {
    d = new Date(dateStr.slice(0, 4) + '-' + dateStr.slice(4, 6) + '-' + dateStr.slice(6, 8) + 'T00:00:00')
  } else {
    return dateStr
  }
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <ModalShell
    :title="formatDate(date)"
    :subtitle="tasks.length > 0 ? `完成 ${tasks.length} 个任务` : '这天没有完成任务'"
    :is-dark="isDark"
    @close="emit('close')"
  >
    <div v-if="tasks.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
      <EmptyDayIcon :is-dark="isDark" />
      <p class="text-sm font-semibold mt-5 mb-1.5" :style="{ color: tp() }">这一天安静地过去了</p>
      <p class="text-xs" :style="{ color: tm() }">没有完成的任务记录</p>
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="t in tasks"
        :key="t.uuid"
        class="flex items-start gap-3 rounded-2xl px-4 py-3"
        :style="{
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
        }"
      >
        <CircleCheckBig :size="15" :style="{ color: '#4ADE80', marginTop: 1, flexShrink: 0 }" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium" :style="{ color: tp() }">{{ t.description }}</p>
          <p class="text-[10px] mt-0.5" :style="{ color: ts() }">{{ t.project || '无项目' }}</p>
        </div>
      </div>
    </div>
  </ModalShell>
</template>
