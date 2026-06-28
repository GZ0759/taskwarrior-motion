<script setup lang="ts">
import { computed } from 'vue'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'radix-vue'
import { useTimeTracking } from '@/composables/useTimeTracking'
import { getCardStyle } from '@/utils/card-styles'
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
  (e: 'delete', id: string): void
}>()

const { activeTask } = useTimeTracking()

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

function handleDelete(uuid: string) {
  emit('delete', uuid)
}

const popoverStyle = () => ({
  background: props.isDark ? 'rgba(12,6,26,0.82)' : 'rgba(252,250,255,0.88)',
  backdropFilter: 'blur(32px) saturate(200%)',
  WebkitBackdropFilter: 'blur(32px) saturate(200%)',
  border: props.isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px',
  padding: '6px',
  minWidth: '140px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.30)',
})
</script>

<template>
  <div class="flex gap-3 h-full overflow-x-auto pb-2">
    <div
      v-for="(col, colIdx) in columnData"
      :key="col.key"
      class="flex flex-col rounded-2xl overflow-hidden flex-1 min-w-[180px]"
      :style="{
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
          v-for="(t, idx) in col.tasks"
          :key="t.uuid"
          class="rounded-xl p-3"
          :style="{
            background: getCardStyle(t.project ?? '', colIdx + idx).gradient,
            boxShadow: `0 5px 28px ${getCardStyle(t.project ?? '', colIdx + idx).glow}, 0 1px 0 rgba(255,255,255,0.18) inset`,
            border: '1px solid rgba(255,255,255,0.15)',
          }"
        >
          <p
            class="text-[13px] font-medium mb-2 leading-snug text-white"
            :style="{
              textDecoration: t.status === 'completed' ? 'line-through' : 'none',
              opacity: t.status === 'completed' ? 0.55 : 1,
            }"
          >{{ t.description }}</p>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <button
                v-if="t.status !== 'completed'"
                class="text-[9px] px-2 py-1 rounded-lg font-semibold cursor-pointer"
                :style="{ background: 'rgba(34,197,94,0.20)', color: '#86efac' }"
                @click="emit('complete', t.uuid, t.description)"
              >完成</button>
              <button
                v-else
                class="text-[9px] px-2 py-1 rounded-lg font-semibold cursor-pointer"
                :style="{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.70)' }"
                @click="emit('update', t.uuid, { status: 'pending' })"
              >取消</button>
            </div>

            <PopoverRoot>
              <PopoverTrigger asChild>
                <button
                  class="px-1.5 py-0.5 rounded-lg text-white/50 hover:text-white hover:bg-white/15 transition-colors cursor-pointer text-xs font-bold"
                >···</button>
              </PopoverTrigger>
              <PopoverPortal>
                <PopoverContent
                  align="end"
                  :style="popoverStyle()"
                  class="z-50"
                  :side-offset="4"
                >
                  <div class="flex flex-col gap-0.5">
                    <button
                      v-if="col.key !== 'inbox' && t.status !== 'completed'"
                      class="w-full text-left px-3 py-2 text-[11px] rounded-lg transition-colors cursor-pointer"
                      :style="{ color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(15,10,40,0.80)' }"
                      @mouseenter="($event.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'"
                      @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
                      @click="emit('update', t.uuid, { project: '' })"
                    >移动到 Inbox</button>
                    <button
                      v-if="col.key !== 'backlog' && t.status !== 'completed'"
                      class="w-full text-left px-3 py-2 text-[11px] rounded-lg transition-colors cursor-pointer"
                      :style="{ color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(15,10,40,0.80)' }"
                      @mouseenter="($event.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'"
                      @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
                      @click="emit('update', t.uuid, { project: t.project || 'default' })"
                    >移动到 Backlog</button>
                    <button
                      v-if="t.status !== 'completed' && col.key !== 'ip'"
                      class="w-full text-left px-3 py-2 text-[11px] rounded-lg transition-colors cursor-pointer"
                      :style="{ color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(15,10,40,0.80)' }"
                      @mouseenter="($event.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'"
                      @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
                      @click="emit('start', t.uuid)"
                    >开始计时</button>
                    <button
                      v-if="t.status !== 'completed' && col.key === 'ip'"
                      class="w-full text-left px-3 py-2 text-[11px] rounded-lg transition-colors cursor-pointer"
                      :style="{ color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(15,10,40,0.80)' }"
                      @mouseenter="($event.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'"
                      @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
                      @click="emit('stop', t.uuid)"
                    >停止计时</button>
                    <button
                      class="w-full text-left px-3 py-2 text-[11px] rounded-lg transition-colors cursor-pointer"
                      :style="{ color: isDark ? 'rgba(255,255,255,0.80)' : 'rgba(15,10,40,0.80)' }"
                      @mouseenter="($event.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'"
                      @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
                      @click="emit('edit', t)"
                    >编辑</button>
                    <button
                      class="w-full text-left px-3 py-2 text-[11px] rounded-lg transition-colors cursor-pointer text-red-400"
                      @mouseenter="($event.currentTarget as HTMLElement).style.background = isDark ? 'rgba(239,68,68,0.12)' : 'rgba(254,242,242,1)'"
                      @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
                      @click="handleDelete(t.uuid)"
                    >删除</button>
                  </div>
                </PopoverContent>
              </PopoverPortal>
            </PopoverRoot>
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
