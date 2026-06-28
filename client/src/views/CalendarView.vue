<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { Task } from '@/types/task'

const props = defineProps<{
  tasks: Task[]
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', task: Task): void
}>()

type CalView = 'month' | 'week'

const calView = ref<CalView>('month')
const calDate = ref(new Date())

const chipColors: Record<string, { background: string; color: string }> = {
  H: { background: 'var(--priority-h-bg)', color: 'var(--priority-h-text)' },
  M: { background: 'var(--priority-m-bg)', color: 'var(--priority-m-text)' },
  L: { background: 'var(--priority-l-bg)', color: 'var(--priority-l-text)' },
}

function fmt(d: Date): string {
  return d.toISOString().split('T')[0]
}

const todayStr = fmt(new Date())

const year = computed(() => calDate.value.getFullYear())
const month = computed(() => calDate.value.getMonth())

const cells = computed(() => {
  const y = year.value
  const m = month.value
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const result: Array<{ day: number | null; date: string }> = []
  for (let i = 0; i < firstDay; i++) result.push({ day: null, date: '' })
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    result.push({ day: d, date: ds })
  }
  while (result.length % 7 !== 0) result.push({ day: null, date: '' })
  return result
})

function getTasksForDate(dateStr: string): Task[] {
  return props.tasks.filter(t => {
    if (!t.due || t.status === 'completed') return false
    const taskDate = t.due.length >= 8
      ? `${t.due.slice(0, 4)}-${t.due.slice(4, 6)}-${t.due.slice(6, 8)}`
      : t.due
    return taskDate === dateStr
  })
}

const weekStart = computed(() => {
  const d = new Date(calDate.value)
  d.setDate(d.getDate() - d.getDay())
  return d
})

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.value)
    d.setDate(weekStart.value.getDate() + i)
    return { date: fmt(d), day: d.getDate(), dow: d.getDay() }
  })
)

const dayNames = ['日', '一', '二', '三', '四', '五', '六']

function navigate(direction: number) {
  const d = new Date(calDate.value)
  if (calView.value === 'month') d.setMonth(d.getMonth() + direction)
  else d.setDate(d.getDate() + direction * 7)
  calDate.value = d
}

function goToToday() {
  calDate.value = new Date()
}

const tabBtnStyle = (v: string) =>
  calView.value === v
    ? { background: 'var(--accent-indigo)', color: 'var(--txt-on-color)' }
    : { color: 'var(--txt-muted)' }
</script>

