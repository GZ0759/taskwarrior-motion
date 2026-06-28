<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Motion, AnimatePresence } from 'motion-v'
import { useSound } from '@/composables/useSound'

const props = defineProps<{
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'add', desc: string): void
  (e: 'close'): void
}>()

const { playAdd } = useSound()
const value = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  setTimeout(() => inputRef.value?.focus(), 60)
})

function submit() {
  if (!value.value.trim()) {
    emit('close')
    return
  }
  emit('add', value.value.trim())
  playAdd()
  emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') submit()
  if (e.key === 'Escape') emit('close')
}

const tp = () => props.isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)'
const tm = () => props.isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,10,40,0.35)'
const ts = () => props.isDark ? 'rgba(255,255,255,0.22)' : 'rgba(15,10,40,0.22)'

const cardStyle = () => {
  if (props.isDark) {
    return {
      background: 'rgba(12,6,26,0.72)',
      backdropFilter: 'blur(60px) saturate(240%)',
      WebkitBackdropFilter: 'blur(60px) saturate(240%)',
      boxShadow: '0 1.5px 0 rgba(255,255,255,0.12) inset, 0 40px 80px rgba(0,0,0,0.70), 0 0 80px rgba(99,102,241,0.18)',
    }
  }
  return {
    background: 'rgba(250,248,255,0.80)',
    backdropFilter: 'blur(60px) saturate(200%)',
    WebkitBackdropFilter: 'blur(60px) saturate(200%)',
    boxShadow: '0 1.5px 0 rgba(255,255,255,0.88) inset, 0 32px 80px rgba(80,60,180,0.16), 0 0 60px rgba(99,102,241,0.10)',
  }
}

const borderGrad = 'linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899,#F59E0B,#06B6D4,#6366F1)'
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center px-5" style="padding-top: 32vh">
    <div class="absolute inset-0 glass-overlay" @click="emit('close')" />
    <Motion
      :initial="{ opacity: 0, scale: 0.92, y: -16 }"
      :animate="{ opacity: 1, scale: 1, y: 0 }"
      :exit="{ opacity: 0, scale: 0.92, y: -16 }"
      :transition="{ type: 'spring', stiffness: 380, damping: 28 }"
      class="relative z-10 w-full max-w-xl rounded-3xl grad-flow p-[1px]"
      :style="{ background: borderGrad, backgroundSize: '200% 100%' }"
    >
      <div class="rounded-3xl overflow-hidden" :style="cardStyle()">
        <div class="px-7 pt-7 pb-5">
          <div
            class="text-[10px] font-black uppercase tracking-[0.18em] mb-4"
            :style="{ color: isDark ? '#818CF8' : '#6366F1' }"
          >
            新建任务
          </div>
          <input
            ref="inputRef"
            v-model="value"
            class="w-full bg-transparent outline-none font-medium"
            :style="{ color: tp(), fontSize: 22, lineHeight: 1.4, caretColor: '#818CF8' }"
            placeholder="今天要完成什么？"
            autocomplete="off"
            @keydown="handleKeydown"
          />
        </div>

        <div class="flex items-center justify-between px-7 pb-6 pt-2">
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
              创建任务
            </Motion>
          </AnimatePresence>
        </div>
      </div>
    </Motion>
  </div>
</template>
