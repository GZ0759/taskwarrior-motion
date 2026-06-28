<script setup lang="ts">
import { computed } from 'vue'
import { Motion } from 'motion-v'
import { useTaskStore } from '@/stores/task'
import { getCardStyle } from '@/utils/card-styles'

const store = useTaskStore()

const emit = defineEmits<{
  (e: 'select', name: string): void
}>()

interface ProjectStat {
  name: string
  total: number
  done: number
  pct: number
  gradient: string
}

const projects = computed<ProjectStat[]>(() => {
  // 优先从 stats 获取项目数据
  if (store.stats?.projects) {
    return Object.entries(store.stats.projects).map(([name, stat], i) => {
      const style = getCardStyle(name, i)
      return {
        name,
        total: stat.total,
        done: stat.done,
        pct: stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0,
        gradient: style.gradient,
      }
    })
  }

  // 回退：从 tasks 提取
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
    <div class="space-y-3">
      <div
        v-for="p in projects"
        :key="p.name"
        class="cursor-pointer rounded-xl px-2.5 py-2 transition-colors"
        @mouseenter="($event.currentTarget as HTMLElement).style.background = 'var(--glass-panel-hover-bg)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.background = ''"
        @click="emit('select', p.name)"
      >
        <div class="flex justify-between mb-1.5">
          <span
            class="text-[11px] font-semibold"
            :style="{ color: 'var(--txt-primary)' }"
          >{{ p.name }}</span>
          <span class="text-[11px]" :style="{ color: 'var(--txt-muted)' }">
            {{ p.done }}/{{ p.total }}
          </span>
        </div>
          <div
            class="h-1.5 rounded-full overflow-hidden"
            :style="{ background: 'var(--progress-bg)' }"
          >
            <Motion
              class="h-full rounded-full"
              :initial="{ width: '0%' }"
              :animate="{ width: `${p.pct}%` }"
              :transition="{ duration: 0.9, ease: 'easeOut' }"
              :style="{ background: p.gradient }"
              tag="div"
            />
          </div>
      </div>
    </div>
  </div>
</template>
