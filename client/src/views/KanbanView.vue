<script setup lang="ts">
import { computed } from 'vue'
import { useTimeTracking } from '@/composables/useTimeTracking'
import type { Task } from '@/types/task'

const props = defineProps<{
  tasks: Task[]
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void
  (e: 'complete', id: string, desc: string): void
  (e: 'update', id: string, data: Partial<Task>): void
  (e: 'start', id: string): void
  (e: 'stop', id: string): void
}>()

const { activeTask, toggleTracking } = useTimeTracking()

const tp = () => props.isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)'
const tm = () => props.isDark ? 'rgba(255,255,255,0.42)' : 'rgba(15,10,40,0.46)'

const cols = [
  { key: 'inbox', label: 'Inbox', filter: (t: Task) => t.status !== 'completed' && t.status === 'pending' && !t.project },
  { key: 'backlog', label: 'Backlog', filter: (t: Task) => t.status !== 'completed' && t.status === 'pending' && !!t.project },
  { key: 'ip', label: 'In Progress', filter: (t: Task) => t.status !== 'completed' && t.status === 'started' },
  { key: 'hold', label: 'On Hold', filter: (t: Task) => t.status !== 'completed' && t.status === 'on-hold' },
  { key: 'done', label: 'Done', filter: (t: Task) => t.status === 'completed' },
]

const columnData = computed(() =>
  cols.map(col => ({
    ...col,
    tasks: props.tasks.filter(col.filter),
  }))
)

const priorityClass = (p: string) => {
  if (props.isDark) {
    return { H: 'bg-red-500/20 text-red-300', M: 'bg-amber-400/20 text-amber-200', L: 'bg-blue-400/20 text-blue-300' }[p] || ''
  }
  return 'bg-gray-100 text-gray-600'
}

const priorityLabel = (p: string) => ({ H: '紧急', M: '普通', L: '低优' }[p] || '')
</script>

<template>
  <div class="flex gap-3 h-full overflow-x-auto pb-2">
    <div
      v-for="col in columnData"
      :key="col.key"
      class="flex flex-col rounded-2xl shrink-0 overflow-hidden"
      :style="{
        width: '200px',
        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.35)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.60)'}`,
      }"
    >
      <div class="flex items-center gap-2 px-3 py-3 shrink-0">
        <span class="text-xs font-bold" :style="{ color: tp() }">{{ col.label }}</span>
        <span
          class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
          :style="{ background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)', color: tm() }"
        >{{ col.tasks.length }}</span>
      </div>

      <div class="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
        <div
          v-for="t in col.tasks"
          :key="t.uuid"
          class="rounded-xl p-3"
          :style="{
            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.65)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'}`,
          }"
        >
          <p
            class="text-[13px] font-medium mb-2 leading-snug"
            :style="{
              color: tp(),
              textDecoration: t.status === 'completed' ? 'line-through' : 'none',
              opacity: t.status === 'completed' ? 0.55 : 1,
            }"
          >{{ t.description }}</p>

          <div class="flex items-center gap-1 mb-2">
            <span
              v-if="t.priority"
              class="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
              :class="priorityClass(t.priority)"
            >{{ priorityLabel(t.priority) }}</span>
            <span v-if="t.project" class="text-[9px]" :style="{ color: tm() }">{{ t.project }}</span>
          </div>

          <div class="flex flex-wrap gap-1">
            <button
              v-if="t.status !== 'completed' && col.key !== 'ip'"
              class="text-[9px] px-2 py-1 rounded-lg font-semibold cursor-pointer"
              :style="{ background: 'rgba(59,130,246,0.20)', color: '#93c5fd' }"
              @click="emit('start', t.uuid)"
            >开始</button>
            <button
              v-if="t.status !== 'completed' && col.key === 'ip'"
              class="text-[9px] px-2 py-1 rounded-lg font-semibold cursor-pointer"
              :style="{ background: 'rgba(234,179,8,0.20)', color: '#fde68a' }"
              @click="emit('stop', t.uuid)"
            >暂停</button>
            <button
              v-if="t.status !== 'completed'"
              class="text-[9px] px-2 py-1 rounded-lg font-semibold cursor-pointer"
              :style="{ background: 'rgba(34,197,94,0.20)', color: '#86efac' }"
              @click="emit('complete', t.uuid, t.description)"
            >完成</button>
            <button
              v-if="t.status === 'completed'"
              class="text-[9px] px-2 py-1 rounded-lg font-semibold cursor-pointer"
              :style="{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: tm() }"
              @click="emit('update', t.uuid, { status: 'pending' })"
            >取消</button>
            <button
              class="text-[9px] px-2 py-1 rounded-lg font-semibold cursor-pointer"
              :style="{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: tm() }"
              @click="emit('edit', t)"
            >编辑</button>
          </div>
        </div>

        <div
          v-if="col.tasks.length === 0"
          class="text-center py-6 text-[11px]"
          :style="{ color: tm() }"
        >空</div>
      </div>
    </div>
  </div>
</template>
