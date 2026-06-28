<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { X } from '@lucide/vue'
import { Motion } from 'motion-v'

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  isDark: boolean
  maxW?: string
  editableTitle?: boolean
}>(), {
  maxW: 'max-w-md',
  editableTitle: false,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:title', value: string): void
}>()

const editing = ref(false)
const editValue = ref('')
const titleInputRef = ref<HTMLInputElement | null>(null)

function startEdit() {
  if (!props.editableTitle) return
  editValue.value = props.title
  editing.value = true
  nextTick(() => titleInputRef.value?.focus())
}

function confirmEdit() {
  if (editValue.value.trim() && editValue.value !== props.title) {
    emit('update:title', editValue.value.trim())
  }
  editing.value = false
}

function cancelEdit() {
  editing.value = false
}

const cardStyle = () => ({
  background: 'var(--glass-modal-bg)',
  backdropFilter: 'blur(var(--glass-modal-blur)) saturate(var(--glass-modal-saturate))',
  WebkitBackdropFilter: 'blur(var(--glass-modal-blur)) saturate(var(--glass-modal-saturate))',
  border: '1px solid var(--glass-modal-border)',
  boxShadow: 'var(--shadow-modal), var(--glass-modal-inset)',
})

function handleCloseHover(e: MouseEvent, enter: boolean) {
  const el = e.currentTarget as HTMLElement
  el.style.background = enter ? 'var(--glass-panel-hover-bg)' : 'transparent'
}

const borderGrad = 'linear-gradient(135deg,var(--accent-indigo),var(--accent-indigo-light),var(--grad-border-pink),var(--grad-border-amber),var(--grad-border-cyan),var(--accent-indigo))'
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-6">
    <Motion
      class="absolute inset-0 glass-overlay"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :transition="{ duration: 0.2 }"
      @click="emit('close')"
    />
    <Motion
      :initial="{ scale: 0.90, opacity: 0, y: 24 }"
      :animate="{ scale: 1, opacity: 1, y: 0 }"
      :exit="{ scale: 0.92, opacity: 0, y: 12 }"
      :transition="{ type: 'spring', stiffness: 340, damping: 28 }"
      :class="['relative z-10 w-full rounded-3xl grad-flow p-[1px]', maxW]"
      :style="{ background: borderGrad, backgroundSize: '200% 100%' }"
    >
      <div
        class="rounded-3xl overflow-hidden flex flex-col"
        :style="{ ...cardStyle(), maxHeight: '80vh' }"
      >
        <div
          class="flex items-start justify-between px-6 py-5 shrink-0"
          :style="{ borderBottom: '1px solid var(--divider)' }"
        >
          <div>
            <h2
              v-if="!editing"
              class="text-base font-black cursor-pointer"
              :class="{ 'hover:opacity-80': editableTitle }"
              :style="{ color: 'var(--txt-primary)' }"
              @click="startEdit"
            >{{ title }}</h2>
            <input
              v-else
              ref="titleInputRef"
              v-model="editValue"
              class="text-base font-black outline-none bg-transparent"
              :style="{ color: 'var(--txt-primary)', caretColor: 'var(--caret-color)' }"
              @keydown.enter="confirmEdit"
              @keydown.escape="cancelEdit"
              @blur="confirmEdit"
            />
            <p v-if="subtitle" class="text-xs mt-0.5" :style="{ color: 'var(--txt-muted)' }">{{ subtitle }}</p>
          </div>
          <button
            class="p-1.5 rounded-xl transition-colors mt-0.5 cursor-pointer"
            :style="{ color: 'var(--txt-muted)' }"
            @mouseenter="handleCloseHover($event, true)"
            @mouseleave="handleCloseHover($event, false)"
            @click="emit('close')"
          >
            <X :size="14" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <slot />
        </div>
      </div>
    </Motion>
  </div>
</template>
