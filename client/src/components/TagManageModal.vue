<script setup lang="ts">
import { ref, computed } from 'vue'
import { Pencil, Trash2, CircleCheckBig } from '@lucide/vue'
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
const fieldBg = () => props.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'

const renaming = ref(false)
const newName = ref(props.tag)
const confirmDel = ref(false)

const tTasks = computed(() => props.tasks.filter(t => t.tags?.includes(props.tag)))
const pending = computed(() => tTasks.value.filter(t => t.status !== 'completed'))
const done = computed(() => tTasks.value.filter(t => t.status === 'completed'))

function handleRename() {
  if (newName.value.trim() && newName.value !== props.tag) {
    emit('rename', props.tag, newName.value.trim())
  }
  renaming.value = false
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
    @close="emit('close')"
  >
    <div v-if="!confirmDel && !renaming" class="flex gap-2">
      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        :style="{ background: fieldBg(), color: tm() }"
        @click="renaming = true; newName = tag"
      >
        <Pencil :size="11" />重命名
      </button>
      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
        @click="confirmDel = true"
      >
        <Trash2 :size="11" />删除标签
      </button>
    </div>

    <div v-if="renaming" class="flex gap-2">
      <input
        v-model="newName"
        class="flex-1 rounded-xl px-3 py-2 text-xs outline-none"
        :style="{ background: fieldBg(), color: tp() }"
        @keydown.enter="handleRename"
        @keydown.escape="renaming = false"
      />
      <button
        class="px-3 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold cursor-pointer"
        @click="handleRename"
      >确认</button>
      <button
        class="px-3 py-2 rounded-xl text-xs cursor-pointer"
        :style="{ background: fieldBg(), color: tm() }"
        @click="renaming = false"
      >取消</button>
    </div>

    <div
      v-if="confirmDel"
      class="rounded-2xl p-4"
      :style="{
        background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(254,242,242,1)',
        border: '1px solid rgba(239,68,68,0.25)',
      }"
    >
      <p class="text-sm font-medium text-red-400 mb-3">确认删除标签「{{ tag }}」？</p>
      <div class="flex gap-2">
        <button
          class="flex-1 py-2 rounded-xl bg-red-500 text-white text-xs font-bold cursor-pointer"
          @click="handleDelete"
        >确认删除</button>
        <button
          class="flex-1 py-2 rounded-xl text-xs cursor-pointer"
          :style="{ background: fieldBg(), color: tm() }"
          @click="confirmDel = false"
        >取消</button>
      </div>
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
  </ModalShell>
</template>
