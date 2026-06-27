<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useTheme } from '@/composables/useTheme'
import { getCardStyle } from '@/utils/card-styles'

const store = useTaskStore()
const { isDark } = useTheme()

interface ProjectStat {
  name: string
  total: number
  done: number
  pct: number
  gradient: string
}

const projects = computed<ProjectStat[]>(() => {
  // 提取所有项目
  const projectSet = new Set<string>()
  store.tasks.forEach((t) => {
    if (t.project) projectSet.add(t.project)
  })

  return Array.from(projectSet).map((name, i) => {
    const projectTasks = store.tasks.filter((t) => t.project === name)
    const done = projectTasks.filter((t) => t.status === 'completed').length
    const total = projectTasks.length
    const style = getCardStyle(name, i)
    return {
      name,
      total,
      done,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      gradient: style.gradient,
    }
  })
})
</script>

<template>
  <div>
    <div
      class="text-[10px] font-black uppercase tracking-widest mb-3.5"
      :style="{ color: 'var(--txt-muted)' }"
    >项目进度</div>
    <div class="space-y-3">
      <div v-for="p in projects" :key="p.name">
        <div class="flex justify-between mb-1.5">
          <span
            class="text-[11px] font-semibold"
            :style="{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(15,10,40,0.72)' }"
          >{{ p.name }}</span>
          <span class="text-[11px]" :style="{ color: 'var(--txt-muted)' }">
            {{ p.done }}/{{ p.total }}
          </span>
        </div>
        <div
          class="h-1.5 rounded-full overflow-hidden"
          :style="{ background: 'var(--progress-bg)' }"
        >
          <div
            class="h-full rounded-full transition-all duration-900 ease-out"
            :style="{ width: `${p.pct}%`, background: p.gradient }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
