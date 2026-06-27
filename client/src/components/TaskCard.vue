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
  autoExpand?: boolean
}>()

const emit = defineEmits<{
  (e: 'complete', uuid: string, desc: string): void
  (e: 'update', uuid: string, data: UpdateTaskRequest): void
  (e: 'delete', uuid: string): void
  (e: 'addProject', v: string): void
  (e: 'deleteProject', v: string): void
  (e: 'addTag', v: string): void
  (e: 'deleteTag', v: string): void
}>()

const { isDark } = useTheme()
const { playComplete } = useSound()

const style = computed(() => getCardStyle(props.task.project ?? '', props.index))

// 状态
const expanded = ref(false)
const shaking = ref(false)
const checked = ref(false)
const removing = ref(false)

// 自动展开（从其他视图跳转编辑时）
watch(() => props.autoExpand, (val) => {
  if (val) expanded.value = true
}, { immediate: true })

// 编辑状态
const editProject = ref(props.task.project ?? '')
const editTags = ref<string[]>(props.task.tags ?? [])
const editPriority = ref(props.task.priority ?? 'M')
const editDue = ref(props.task.due ?? '')

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

// 保存编辑
function saveDetails() {
  emit('update', props.task.uuid, {
    project: editProject.value || undefined,
    tags: editTags.value.length > 0 ? editTags.value : undefined,
    priority: editPriority.value as 'H' | 'M' | 'L',
    due: editDue.value || undefined,
  })
  expanded.value = false
}

// 取消编辑
function cancelEdit() {
  expanded.value = false
  editProject.value = props.task.project ?? ''
  editTags.value = props.task.tags ?? []
  editPriority.value = props.task.priority ?? 'M'
  editDue.value = props.task.due ?? ''
}

// 删除
function handleDelete() {
  removing.value = true
  setTimeout(() => emit('delete', props.task.uuid), 300)
}

// 优先级标签
const priorityLabels: Record<string, string> = { H: '紧急', M: '普通', L: '低优' }
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

        <!-- 展开/折叠 -->
        <button
          class="shrink-0 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/15 transition-colors"
          @click="expanded = !expanded"
        >
          <ChevronUp v-if="expanded" :size="13" />
          <ChevronDown v-else :size="13" />
        </button>
      </div>

      <!-- 展开编辑区 -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-[500px] opacity-100"
        leave-from-class="max-h-[500px] opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <div v-if="expanded" class="overflow-hidden">
          <div
            class="px-4 pb-4 pt-2 space-y-3.5"
            :class="isDark ? 'glass-edit-dark' : 'glass-edit-light'"
          >
            <!-- 优先级 -->
            <div>
              <label class="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5 block">
                优先级
              </label>
              <div class="flex gap-2">
                <button
                  v-for="p in ['H', 'M', 'L']"
                  :key="p"
                  class="flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                  :class="editPriority === p
                    ? 'bg-white text-gray-800 shadow-md'
                    : 'bg-white/12 text-white/75 hover:bg-white/20'"
                  @click="editPriority = p"
                >{{ priorityLabels[p] }}</button>
              </div>
            </div>

            <!-- 截止日期 -->
            <div>
              <label class="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Calendar :size="8" /> 截止日期
              </label>
              <input
                v-model="editDue"
                type="date"
                class="w-full rounded-xl px-3 py-1.5 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-white/30"
                :style="{ background: 'rgba(255,255,255,0.12)' }"
              />
            </div>

            <!-- 项目选择器 -->
            <div>
              <label class="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <FolderOpen :size="8" /> 项目
              </label>
              <ProjectPicker
                :value="editProject"
                :options="allProjects"
                @update:value="editProject = $event"
                @add="emit('addProject', $event)"
                @delete="emit('deleteProject', $event)"
              />
            </div>

            <!-- 标签选择器 -->
            <div>
              <label class="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Tag :size="8" /> 标签
              </label>
              <TagPicker
                :selected="editTags"
                :options="allTags"
                @update:selected="editTags = $event"
                @add="emit('addTag', $event)"
                @delete="emit('deleteTag', $event)"
              />
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2 pt-1">
              <button
                class="flex-1 py-1.5 rounded-xl text-[11px] font-semibold text-white/60 hover:text-white hover:bg-white/12 transition-colors"
                @click="cancelEdit"
              >取消</button>
              <button
                class="flex-1 py-1.5 rounded-xl bg-white text-gray-800 text-[11px] font-black shadow-md hover:bg-white/90 transition-opacity"
                @click="saveDetails"
              >保存</button>
              <button
                class="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white/60 hover:text-white hover:bg-red-500/35 transition-colors"
                @click="handleDelete"
              >删除</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
