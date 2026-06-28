<script setup lang="ts">
import { computed } from 'vue'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent, TooltipRoot, TooltipTrigger, TooltipPortal, TooltipContent, TooltipProvider } from 'radix-vue'
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
  (e: 'update', id: string, data: Partial<Task>, currentStatus?: string): void
  (e: 'start', id: string): void
  (e: 'stop', id: string): void
  (e: 'delete', id: string): void
}>()

const { activeTask } = useTimeTracking()

const cols = [
  { key: 'inbox', label: '还在看', tip: '新建的任务默认在这里，还没分配项目', filter: (t: Task) => t.status !== 'completed' && t.status === 'pending' && !t.project },
  { key: 'backlog', label: '排队中', tip: '编辑任务归属项目后自动移入', filter: (t: Task) => t.status !== 'completed' && t.status === 'pending' && !!t.project },
  { key: 'ip', label: '做着呢', tip: '点击"开始计时"后移入，表示正在做', filter: (t: Task) => t.status !== 'completed' && t.status === 'started' },
  { key: 'hold', label: '等一下', tip: '手动设置为搁置状态的任务', filter: (t: Task) => t.status !== 'completed' && t.status === 'on-hold' },
  { key: 'done', label: '搞定了', tip: '已完成的任务', filter: (t: Task) => t.status === 'completed' },
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
  background: 'var(--glass-modal-bg)',
  backdropFilter: 'blur(32px) saturate(200%)',
  WebkitBackdropFilter: 'blur(32px) saturate(200%)',
  border: '1px solid var(--glass-modal-border)',
  borderRadius: '12px',
  padding: '6px',
  minWidth: '140px',
  boxShadow: 'var(--shadow-dropdown)',
})
</script>

<template>
  <TooltipProvider :delay-duration="300">
    <div class="flex gap-3 h-full overflow-x-auto pb-2">
    <div
      v-for="(col, colIdx) in columnData"
      :key="col.key"
      class="flex flex-col rounded-2xl overflow-hidden flex-1 min-w-[180px]"
      :style="{
        background: 'var(--glass-panel-bg)',
        border: '1px solid var(--glass-panel-border)',
      }"
    >
      <div class="flex items-center gap-2 px-3 py-3 shrink-0">
        <TooltipRoot>
          <TooltipTrigger asChild>
            <span class="text-xs font-bold" :style="{ color: 'var(--txt-primary)' }">{{ col.label }}</span>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              :side-offset="6"
              class="z-50 px-3 py-1.5 rounded-xl text-[11px] max-w-[200px]"
              :style="{
                background: 'var(--glass-modal-bg)',
                backdropFilter: 'blur(var(--glass-modal-blur))',
                WebkitBackdropFilter: 'blur(var(--glass-modal-blur))',
                border: '1px solid var(--glass-modal-border)',
                color: 'var(--txt-primary)',
                boxShadow: 'var(--shadow-dropdown)',
              }"
            >{{ col.tip }}</TooltipContent>
          </TooltipPortal>
        </TooltipRoot>
        <span
          class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
          :style="{ background: 'var(--glass-input-bg)', color: 'var(--txt-muted)' }"
        >{{ col.tasks.length }}</span>
      </div>

      <div class="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
        <div
          v-for="(t, idx) in col.tasks"
          :key="t.uuid"
          class="rounded-xl p-3"
          :style="{
            background: getCardStyle(t.project ?? '', colIdx + idx).gradient,
            boxShadow: `${getCardStyle(t.project ?? '', colIdx + idx).glow}, var(--glass-card-inset)`,
            border: '1px solid var(--glass-card-border)',
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
                :style="{ background: 'var(--priority-h-bg)', color: 'var(--priority-h-text)' }"
                @click="emit('complete', t.uuid, t.description)"
              >完成</button>
              <button
                v-else
                class="text-[9px] px-2 py-1 rounded-lg font-semibold cursor-pointer"
                :style="{ background: 'var(--glass-card-tag-bg)', color: 'var(--glass-card-tag-text)' }"
                @click="emit('update', t.uuid, { status: 'pending' }, t.status)"
              >取消</button>
            </div>

            <PopoverRoot>
              <PopoverTrigger asChild>
                <button
                  class="kanban-action-btn px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer text-xs font-bold"
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
                      class="kanban-popover-item w-full text-left px-3 py-2 text-[11px] rounded-lg transition-colors cursor-pointer"
                      @click="emit('update', t.uuid, { project: '' })"
                    >移动到还在看</button>
                    <button
                      v-if="col.key !== 'backlog' && t.status !== 'completed'"
                      class="kanban-popover-item w-full text-left px-3 py-2 text-[11px] rounded-lg transition-colors cursor-pointer"
                      @click="emit('update', t.uuid, { project: t.project || 'default' })"
                    >移动到排队中</button>
                    <button
                      v-if="t.status !== 'completed' && col.key !== 'ip'"
                      class="kanban-popover-item w-full text-left px-3 py-2 text-[11px] rounded-lg transition-colors cursor-pointer"
                      @click="emit('start', t.uuid)"
                    >开始计时</button>
                    <button
                      v-if="t.status !== 'completed' && col.key === 'ip'"
                      class="kanban-popover-item w-full text-left px-3 py-2 text-[11px] rounded-lg transition-colors cursor-pointer"
                      @click="emit('stop', t.uuid)"
                    >停止计时</button>
                    <button
                      class="kanban-popover-item w-full text-left px-3 py-2 text-[11px] rounded-lg transition-colors cursor-pointer"
                      @click="emit('edit', t)"
                    >编辑</button>
                    <button
                      class="btn-danger w-full text-left px-3 py-2 text-[11px] rounded-lg transition-colors cursor-pointer"
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
          :style="{ color: 'var(--txt-muted)' }"
        >空</div>
      </div>
    </div>
    </div>
  </TooltipProvider>
</template>

<style scoped>
.kanban-action-btn {
  color: var(--txt-muted);
}
.kanban-action-btn:hover {
  color: var(--txt-primary);
  background: var(--glass-panel-hover-bg);
}
.kanban-popover-item {
  color: var(--txt-primary);
}
.kanban-popover-item:hover {
  background: var(--glass-panel-hover-bg);
}
</style>
