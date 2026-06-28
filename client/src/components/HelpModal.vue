<script setup lang="ts">
import ModalShell from './ModalShell.vue'

const props = defineProps<{
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const tp = () => props.isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)'

const shortcuts = [
  { key: 'n', description: '新建任务' },
  { key: 'j', description: '选择下一个' },
  { key: 'k', description: '选择上一个' },
  { key: 'Enter', description: '编辑选中任务' },
  { key: 'x', description: '完成选中任务' },
  { key: 'Escape', description: '关闭弹窗' },
  { key: '?', description: '帮助' },
  { key: 'Ctrl+Z', description: '撤销' },
]
</script>

<template>
  <ModalShell
    title="键盘快捷键"
    :is-dark="isDark"
    max-w="max-w-sm"
    @close="emit('close')"
  >
    <div class="space-y-3">
      <div
        v-for="shortcut in shortcuts"
        :key="shortcut.key"
        class="flex items-center justify-between"
      >
        <span class="text-sm" :style="{ color: tp() }">{{ shortcut.description }}</span>
        <kbd
          class="px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold"
          :style="{
            background: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)',
            color: tp(),
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'}`,
          }"
        >{{ shortcut.key }}</kbd>
      </div>
    </div>
  </ModalShell>
</template>
