<script setup lang="ts">
import { ref, watch } from 'vue'
import { taskDateToISO } from '@/utils/date'
import type { Task, UpdateTaskRequest } from '@/types/task'
import ModalShell from './ModalShell.vue'
import DatePickerInput from './DatePickerInput.vue'
import SimpleProjectSelect from './SimpleProjectSelect.vue'
import SimpleTagSelect from './SimpleTagSelect.vue'

const props = defineProps<{
  task: Task | null
  isDark: boolean
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

const description = ref('')
const editPriority = ref<'H' | 'M' | 'L'>('M')
const editDue = ref('')
const editWait = ref('')
const editProject = ref('')
const editTags = ref<string[]>([])

watch(() => props.task, (task) => {
  if (task) {
    description.value = task.description
    editProject.value = task.project ?? ''
    editTags.value = task.tags ?? []
    editPriority.value = task.priority ?? 'M'
    editDue.value = task.due ? taskDateToISO(task.due) : ''
    editWait.value = task.wait ? taskDateToISO(task.wait) : ''
  }
}, { immediate: true })

const priorityLabels: Record<string, string> = { H: '紧急', M: '普通', L: '低优' }

function toTaskwarriorDate(dateStr: string): string | undefined {
  if (!dateStr) return undefined
  return dateStr.replace(/-/g, '') + 'T000000Z'
}

function save() {
  if (!props.task) return
  emit('save', props.task.uuid, {
    description: description.value.trim() || undefined,
    project: editProject.value || undefined,
    tags: editTags.value.length > 0 ? editTags.value : undefined,
    priority: editPriority.value,
    due: toTaskwarriorDate(editDue.value),
    wait: toTaskwarriorDate(editWait.value),
    status: editWait.value ? 'on-hold' : (props.task.status === 'on-hold' && !editWait.value ? 'pending' : undefined),
  })
  emit('close')
}

function handleDelete() {
  if (!props.task) return
  emit('delete', props.task.uuid)
  emit('close')
}

const tm = () => props.isDark ? 'rgba(255,255,255,0.40)' : 'rgba(15,10,40,0.42)'
const fieldBg = () => props.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'
</script>

<template>
  <ModalShell
    v-if="task"
    title="编辑任务"
    :is-dark="isDark"
    @close="emit('close')"
  >
    <input
      v-model="description"
      class="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-400/30"
      :style="{
        background: fieldBg(),
        color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
      }"
    />

    <div>
      <label class="text-[9px] font-black uppercase tracking-widest mb-2 block" :style="{ color: tm() }">优先级</label>
      <div class="flex gap-2">
        <button
          v-for="p in (['H', 'M', 'L'] as const)"
          :key="p"
          class="flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
          :class="{
            'bg-red-500 text-white': editPriority === p && p === 'H',
            'bg-amber-400 text-white': editPriority === p && p === 'M',
            'bg-indigo-500 text-white': editPriority === p && p === 'L',
            'bg-white/[0.07] text-white/55 hover:bg-white/[0.12]': editPriority !== p && isDark,
            'bg-black/[0.04] text-gray-500 hover:bg-black/[0.07]': editPriority !== p && !isDark,
          }"
          @click="editPriority = p"
        >{{ priorityLabels[p] }}</button>
      </div>
    </div>

    <div>
      <label class="text-[9px] font-black uppercase tracking-widest mb-2 block" :style="{ color: tm() }">截止日期</label>
      <DatePickerInput v-model="editDue" placeholder="选择截止日期" :is-dark="isDark" />
    </div>

    <div>
      <label class="text-[9px] font-black uppercase tracking-widest mb-2 block" :style="{ color: tm() }">暂停到</label>
      <DatePickerInput v-model="editWait" placeholder="设置后任务进入暂停列" :is-dark="isDark" />
      <p class="text-[9px] mt-1.5 ml-0.5" :style="{ color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(15,10,40,0.28)' }">设置日期后，任务将进入「暂停」看板列</p>
    </div>

    <div>
      <label class="text-[9px] font-black uppercase tracking-widest mb-2 block" :style="{ color: tm() }">项目</label>
      <SimpleProjectSelect v-model="editProject" :options="allProjects" :is-dark="isDark" />
    </div>

    <div>
      <label class="text-[9px] font-black uppercase tracking-widest mb-2 block" :style="{ color: tm() }">标签</label>
      <SimpleTagSelect v-model:selected="editTags" :options="allTags" :is-dark="isDark" />
    </div>

    <div class="flex gap-2 pt-2" :style="{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }">
      <button
        class="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer hover:opacity-80"
        :style="{ color: tm(), background: fieldBg() }"
        @click="emit('close')"
      >取消</button>
      <button
        class="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-black hover:bg-indigo-600 transition-colors cursor-pointer"
        @click="save"
      >保存</button>
      <button
        class="px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors text-red-400 hover:bg-red-500/[0.12] cursor-pointer"
        @click="handleDelete"
      >删除</button>
    </div>
  </ModalShell>
</template>
