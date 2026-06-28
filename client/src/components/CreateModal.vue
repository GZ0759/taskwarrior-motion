<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Motion, AnimatePresence } from 'motion-v'
import { useSound } from '@/composables/useSound'
import ModalShell from './ModalShell.vue'

type CreateType = 'task' | 'project' | 'tag'

const props = defineProps<{
  type: CreateType
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'create', value: string): void
  (e: 'close'): void
}>()

const { playAdd } = useSound()
const value = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  setTimeout(() => inputRef.value?.focus(), 60)
})

const config = computed(() => {
  const map: Record<CreateType, { title: string; placeholder: string; btn: string }> = {
    task: { title: '新建任务', placeholder: '今天要完成什么？', btn: '创建任务' },
    project: { title: '新建项目', placeholder: '项目名称', btn: '创建项目' },
    tag: { title: '新建标签', placeholder: '标签名称', btn: '创建标签' },
  }
  return map[props.type]
})

function submit() {
  if (!value.value.trim()) {
    emit('close')
    return
  }
  emit('create', value.value.trim())
  playAdd()
  emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') submit()
  if (e.key === 'Escape') emit('close')
}

const tp = () => props.isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)'
const ts = () => props.isDark ? 'rgba(255,255,255,0.22)' : 'rgba(15,10,40,0.22)'
</script>

<template>
  <ModalShell
    :title="config.title"
    :is-dark="isDark"
    max-w="max-w-xl"
    @close="emit('close')"
  >
    <input
      ref="inputRef"
      v-model="value"
      class="w-full bg-transparent outline-none font-medium"
      :style="{ color: tp(), fontSize: 22, lineHeight: 1.4, caretColor: '#818CF8' }"
      :placeholder="config.placeholder"
      autocomplete="off"
      @keydown="handleKeydown"
    />

    <div class="flex items-center justify-between pt-2">
      <div class="flex items-center gap-4">
        <span class="text-[11px]" :style="{ color: ts() }">⏎ 创建</span>
        <span class="text-[11px]" :style="{ color: ts() }">Esc 取消</span>
      </div>
      <AnimatePresence>
        <Motion
          v-if="value.trim()"
          :initial="{ opacity: 0, x: 10, scale: 0.90 }"
          :animate="{ opacity: 1, x: 0, scale: 1 }"
          :exit="{ opacity: 0, x: 10, scale: 0.90 }"
          :transition="{ type: 'spring', stiffness: 400, damping: 28 }"
          tag="button"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
          :style="{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', boxShadow: '0 4px 18px rgba(99,102,241,0.45)' }"
          @click="submit"
        >
          {{ config.btn }}
        </Motion>
      </AnimatePresence>
    </div>
  </ModalShell>
</template>
