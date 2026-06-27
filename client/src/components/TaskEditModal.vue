<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Calendar, FolderOpen, Tag } from '@lucide/vue'
import { useTheme } from '@/composables/useTheme'
import type { Task, UpdateTaskRequest } from '@/types/task'
import ProjectPicker from './ProjectPicker.vue'
import TagPicker from './TagPicker.vue'

const props = defineProps<{
  task: Task | null
  allProjects: string[]
  allTags: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', uuid: string, data: UpdateTaskRequest): void
  (e: 'delete', uuid: string): void
  (e: 'addProject', v: string): void
  (e: 'deleteProject', v: string): void
  (e: 'addTag', v: string): void
  (e: 'deleteTag', v: string): void
}>()

const { isDark } = useTheme()

// 编辑状态
const editProject = ref('')
const editTags = ref<string[]>([])
const editPriority = ref<'H' | 'M' | 'L'>('M')
const editDue = ref('')
const editWait = ref('')

// 监听 task 变化，重置编辑状态
watch(() => props.task, (task) => {
  if (task) {
    editProject.value = task.project ?? ''
    editTags.value = task.tags ?? []
    editPriority.value = task.priority ?? 'M'
    editDue.value = task.due ?? ''
    editWait.value = task.wait ?? ''
  }
}, { immediate: true })

// 优先级标签
const priorityLabels: Record<string, string> = { H: '紧急', M: '普通', L: '低优' }

function save() {
  if (!props.task) return
  emit('save', props.task.uuid, {
    project: editProject.value || undefined,
    tags: editTags.value.length > 0 ? editTags.value : undefined,
    priority: editPriority.value,
    due: editDue.value || undefined,
    wait: editWait.value || undefined,
  })
  emit('close')
}

function handleDelete() {
  if (!props.task) return
  emit('delete', props.task.uuid)
  emit('close')
}
</script>

<template>
  <div v-if="task" class="fixed inset-0 z-50 flex items-center justify-center p-6">
    <!-- 遮罩 -->
    <div
      class="absolute inset-0 glass-overlay"
      @click="emit('close')"
    />

    <!-- 弹窗 -->
    <div
      class="relative z-10 w-full max-w-md rounded-3xl overflow-hidden"
      :style="{
        background: isDark ? 'rgba(20,8,50,0.95)' : 'rgba(255,255,255,0.95)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)'}`,
        boxShadow: '0 32px 90px rgba(0,0,0,0.30)',
      }"
    >
      <!-- 头部 -->
      <div
        class="flex items-center justify-between px-6 py-4"
        :style="{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'}` }"
      >
        <h3 class="text-base font-black" :style="{ color: 'var(--txt-primary)' }">编辑任务</h3>
        <button
          class="p-1.5 rounded-xl transition-colors"
          :style="{ color: 'var(--txt-muted)' }"
          @click="emit('close')"
        >
          <X :size="16" />
        </button>
      </div>

      <!-- 内容 -->
      <div class="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
        <!-- 任务描述 -->
        <div
          class="rounded-2xl px-4 py-3"
          :style="{
            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
          }"
        >
          <p class="text-sm font-semibold" :style="{ color: 'var(--txt-primary)' }">
            {{ task.description }}
          </p>
        </div>

        <!-- 优先级 -->
        <div>
          <label class="text-[9px] font-black uppercase tracking-widest mb-1.5 block" :style="{ color: 'var(--txt-muted)' }">
            优先级
          </label>
          <div class="flex gap-2">
            <button
              v-for="p in ['H', 'M', 'L']"
              :key="p"
              class="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              :class="editPriority === p
                ? (isDark ? 'bg-white text-gray-800' : 'bg-indigo-500 text-white')
                : (isDark ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')"
              @click="editPriority = p as 'H' | 'M' | 'L'"
            >{{ priorityLabels[p] }}</button>
          </div>
        </div>

        <!-- 截止日期 -->
        <div>
          <label class="text-[9px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1" :style="{ color: 'var(--txt-muted)' }">
            <Calendar :size="8" /> 截止日期
          </label>
          <input
            v-model="editDue"
            type="date"
            class="w-full rounded-xl px-3 py-2 text-xs font-medium outline-none"
            :style="{
              background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.04)',
              color: 'var(--txt-primary)',
            }"
          />
        </div>

        <!-- 等待日期 -->
        <div>
          <label class="text-[9px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1" :style="{ color: 'var(--txt-muted)' }">
            <Calendar :size="8" /> 暂停到
          </label>
          <input
            v-model="editWait"
            type="date"
            class="w-full rounded-xl px-3 py-2 text-xs font-medium outline-none"
            :style="{
              background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.04)',
              color: 'var(--txt-primary)',
            }"
          />
        </div>

        <!-- 项目 -->
        <div>
          <label class="text-[9px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1" :style="{ color: 'var(--txt-muted)' }">
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

        <!-- 标签 -->
        <div>
          <label class="text-[9px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1" :style="{ color: 'var(--txt-muted)' }">
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
      </div>

      <!-- 底部按钮 -->
      <div
        class="flex gap-2 px-6 py-4"
        :style="{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'}` }"
      >
        <button
          class="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors"
          :class="isDark
            ? 'text-white/60 hover:text-white hover:bg-white/10'
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'"
          @click="emit('close')"
        >取消</button>
        <button
          class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors"
          :class="isDark
            ? 'bg-white text-gray-800 hover:bg-white/90'
            : 'bg-indigo-500 text-white hover:bg-indigo-600'"
          @click="save"
        >保存</button>
        <button
          class="px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
          :class="isDark
            ? 'text-white/60 hover:text-white hover:bg-red-500/30'
            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'"
          @click="handleDelete"
        >删除</button>
      </div>
    </div>
  </div>
</template>
