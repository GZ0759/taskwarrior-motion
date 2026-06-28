<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Check, ChevronDown, Play, Square } from '@lucide/vue'
import { Motion } from 'motion-v'
import { useTheme } from '@/composables/useTheme'
import { useSound } from '@/composables/useSound'
import { useTimeTracking } from '@/composables/useTimeTracking'
import { getCardStyle } from '@/utils/card-styles'
import { formatDue, isOverdue } from '@/utils/date'
import type { Task, UpdateTaskRequest } from '@/types/task'

const props = defineProps<{
  task: Task
  index: number
  selected: boolean
  allProjects: string[]
  allTags: string[]
}>()

const emit = defineEmits<{
  (e: 'complete', uuid: string, desc: string): void
  (e: 'edit', task: Task): void
  (e: 'delete', uuid: string): void
}>()

const { isDark } = useTheme()
const { playComplete } = useSound()
const { activeTask, formattedTime, elapsedTime, toggleTracking } = useTimeTracking()

const style = computed(() => getCardStyle(props.task.project ?? '', props.index))

// 状态
const shaking = ref(false)
const checked = ref(false)
const removing = ref(false)

// 时间追踪
const isTracking = computed(() => activeTask.value?.uuid === props.task.uuid)
const elapsed = computed(() => {
  if (isTracking.value) return elapsedTime.value
  return 0
})

// 日期
const overdue = computed(() => isOverdue(props.task.due))
const dueLabel = computed(() => formatDue(props.task.due))

// 完成动画
function handleCheck() {
  if (shaking.value || removing.value) return
  shaking.value = true
  playComplete()
  setTimeout(() => {
    shaking.value = false
    checked.value = true
    setTimeout(() => {
      removing.value = true
      setTimeout(() => emit('complete', props.task.uuid, props.task.description), 330)
    }, 380)
  }, 520)
}

// 删除
function handleDelete() {
  removing.value = true
  setTimeout(() => emit('delete', props.task.uuid), 300)
}

// 打开编辑弹窗
function openEdit() {
  emit('edit', props.task)
}
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y: 14, scale: 0.97 }"
    :animate="removing
      ? { opacity: 0, y: 0, scale: 0.93 }
      : { opacity: 1, y: 0, scale: 1 }"
    :transition="{ duration: 0.30, ease: [0.16, 1, 0.3, 1] }"
    class="mb-2.5"
    :style="removing ? { height: 0, overflow: 'hidden', marginBottom: 0, pointerEvents: 'none' } : {}"
    tag="div"
  >
    <div
      class="rounded-2xl overflow-hidden backdrop-blur-xl"
      :class="{ shaking }"
      :style="{
        background: style.gradient,
        boxShadow: `0 5px 28px ${style.glow}, 0 1px 0 rgba(255,255,255,0.18) inset${selected ? ',0 0 0 2.5px rgba(255,255,255,0.65)' : ''}`,
        border: '1px solid rgba(255,255,255,0.15)',
      }"
    >
      <!-- 第一行：checkbox + 描述 + 截止日期 -->
      <div class="flex items-center gap-3.5 px-4 pt-3.5 pb-2">
        <!-- 完成按钮 -->
        <button
          class="shrink-0 w-6 h-6 rounded-full border-2 border-white/45 flex items-center justify-center transition-all duration-150 hover:border-white hover:bg-white/20 focus:outline-none cursor-pointer"
          :style="checked ? { backgroundColor: 'rgba(255,255,255,0.92)' } : {}"
          @click="handleCheck"
        >
          <Check
            v-if="checked"
            :size="12"
            :stroke-width="3.5"
            class="check-pop"
            :style="{ color: style.accent }"
          />
        </button>

        <!-- 任务描述 -->
        <span
          class="flex-1 text-sm font-semibold text-white leading-snug"
          :class="{ 'line-through opacity-50': checked }"
        >{{ task.description }}</span>

        <!-- 截止日期 -->
        <span
          v-if="dueLabel"
          class="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold"
          :class="overdue ? 'due-overdue' : 'due-normal'"
        >{{ dueLabel }}</span>
      </div>

      <!-- 第二行：标签 + 优先级 + 计时 + 编辑 -->
      <div class="flex items-center gap-1.5 px-4 pb-3.5 flex-wrap">
        <!-- 标签 -->
        <div v-if="task.tags && task.tags.length > 0" class="flex gap-1 flex-wrap flex-1 min-w-0">
          <span
            v-for="tag in task.tags.slice(0, 3)"
            :key="tag"
            class="text-[10px] px-2 py-0.5 rounded-lg bg-white/15 text-white/80 truncate"
          >{{ tag }}</span>
          <span
            v-if="task.tags.length > 3"
            class="text-[10px] px-2 py-0.5 rounded-lg"
            :style="{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.60)' }"
          >+{{ task.tags.length - 3 }}</span>
        </div>
        <div v-else class="flex-1" />

        <!-- 优先级 badge -->
        <span
          v-if="task.priority"
          class="text-[10px] px-2 py-0.5 rounded-lg font-semibold"
          :class="{
            'priority-h': task.priority === 'H',
            'priority-m': task.priority === 'M',
            'priority-l': task.priority === 'L',
          }"
        >{{ task.priority === 'H' ? '紧急' : task.priority === 'M' ? '普通' : '低优' }}</span>

        <div class="flex-1" />

        <!-- 计时显示 -->
        <span
          v-if="elapsed > 0"
          class="text-[10px] font-mono"
          :style="{ color: 'rgba(255,255,255,0.80)' }"
        >{{ formattedTime }}</span>

        <!-- 计时器按钮 -->
        <button
          v-if="task.status === 'pending'"
          class="shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
          :style="{ color: isTracking ? 'rgba(255,220,100,0.90)' : 'rgba(255,255,255,0.50)' }"
          @click="toggleTracking(task)"
        >
          <Square v-if="isTracking" :size="12" fill="currentColor" />
          <Play v-else :size="12" fill="currentColor" />
        </button>

        <!-- 编辑按钮 -->
        <button
          class="shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
          :style="{ color: 'rgba(255,255,255,0.50)' }"
          @click="openEdit"
        >
          <ChevronDown :size="13" />
        </button>
      </div>
    </div>
  </Motion>
</template>
