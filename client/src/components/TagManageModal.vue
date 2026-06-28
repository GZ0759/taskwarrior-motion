<script setup lang="ts">
import { computed } from 'vue'
import { CircleCheckBig } from '@lucide/vue'
import ModalShell from './ModalShell.vue'
import type { Task } from '@/types/task'

const props = defineProps<{
  tag: string
  tasks: Task[]
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'rename', oldName: string, newName: string): void
  (e: 'delete', name: string): void
}>()

const tp = () => props.isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)'
const tm = () => props.isDark ? 'rgba(255,255,255,0.42)' : 'rgba(15,10,40,0.46)'

const tTasks = computed(() => props.tasks.filter(t => t.tags?.includes(props.tag)))
const pending = computed(() => tTasks.value.filter(t => t.status !== 'completed'))
const done = computed(() => tTasks.value.filter(t => t.status === 'completed'))

function handleRename(oldName: string, newName: string) {
  if (newName.trim() && newName !== oldName) {
    emit('rename', oldName, newName)
  }
}

function handleDelete() {
  emit('delete', props.tag)
  emit('close')
}
</script>

<template>
  <ModalShell
    :title="`#${tag}`"
    :subtitle="`${tTasks.length} 个任务`"
    :is-dark="isDark"
    :editable-title="true"
    @close="emit('close')"
    @update:title="handleRename(tag, $event)"
  >
    <div v-if="pending.length > 0">
      <p class="text-[10px] font-black uppercase tracking-widest mb-2" :style="{ color: tm() }">
        待办 ({{ pending.length }})
      </p>
      <div class="space-y-1">
        <div
          v-for="t in pending"
          :key="t.uuid"
          class="flex items-center gap-2 px-3 py-2 rounded-xl"
          :style="{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }"
        >
          <div
            class="w-3 h-3 rounded-full border-2 shrink-0"
            :style="{ borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.20)' }"
          />
          <span class="text-xs" :style="{ color: tp() }">{{ t.description }}</span>
        </div>
      </div>
    </div>

    <div v-if="done.length > 0">
      <p class="text-[10px] font-black uppercase tracking-widest mb-2" :style="{ color: tm() }">
        已完成 ({{ done.length }})
      </p>
      <div class="space-y-1">
        <div
          v-for="t in done.slice(0, 6)"
          :key="t.uuid"
          class="flex items-center gap-2 px-3 py-2 rounded-xl"
          :style="{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }"
        >
          <CircleCheckBig :size="12" :style="{ color: '#4ADE80', flexShrink: 0 }" />
          <span class="text-xs line-through" :style="{ color: tm() }">{{ t.description }}</span>
        </div>
      </div>
    </div>

    <div class="flex gap-2 pt-2" :style="{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }">
      <button
        class="px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors text-red-400 hover:bg-red-500/[0.12] cursor-pointer"
        @click="handleDelete"
      >删除</button>
      <button
        class="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-black hover:bg-indigo-600 transition-colors cursor-pointer"
        @click="emit('close')"
      >确定</button>
    </div>
  </ModalShell>
</template>
