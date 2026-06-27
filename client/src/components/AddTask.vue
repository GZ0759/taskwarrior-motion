<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Plus } from '@lucide/vue'
import { useTheme } from '@/composables/useTheme'
import { useSound } from '@/composables/useSound'

const emit = defineEmits<{
  (e: 'add', description: string): void
}>()

const { isDark } = useTheme()
const { playAdd } = useSound()

const active = ref(false)
const value = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function activate() {
  active.value = true
  nextTick(() => inputRef.value?.focus())
}

function submit() {
  if (!value.value.trim()) {
    active.value = false
    return
  }
  emit('add', value.value.trim())
  playAdd()
  value.value = ''
  active.value = false
}

function cancel() {
  active.value = false
  value.value = ''
}
</script>

<template>
  <!-- 未激活状态 -->
  <button
    v-if="!active"
    class="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl backdrop-blur-xl border transition-all group"
    :class="isDark
      ? 'bg-white/[0.07] border-white/[0.13]'
      : 'bg-white/60 border-white/75'"
    @click="activate"
  >
    <div
      class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
      :class="isDark
        ? 'border-white/30 group-hover:border-white/60 group-hover:bg-white/12'
        : 'border-indigo-300 group-hover:border-indigo-400 group-hover:bg-indigo-50'"
    >
      <Plus
        :size="13"
        :stroke-width="2.5"
        class="transition-colors"
        :class="isDark
          ? 'text-white/40 group-hover:text-white/80'
          : 'text-gray-400 group-hover:text-indigo-500'"
      />
    </div>
    <span
      class="text-sm font-semibold transition-colors"
      :class="isDark
        ? 'text-white/45 group-hover:text-white/80'
        : 'text-gray-400 group-hover:text-gray-700'"
    >添加任务</span>
  </button>

  <!-- 激活状态 -->
  <div
    v-else
    class="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl backdrop-blur-xl border"
    :class="isDark
      ? 'bg-white/[0.07] border-white/[0.13] ring-1 ring-white/18'
      : 'bg-white/60 border-white/75 ring-1 ring-indigo-300/50'"
  >
    <div
      class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
      :class="isDark ? 'border-white/30' : 'border-indigo-300'"
    >
      <Plus
        :size="12"
        :class="isDark ? 'text-white/35' : 'text-indigo-400'"
      />
    </div>
    <input
      ref="inputRef"
      v-model="value"
      placeholder="输入任务名称，回车确认…"
      class="flex-1 bg-transparent text-sm font-medium outline-none"
      :class="isDark
        ? 'text-white placeholder-white/35'
        : 'text-gray-800 placeholder-gray-400'"
      @keydown.enter="submit"
      @keydown.escape="cancel"
    />
    <div class="flex gap-1.5 shrink-0">
      <button
        class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
        :class="isDark
          ? 'text-white/45 hover:bg-white/10 hover:text-white'
          : 'text-gray-500 hover:bg-gray-100'"
        @click="cancel"
      >取消</button>
      <button
        class="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
        :class="isDark
          ? 'bg-white/15 text-white hover:bg-white/25'
          : 'bg-indigo-500 text-white hover:bg-indigo-600'"
        @click="submit"
      >确认</button>
    </div>
  </div>
</template>
