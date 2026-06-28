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
      class="w-full bg-transparent outline-none font-medium"
      :style="{
        color: 'var(--txt-primary)',
        fontSize: 22,
        lineHeight: 1.4,
        caretColor: 'var(--caret-color)',
      }"
    />

    <div>
      <label class="text-[9px] font-black uppercase tracking-widest mb-2 block" :style="{ color: 'var(--txt-muted)' }">优先级</label>
      <div class="flex gap-2">
        <button
          v-for="p in (['H', 'M', 'L'] as const)"
          :key="p"
          class="flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
          :class="{
            'priority-selected': editPriority === p,
            'priority-unselected': editPriority !== p,
          }"
          :style="editPriority === p
            ? { background: p === 'H' ? 'var(--priority-h-solid)' : p === 'M' ? 'var(--priority-m-solid)' : 'var(--priority-l-solid)', color: 'var(--txt-on-color)' }
            : { background: 'var(--glass-input-bg)', color: 'var(--txt-muted)' }
          "
          @click="editPriority = p"
        >{{ priorityLabels[p] }}</button>
      </div>
    </div>

    <div>
      <label class="text-[9px] font-black uppercase tracking-widest mb-2 block" :style="{ color: 'var(--txt-muted)' }">截止日期</label>
      <DatePickerInput v-model="editDue" placeholder="选择截止日期" />
    </div>

    <div>
      <label class="text-[9px] font-black uppercase tracking-widest mb-2 block" :style="{ color: 'var(--txt-muted)' }">暂停到</label>
      <DatePickerInput v-model="editWait" placeholder="设置后任务进入暂停列" />
      <p class="text-[9px] mt-1.5 ml-0.5" :style="{ color: 'var(--txt-subtle)' }">设置日期后，任务将进入「暂停」看板列</p>
    </div>

    <div>
      <label class="text-[9px] font-black uppercase tracking-widest mb-2 block" :style="{ color: 'var(--txt-muted)' }">项目</label>
      <SimpleProjectSelect v-model="editProject" :options="allProjects" />
    </div>

    <div>
      <label class="text-[9px] font-black uppercase tracking-widest mb-2 block" :style="{ color: 'var(--txt-muted)' }">标签</label>
      <SimpleTagSelect v-model:selected="editTags" :options="allTags" />
    </div>

    <div class="flex gap-2 pt-2" :style="{ borderTop: '1px solid var(--divider)' }">
      <button
        class="btn-danger px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
        @click="handleDelete"
      >删除</button>
      <button
        class="btn-primary flex-1 py-2.5 rounded-xl text-xs font-black cursor-pointer"
        @click="save"
      >保存</button>
    </div>
  </ModalShell>
</template>
