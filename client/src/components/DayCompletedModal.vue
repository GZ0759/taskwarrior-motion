<script setup lang="ts">
import { X, Check } from '@lucide/vue'
import { useTheme } from '@/composables/useTheme'
import type { Task } from '@/types/task'

defineProps<{
  show: boolean
  date: string
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { isDark } = useTheme()

function formatDate(dateStr: string): string {
  // YYYYMMDDTHHmmssZ → YYYY年MM月DD日
  if (dateStr.length >= 8) {
    const year = dateStr.slice(0, 4)
    const month = dateStr.slice(4, 6)
    const day = dateStr.slice(6, 8)
    return `${year}年${month}月${day}日`
  }
  return dateStr
}

function formatTime(dateStr: string): string {
  // YYYYMMDDTHHmmssZ → HH:MM
  if (dateStr.length >= 13) {
    const hour = dateStr.slice(9, 11)
    const minute = dateStr.slice(11, 13)
    return `${hour}:${minute}`
  }
  return ''
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-6">
    <!-- 遮罩 -->
    <div
      class="absolute inset-0 glass-overlay"
      @click="emit('close')"
    />

    <!-- 弹窗 -->
    <div
      class="relative z-10 w-full max-w-md rounded-3xl overflow-hidden max-h-[70vh] flex flex-col"
      :style="{
        background: isDark ? 'rgba(20,8,50,0.95)' : 'rgba(255,255,255,0.95)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)'}`,
        boxShadow: '0 32px 90px rgba(0,0,0,0.30)',
      }"
    >
      <!-- 头部 -->
      <div
        class="flex items-center justify-between px-6 py-4 shrink-0"
        :style="{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'}` }"
      >
        <div>
          <h3 class="text-base font-black" :style="{ color: 'var(--txt-primary)' }">
            {{ formatDate(date) }}
          </h3>
          <p class="text-xs mt-0.5" :style="{ color: 'var(--txt-muted)' }">
            完成 {{ tasks.length }} 个任务
          </p>
        </div>
        <button
          class="p-1.5 rounded-xl transition-colors"
          :style="{ color: 'var(--txt-muted)' }"
          @click="emit('close')"
        >
          <X :size="16" />
        </button>
      </div>

      <!-- 任务列表 -->
      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        <div
          v-if="tasks.length === 0"
          class="text-center py-8"
        >
          <p class="text-sm" :style="{ color: 'var(--txt-muted)' }">当日无完成任务</p>
        </div>

        <div
          v-for="task in tasks"
          :key="task.uuid"
          class="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors"
          :style="{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          }"
        >
          <!-- 完成图标 -->
          <div
            class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            :style="{ background: isDark ? 'rgba(34,197,94,0.20)' : 'rgba(34,197,94,0.15)' }"
          >
            <Check :size="12" :stroke-width="3" :style="{ color: isDark ? '#86efac' : '#22c55e' }" />
          </div>

          <!-- 任务信息 -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate" :style="{ color: 'var(--txt-primary)' }">
              {{ task.description }}
            </p>
            <div class="flex items-center gap-2 mt-0.5">
              <span
                v-if="task.project"
                class="text-[10px]"
                :style="{ color: 'var(--txt-subtle)' }"
              >{{ task.project }}</span>
              <span
                v-if="task.end"
                class="text-[10px]"
                :style="{ color: 'var(--txt-subtle)' }"
              >{{ formatTime(task.end) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
