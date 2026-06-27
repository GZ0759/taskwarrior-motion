<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Check, Trash2, Edit3 } from '@lucide/vue'
import { useTheme } from '@/composables/useTheme'
import { useTaskStore } from '@/stores/task'

const props = defineProps<{
  show: boolean
  tagName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'rename', oldName: string, newName: string): void
  (e: 'delete', name: string): void
}>()

const { isDark } = useTheme()
const store = useTaskStore()

const isEditing = ref(false)
const editName = ref('')
const showDeleteConfirm = ref(false)

// 标签下的任务
const tagTasks = computed(() => {
  return store.tasks.filter(t => t.tags?.includes(props.tagName))
})

const pendingTasks = computed(() => tagTasks.value.filter(t => t.status === 'pending'))
const completedTasks = computed(() => tagTasks.value.filter(t => t.status === 'completed'))

function startEdit() {
  editName.value = props.tagName
  isEditing.value = true
}

function confirmEdit() {
  if (editName.value.trim() && editName.value !== props.tagName) {
    emit('rename', props.tagName, editName.value.trim())
  }
  isEditing.value = false
}

function confirmDelete() {
  emit('delete', props.tagName)
  showDeleteConfirm.value = false
  emit('close')
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-6">
    <!-- 遮罩 -->
    <div
      class="absolute inset-0 glass-overlay"
      @click="emit('close')"
    />

    <!-- 弹窗 -->
    <div
      class="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden max-h-[80vh] flex flex-col"
      :style="{
        background: isDark ? 'rgba(20,8,50,0.95)' : 'rgba(255,255,255,0.95)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)'}`,
        boxShadow: '0 32px 90px rgba(0,0,0,0.30)',
      }"
    >
      <!-- 头部 -->
      <div
        class="flex items-center justify-between px-6 py-4 shrink-0"
        :style="{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'}` }"
      >
        <div class="flex-1 min-w-0">
          <!-- 标签名 / 编辑模式 -->
          <div v-if="isEditing" class="flex items-center gap-2">
            <input
              v-model="editName"
              class="flex-1 px-3 py-1.5 rounded-xl text-base font-black outline-none"
              :style="{
                background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)',
                color: 'var(--txt-primary)',
              }"
              @keydown.enter="confirmEdit"
              @keydown.escape="isEditing = false"
            />
            <button
              class="p-1.5 rounded-xl transition-colors"
              :class="isDark ? 'text-green-400 hover:bg-green-400/10' : 'text-green-600 hover:bg-green-50'"
              @click="confirmEdit"
            >
              <Check :size="16" />
            </button>
          </div>
          <h3 v-else class="text-base font-black truncate" :style="{ color: 'var(--txt-primary)' }">
            #{{ tagName }}
          </h3>
          <p class="text-xs mt-0.5" :style="{ color: 'var(--txt-muted)' }">
            {{ tagTasks.length }} 个任务
          </p>
        </div>
        <button
          class="p-1.5 rounded-xl transition-colors ml-2"
          :style="{ color: 'var(--txt-muted)' }"
          @click="emit('close')"
        >
          <X :size="16" />
        </button>
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex gap-2 px-6 py-3 shrink-0"
        :style="{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }"
      >
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
          :class="isDark
            ? 'text-white/60 hover:text-white hover:bg-white/10'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'"
          @click="startEdit"
        >
          <Edit3 :size="12" /> 重命名
        </button>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
          :class="isDark
            ? 'text-red-400/60 hover:text-red-400 hover:bg-red-400/10'
            : 'text-red-500 hover:text-red-600 hover:bg-red-50'"
          @click="showDeleteConfirm = true"
        >
          <Trash2 :size="12" /> 删除标签
        </button>
      </div>

      <!-- 任务列表 -->
      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        <!-- 待办任务 -->
        <div v-if="pendingTasks.length > 0">
          <p class="text-[10px] font-black uppercase tracking-widest mb-2" :style="{ color: 'var(--txt-muted)' }">
            待办 ({{ pendingTasks.length }})
          </p>
          <div class="space-y-1.5">
            <div
              v-for="task in pendingTasks"
              :key="task.uuid"
              class="flex items-center gap-2 px-3 py-2 rounded-xl"
              :style="{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }"
            >
              <div
                class="w-4 h-4 rounded-full border-2 shrink-0"
                :style="{ borderColor: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.20)' }"
              />
              <span class="text-sm truncate" :style="{ color: 'var(--txt-primary)' }">
                {{ task.description }}
              </span>
            </div>
          </div>
        </div>

        <!-- 已完成任务 -->
        <div v-if="completedTasks.length > 0">
          <p class="text-[10px] font-black uppercase tracking-widest mb-2" :style="{ color: 'var(--txt-muted)' }">
            已完成 ({{ completedTasks.length }})
          </p>
          <div class="space-y-1.5">
            <div
              v-for="task in completedTasks"
              :key="task.uuid"
              class="flex items-center gap-2 px-3 py-2 rounded-xl"
              :style="{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }"
            >
              <div
                class="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                :style="{ background: isDark ? 'rgba(34,197,94,0.20)' : 'rgba(34,197,94,0.15)' }"
              >
                <Check :size="10" :stroke-width="3" :style="{ color: isDark ? '#86efac' : '#22c55e' }" />
              </div>
              <span class="text-sm truncate line-through opacity-60" :style="{ color: 'var(--txt-primary)' }">
                {{ task.description }}
              </span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-if="tagTasks.length === 0"
          class="text-center py-8"
        >
          <p class="text-sm" :style="{ color: 'var(--txt-muted)' }">该标签暂无任务</p>
        </div>
      </div>

      <!-- 删除确认 -->
      <div
        v-if="showDeleteConfirm"
        class="absolute inset-0 flex items-center justify-center z-20"
        :style="{
          background: isDark ? 'rgba(20,8,50,0.95)' : 'rgba(255,255,255,0.95)',
        }"
      >
        <div class="text-center px-6">
          <p class="text-base font-black mb-2" :style="{ color: 'var(--txt-primary)' }">
            确认删除「{{ tagName }}」标签？
          </p>
          <p class="text-sm mb-6" :style="{ color: 'var(--txt-muted)' }">
            将从所有关联任务中移除该标签
          </p>
          <div class="flex gap-3 justify-center">
            <button
              class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              :class="isDark ? 'text-white/60 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'"
              @click="showDeleteConfirm = false"
            >取消</button>
            <button
              class="px-4 py-2 rounded-xl text-sm font-bold transition-colors bg-red-500 text-white hover:bg-red-600"
              @click="confirmDelete"
            >删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