<template>
  <div class="flex flex-col h-full gap-3">
    <div class="flex items-center gap-3 shrink-0">
      <div
        class="flex rounded-xl overflow-hidden"
        :style="{ background: 'var(--glass-input-bg)' }"
      >
        <button
          class="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
          :style="tabBtnStyle('month')"
          @click="calView = 'month'"
        >月</button>
        <button
          class="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
          :style="tabBtnStyle('week')"
          @click="calView = 'week'"
        >周</button>
      </div>

      <button
        class="p-1.5 rounded-xl cursor-pointer"
        :style="{ color: 'var(--txt-muted)' }"
        @click="navigate(-1)"
        @mouseenter="($event.target as HTMLElement).style.background = 'var(--glass-panel-hover-bg)'; ($event.target as HTMLElement).style.color = 'var(--txt-primary)'"
        @mouseleave="($event.target as HTMLElement).style.background = ''; ($event.target as HTMLElement).style.color = 'var(--txt-muted)'"
      >
        <ChevronLeft :size="14" />
      </button>
      <button
        class="text-[11px] px-2.5 py-1 rounded-xl font-semibold cursor-pointer"
        :style="{ background: 'var(--glass-input-bg)', color: 'var(--txt-muted)' }"
        @click="goToToday"
        @mouseenter="($event.target as HTMLElement).style.background = 'var(--glass-panel-hover-bg)'"
        @mouseleave="($event.target as HTMLElement).style.background = 'var(--glass-input-bg)'"
      >今天</button>
      <button
        class="p-1.5 rounded-xl cursor-pointer"
        :style="{ color: 'var(--txt-muted)' }"
        @click="navigate(1)"
        @mouseenter="($event.target as HTMLElement).style.background = 'var(--glass-panel-hover-bg)'; ($event.target as HTMLElement).style.color = 'var(--txt-primary)'"
        @mouseleave="($event.target as HTMLElement).style.background = ''; ($event.target as HTMLElement).style.color = 'var(--txt-muted)'"
      >
        <ChevronRight :size="14" />
      </button>

      <span class="text-sm font-semibold" :style="{ color: 'var(--txt-primary)' }">
        {{ calView === 'month'
          ? calDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
          : weekDays[0].date + ' 至 ' + weekDays[6].date
        }}
      </span>
    </div>

    <div v-if="calView === 'month'" class="flex-1 overflow-auto">
      <div class="rounded-3xl overflow-hidden border border-[var(--glass-panel-border)]">
      <div
        class="grid grid-cols-7 sticky top-0 z-10"
      >
        <div
          v-for="d in dayNames"
          :key="d"
          class="text-center text-[10px] font-bold py-2"
          :style="{ color: 'var(--txt-weekday)' }"
        >{{ d }}</div>
      </div>
      <div
        class="grid grid-cols-7 border-l border-t"
        :style="{ borderColor: 'var(--border-default)' }"
      >
        <div
          v-for="(cell, i) in cells"
          :key="i"
          class="border-r border-b p-1.5"
          :style="{
            minHeight: '90px',
            borderColor: 'var(--border-default)',
            background: !cell.day
              ? 'transparent'
              : cell.date === todayStr
                ? 'var(--today-highlight)'
                : undefined,
          }"
        >
          <div
            v-if="cell.day"
            class="text-xs font-bold mb-1"
            :style="{
              color: cell.date === todayStr
                ? 'var(--txt-accent)'
                : cell.date < todayStr
                  ? 'var(--txt-subtle)'
                  : 'var(--txt-primary)',
            }"
          >{{ cell.day }}</div>
          <template v-if="cell.date">
            <button
              v-for="t in getTasksForDate(cell.date).slice(0, 3)"
              :key="t.uuid"
              class="w-full text-left text-[10px] px-1.5 py-0.5 rounded-md mb-0.5 truncate font-medium hover:opacity-80 cursor-pointer"
              :style="chipColors[t.priority || 'L']"
              @click="emit('edit', t)"
            >{{ t.description }}</button>
            <span
              v-if="getTasksForDate(cell.date).length > 3"
              class="text-[9px]"
              :style="{ color: 'var(--txt-muted)' }"
            >+{{ getTasksForDate(cell.date).length - 3 }} 更多</span>
          </template>
        </div>
      </div>
      </div>
    </div>

    <div v-else class="flex-1 overflow-auto">
      <div class="grid grid-cols-7 gap-2 h-full min-h-[200px]">
        <div
          v-for="wd in weekDays"
          :key="wd.date"
          class="flex flex-col rounded-xl p-2"
          :style="{
            background: wd.date === todayStr
              ? 'var(--today-highlight)'
              : 'var(--glass-panel-bg)',
            border: `1px solid var(--border-default)`,
          }"
        >
          <div
            class="text-xs font-bold mb-2 text-center"
            :style="{ color: wd.date === todayStr ? 'var(--txt-accent)' : 'var(--txt-primary)' }"
          >
            {{ dayNames[wd.dow] }}<br />
            <span class="text-base">{{ wd.day }}</span>
          </div>
          <div class="space-y-1 flex-1">
            <button
              v-for="t in getTasksForDate(wd.date).slice(0, 5)"
              :key="t.uuid"
              class="w-full text-left text-[10px] px-2 py-1 rounded-lg truncate font-medium hover:opacity-80 cursor-pointer"
              :style="chipColors[t.priority || 'L']"
              @click="emit('edit', t)"
            >{{ t.description }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
