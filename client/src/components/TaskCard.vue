<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Check, ChevronDown, ChevronUp, Calendar, FolderOpen, Tag } from '@lucide/vue'
import { useTheme } from '@/composables/useTheme'
import { useSound } from '@/composables/useSound'
import { getCardStyle } from '@/utils/card-styles'
import type { Task, UpdateTaskRequest } from '@/types/task'
import ProjectPicker from './ProjectPicker.vue'
import TagPicker from './TagPicker.vue'

const props = defineProps<{
  task: Task
  index: number
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

const style = computed(() => getCardStyle(props.task.project ?? '', props.index))

// 状态
const shaking = ref(false)
const checked = ref(false)
const removing = ref(false)

// 日期格式化
function formatDue(d: string | null | undefined): string | null {
  if (!d) return null
  // due 格式: "20260628T000000Z" 或 ISO 格式
  const dateStr = d.length === 16
    ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
    : d.split('T')[0]
  const date = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.round((date.getTime() - now.getTime()) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff < 0) return `逾期${Math.abs(diff)}天`
  if (diff <= 7) return `${diff}天后`
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

function isOverdue(d: string | null | undefined): boolean {
  if (!d) return false
  const dateStr = d.length === 16
    ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
    : d.split('T')[0]
  return new Date(dateStr + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0))
}

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
  <div
    class="overflow-hidden mb-2.5 transition-all duration-300"
    :class="{ 'fade-out-down': removing }"
    :style="removing ? { opacity: 0, transform: 'scale(0.93)' } : {}"
  >
    <div
      class="rounded-2xl overflow-hidden backdrop-blur-xl"
      :class="{ shaking }"
      :style="{
        background: style.gradient,
        boxShadow: `0 5px 28px ${style.glow}, 0 1px 0 rgba(255,255,255,0.18) inset`,
        border: '1px solid rgba(255,255,255,0.15)',
      }"
    >
      <!-- 主行 -->
      <div class="flex items-center gap-3.5 px-4 py-3.5">
        <!-- 完成按钮 -->
        <button
          class="shrink-0 w-6 h-6 rounded-full border-2 border-white/45 flex items-center justify-center transition-all duration-150 hover:border-white hover:bg-white/20 focus:outline-none"
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

        <!-- 优先级圆点 -->
        <div
          class="shrink-0 w-1.5 h-1.5 rounded-full"
          :class="{
            'priority-h': task.priority === 'H',
            'priority-m': task.priority === 'M',
            'priority-l': task.priority === 'L',
          }"
        />

        <!-- 编辑按钮 -->
        <button
          class="shrink-0 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/15 transition-colors"
          @click="openEdit"
        >
          <ChevronDown :size="13" />
        </button>
      </div>
    </div>
  </div>
</template>
