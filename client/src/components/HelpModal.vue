<script setup lang="ts">
import { X } from '@lucide/vue'
import { useTheme } from '@/composables/useTheme'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { isDark } = useTheme()

const shortcuts = [
  { key: 'n', description: '新建任务' },
  { key: 'j', description: '选择下一个任务' },
  { key: 'k', description: '选择上一个任务' },
  { key: 'Enter', description: '编辑选中的任务' },
  { key: 'x', description: '完成选中的任务' },
  { key: 'Escape', description: '关闭弹窗' },
  { key: '?', description: '显示/隐藏帮助' },
  { key: 'Ctrl+Z', description: '撤销' },
]
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
      class="relative z-10 w-full max-w-sm rounded-3xl overflow-hidden"
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
        <h3 class="text-base font-black" :style="{ color: 'var(--txt-primary)' }">键盘快捷键</h3>
        <button
          class="p-1.5 rounded-xl transition-colors"
          :style="{ color: 'var(--txt-muted)' }"
          @click="emit('close')"
        >
          <X :size="16" />
        </button>
      </div>

      <!-- 快捷键列表 -->
      <div class="px-6 py-4 space-y-3">
        <div
          v-for="shortcut in shortcuts"
          :key="shortcut.key"
          class="flex items-center justify-between"
        >
          <span class="text-sm" :style="{ color: 'var(--txt-primary)' }">
            {{ shortcut.description }}
          </span>
          <kbd
            class="px-2 py-1 rounded-lg text-xs font-mono font-semibold"
            :style="{
              background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
              color: 'var(--txt-muted)',
            }"
          >{{ shortcut.key }}</kbd>
        </div>
      </div>
    </div>
  </div>
</template>
