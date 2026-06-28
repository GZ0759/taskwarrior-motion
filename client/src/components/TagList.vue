<script setup lang="ts">
import { computed } from 'vue'
import { Tag } from '@lucide/vue'
import { useTaskStore } from '@/stores/task'

const store = useTaskStore()

const emit = defineEmits<{
  (e: 'select', name: string): void
}>()

// 统计标签使用次数
const tagStats = computed(() => {
  const map: Record<string, number> = {}
  store.tasks.forEach(t => {
    t.tags?.forEach(tag => {
      map[tag] = (map[tag] ?? 0) + 1
    })
  })
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }))
})
</script>

<template>
  <div>
    <div class="space-y-1">
      <button
        v-for="tag in tagStats"
        :key="tag.name"
        class="w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors cursor-pointer"
        :style="{ '--hover-bg': 'var(--glass-panel-hover-bg)' }"
        @mouseenter="($event.currentTarget as HTMLElement).style.background = 'var(--glass-panel-hover-bg)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.background = ''"
        @click="emit('select', tag.name)"
      >
        <span class="flex items-center gap-2 text-[12px] font-medium" :style="{ color: 'var(--txt-primary)' }">
          <Tag :size="11" :style="{ color: 'var(--txt-muted)' }" />
          {{ tag.name }}
        </span>
        <span
          class="text-[10px] px-2 py-0.5 rounded-full"
          :style="{
            background: 'var(--glass-input-bg)',
            color: 'var(--txt-muted)',
          }"
        >{{ tag.count }}</span>
      </button>

      <div
        v-if="tagStats.length === 0"
        class="text-center py-4"
      >
        <p class="text-xs" :style="{ color: 'var(--txt-subtle)' }">暂无标签</p>
      </div>
    </div>
  </div>
</template>
