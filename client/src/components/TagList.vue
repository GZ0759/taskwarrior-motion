<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useTheme } from '@/composables/useTheme'

const store = useTaskStore()
const { isDark } = useTheme()

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
    <div
      class="text-[10px] font-black uppercase tracking-widest mb-3.5"
      :style="{ color: 'var(--txt-muted)' }"
    >标签</div>
    <div class="space-y-2">
      <button
        v-for="tag in tagStats"
        :key="tag.name"
        class="w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer"
        :class="isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'"
        @click="emit('select', tag.name)"
      >
        <span class="text-[11px] font-semibold" :style="{ color: 'var(--txt-primary)' }">
          {{ tag.name }}
        </span>
        <span
          class="text-[10px] px-2 py-0.5 rounded-full"
          :style="{
            background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
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
