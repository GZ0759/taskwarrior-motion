<script setup lang="ts">
import { computed } from 'vue'
import { CircleCheckBig } from '@lucide/vue'
import { Motion } from 'motion-v'
import ModalShell from './ModalShell.vue'
import { getCardStyle } from '@/utils/card-styles'
import type { Task } from '@/types/task'

const props = defineProps<{
  project: string
  tasks: Task[]
  isDark: boolean
  allProjects: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'rename', oldName: string, newName: string): void
  (e: 'delete', name: string): void
}>()

const tp = () => props.isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)'
const tm = () => props.isDark ? 'rgba(255,255,255,0.42)' : 'rgba(15,10,40,0.46)'

const pTasks = computed(() => props.tasks.filter(t => t.project === props.project))
const pending = computed(() => pTasks.value.filter(t => t.status !== 'completed'))
const done = computed(() => pTasks.value.filter(t => t.status === 'completed'))
const pct = computed(() => pTasks.value.length > 0 ? Math.round((done.value.length / pTasks.value.length) * 100) : 0)

const cs = computed(() => getCardStyle(props.project, 0))

function handleRename(oldName: string, newName: string) {
  if (newName.trim() && newName !== oldName) {
    emit('rename', oldName, newName)
  }
}

function handleDelete() {
  emit('delete', props.project)
  emit('close')
}
</script>

<template>
  <ModalShell
    :title="project"
    :subtitle="`${done.length}/${pTasks.length} 完成 · ${pct}%`"
    :is-dark="isDark"
    max-w="max-w-lg"
    :editable-title="true"
    @close="emit('close')"
    @update:title="handleRename(project, $event)"
  >
    <div
      class="rounded-xl overflow-hidden h-2"
      :style="{ background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)' }"
    >
      <Motion
        :initial="{ width: 0 }"
        :animate="{ width: `${pct}%` }"
        :transition="{ duration: 0.8 }"
        class="h-full rounded-xl"
        :style="{ background: cs.gradient }"
      />
    </div>

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
          v-for="t in done.slice(0, 8)"
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
