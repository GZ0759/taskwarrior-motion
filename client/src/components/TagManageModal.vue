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
      <p class="text-[10px] font-black uppercase tracking-widest mb-2" :style="{ color: 'var(--txt-muted)' }">
        待办 ({{ pending.length }})
      </p>
      <div class="space-y-1">
        <div
          v-for="t in pending"
          :key="t.uuid"
          class="flex items-center gap-2 px-3 py-2 rounded-xl"
          :style="{ background: 'var(--glass-input-bg)' }"
        >
          <div
            class="w-3 h-3 rounded-full border-2 shrink-0"
            :style="{ borderColor: 'var(--glass-input-border)' }"
          />
          <span class="text-xs" :style="{ color: 'var(--txt-primary)' }">{{ t.description }}</span>
        </div>
      </div>
    </div>

    <div v-if="done.length > 0">
      <p class="text-[10px] font-black uppercase tracking-widest mb-2" :style="{ color: 'var(--txt-muted)' }">
        已完成 ({{ done.length }})
      </p>
      <div class="space-y-1">
        <div
          v-for="t in done.slice(0, 6)"
          :key="t.uuid"
          class="flex items-center gap-2 px-3 py-2 rounded-xl"
          :style="{ background: 'var(--glass-input-bg)' }"
        >
          <CircleCheckBig :size="12" :style="{ color: 'var(--txt-success)', flexShrink: 0 }" />
          <span class="text-xs line-through" :style="{ color: 'var(--txt-muted)' }">{{ t.description }}</span>
        </div>
      </div>
    </div>

    <div class="flex gap-2 pt-2" :style="{ borderTop: '1px solid var(--divider)' }">
      <button
        class="btn-danger px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
        @click="handleDelete"
      >删除</button>
      <button
        class="btn-primary flex-1 py-2.5 rounded-xl text-xs font-black cursor-pointer"
        @click="emit('close')"
      >确定</button>
    </div>
  </ModalShell>
</template>
