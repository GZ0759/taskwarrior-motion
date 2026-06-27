<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useTheme } from '@/composables/useTheme'
import type { Task } from '@/types/task'

const store = useTaskStore()
const { isDark } = useTheme()

const daysToShow = ref(14)

const completedTasks = computed(() => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToShow.value)

  return store.completedTasks
    .filter((t) => {
      if (t.end) {
        return new Date(t.end) >= cutoffDate
      }
      return false
    })
    .sort((a, b) => {
      if (a.end && b.end) {
        return new Date(b.end).getTime() - new Date(a.end).getTime()
      }
      return 0
    })
})

const emit = defineEmits<{
  edit: [task: Task]
}>()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-black" :style="{ color: 'var(--txt-primary)' }">已完成</h2>

      <div class="flex items-center gap-2">
        <span class="text-xs" :style="{ color: 'var(--txt-muted)' }">显示最近</span>
        <select
          v-model="daysToShow"
          class="px-3 py-1.5 text-xs font-semibold rounded-xl outline-none"
          :style="{
            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.60)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.75)'}`,
            color: 'var(--txt-primary)',
          }"
        >
          <option :value="7">7 天</option>
          <option :value="14">14 天</option>
          <option :value="30">30 天</option>
          <option :value="90">90 天</option>
        </select>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-if="completedTasks.length === 0"
      class="text-center py-12"
    >
      <div
        class="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
        :style="{
          background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.08)',
        }"
      >
        <svg
          class="w-6 h-6"
          :style="{ color: isDark ? 'rgba(255,255,255,0.30)' : '#818cf8' }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-sm" :style="{ color: 'var(--txt-muted)' }">
        最近 {{ daysToShow }} 天没有已完成的任务
      </p>
    </div>

    <!-- 任务列表 -->
    <div v-else class="space-y-2">
      <div
        v-for="task in completedTasks"
        :key="task.uuid"
        class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
        :style="{
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.30)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.50)'}`,
        }"
      >
        <!-- 完成图标 -->
        <div
          class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
          :style="{ background: isDark ? 'rgba(34,197,94,0.20)' : 'rgba(34,197,94,0.15)' }"
        >
          <svg
            class="w-3 h-3"
            :style="{ color: isDark ? '#86efac' : '#22c55e' }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <!-- 任务信息 -->
        <div class="flex-1 min-w-0">
          <p
            class="text-sm font-medium line-through opacity-60 truncate"
            :style="{ color: 'var(--txt-primary)' }"
          >{{ task.description }}</p>
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
            >{{ new Date(task.end).toLocaleDateString('zh-CN') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
