<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useTheme } from '@/composables/useTheme'

const store = useTaskStore()
const { isDark } = useTheme()

// 日期工具
function fmt(d: Date): string {
  return d.toISOString().split('T')[0]
}

const today = new Date()
const todayStr = fmt(today)

// 统计每日完成数
const countMap = computed(() => {
  const map: Record<string, number> = {}
  store.completedTasks.forEach((t) => {
    if (t.end) {
      // end 格式: "20260627T040146Z" → 转为 "2026-06-27"
      const dateStr = t.end.slice(0, 4) + '-' + t.end.slice(4, 6) + '-' + t.end.slice(6, 8)
      map[dateStr] = (map[dateStr] ?? 0) + 1
    }
  })
  return map
})

// 35 天格子数据
const cells = computed(() => {
  return Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (34 - i))
    const ds = fmt(d)
    return {
      date: ds,
      dayNum: d.getDate(),
      count: countMap.value[ds] ?? 0,
      isToday: ds === todayStr,
    }
  })
})

// 第一天是星期几（用于前面留空）
const firstDow = computed(() => {
  return new Date(cells.value[0].date + 'T00:00:00').getDay()
})

// 今日完成数
const todayCount = computed(() => countMap.value[todayStr] ?? 0)

// 累计完成数
const totalDone = computed(() => store.completedTasks.length)

// 鼓励文案
const message = computed(() => {
  const n = todayCount.value
  if (n === 0) return '今天还没开始，加油！'
  if (n <= 2) return `完成 ${n} 项，继续！`
  if (n <= 5) return `完成 ${n} 项，状态很棒！`
  return `完成 ${n} 项，今日之星！`
})

// 热力图颜色
function cellBg(count: number): string {
  if (isDark.value) {
    if (count === 0) return 'rgba(255,255,255,0.09)'
    if (count === 1) return 'rgba(74,222,128,0.55)'
    if (count === 2) return 'rgba(34,197,94,0.75)'
    if (count === 3) return 'rgba(22,163,74,0.88)'
    return 'rgba(21,128,61,0.96)'
  } else {
    if (count === 0) return 'rgba(0,0,0,0.07)'
    if (count === 1) return 'rgba(34,197,94,0.55)'
    if (count === 2) return 'rgba(22,163,74,0.72)'
    if (count === 3) return 'rgba(21,128,61,0.85)'
    return 'rgba(20,83,45,0.92)'
  }
}

function cellTxt(count: number): string {
  if (count > 0) return isDark.value ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.96)'
  return isDark.value ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.38)'
}

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
</script>

<template>
  <div class="space-y-4">
    <!-- 顶部统计 -->
    <div class="flex items-end justify-between">
      <div>
        <div class="flex items-end gap-2">
          <span
            class="text-5xl font-black tabular-nums"
            :style="{ lineHeight: 1, color: 'var(--txt-primary)' }"
          >{{ todayCount }}</span>
          <span
            class="text-sm font-medium mb-1.5"
            :style="{ color: 'var(--txt-muted)' }"
          >今日完成</span>
        </div>
        <p class="text-xs mt-1" :style="{ color: 'var(--txt-subtle)' }">{{ message }}</p>
      </div>
      <div class="text-right">
        <div
          class="text-2xl font-black tabular-nums"
          :style="{ lineHeight: 1, color: 'var(--txt-primary)' }"
        >{{ totalDone }}</div>
        <div class="text-[11px] mt-0.5" :style="{ color: 'var(--txt-muted)' }">累计完成</div>
      </div>
    </div>

    <!-- 星期标签 -->
    <div class="grid grid-cols-7 gap-1.5">
      <div
        v-for="d in weekdays"
        :key="d"
        class="text-center text-[10px] font-bold"
        :style="{ color: 'var(--txt-weekday)' }"
      >{{ d }}</div>
    </div>

    <!-- 热力图格子 -->
    <div class="grid grid-cols-7 gap-1.5">
      <!-- 前面留空 -->
      <div v-for="i in firstDow" :key="'p' + i" class="aspect-square" />
      <!-- 格子 -->
      <div
        v-for="cell in cells"
        :key="cell.date"
        class="aspect-square rounded-xl flex items-center justify-center relative cursor-default select-none transition-transform hover:scale-110"
        :style="{ backgroundColor: cellBg(cell.count) }"
        :title="`${cell.date}：完成 ${cell.count} 项`"
      >
        <span
          class="text-[13px] font-bold tabular-nums"
          :style="{ color: cellTxt(cell.count) }"
        >{{ cell.dayNum }}</span>
        <!-- 今日圆环 -->
        <div
          v-if="cell.isToday"
          class="absolute inset-0 rounded-xl pointer-events-none"
          :style="{
            outline: `2.5px solid ${isDark ? 'rgba(255,255,255,0.75)' : 'rgba(99,102,241,0.85)'}`,
            outlineOffset: '2px',
          }"
        />
      </div>
    </div>

    <!-- 图例 -->
    <div class="flex items-center gap-1.5 justify-end">
      <span class="text-[9px]" :style="{ color: 'var(--txt-subtle)' }">少</span>
      <div
        v-for="v in 5"
        :key="v"
        class="w-3.5 h-3.5 rounded-[4px]"
        :style="{ backgroundColor: cellBg(v - 1) }"
      />
      <span class="text-[9px]" :style="{ color: 'var(--txt-subtle)' }">多</span>
    </div>
  </div>
</template>
