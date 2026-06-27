<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check, Plus, X } from '@lucide/vue'

const props = defineProps<{
  selected: string[]
  options: string[]
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'update:selected', v: string[]): void
  (e: 'add', v: string): void
  (e: 'delete', v: string): void
}>()

const newVal = ref('')
const localAdded = ref<string[]>([])

// 合并 options 和本地新增
const allOptions = computed(() => {
  const set = new Set([...props.options, ...localAdded.value])
  return Array.from(set)
})

// 过滤建议（只显示未选中的）
const filteredOptions = computed(() => {
  const available = allOptions.value.filter((t) => !props.selected.includes(t))
  if (!newVal.value) return available
  return available.filter((t) =>
    t.toLowerCase().includes(newVal.value.toLowerCase())
  )
})

function toggle(tag: string) {
  const next = props.selected.includes(tag)
    ? props.selected.filter((t) => t !== tag)
    : [...props.selected, tag]
  emit('update:selected', next)
}

function submit() {
  const v = newVal.value.trim()
  if (v) {
    if (!allOptions.value.includes(v)) {
      localAdded.value.push(v)
      emit('add', v)
    }
    // 添加后自动选中（如果还没选中的话）
    if (!props.selected.includes(v)) {
      emit('update:selected', [...props.selected, v])
    }
  }
  newVal.value = ''
}

function remove(tag: string) {
  emit('delete', tag)
  emit('update:selected', props.selected.filter((t) => t !== tag))
}
</script>

<template>
  <div class="space-y-2">
    <!-- 已选标签 -->
    <div v-if="selected.length > 0" class="flex flex-wrap gap-1.5">
      <div v-for="tag in selected" :key="tag" class="flex items-center">
        <button
          class="text-[10px] px-2.5 py-1 rounded-l-full font-semibold"
          :class="isDark ? 'bg-white text-gray-800' : 'bg-indigo-500 text-white'"
          @click="toggle(tag)"
        >
          <Check :size="8" class="inline mr-0.5" :stroke-width="3" />
          {{ tag }}
        </button>
        <button
          class="text-[10px] px-1.5 py-1 rounded-r-full"
          :class="isDark ? 'bg-white/80 text-gray-600 hover:bg-white' : 'bg-indigo-400 text-white hover:bg-indigo-500'"
          @click="remove(tag)"
        >
          <X :size="8" />
        </button>
      </div>
    </div>

    <!-- 可选标签（过滤后） -->
    <div v-if="filteredOptions.length > 0" class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
      <div v-for="tag in filteredOptions" :key="tag" class="flex items-center">
        <button
          class="text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all"
          :class="isDark
            ? 'bg-white/12 text-white/65 hover:bg-white/20 hover:text-white/90'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="toggle(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- 添加标签 -->
    <div
      class="flex items-center gap-1 rounded-xl overflow-hidden"
      :style="{ background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)' }"
    >
      <input
        v-model="newVal"
        placeholder="输入新标签，回车添加…"
        class="flex-1 bg-transparent text-xs outline-none py-1.5 px-3"
        :class="isDark ? 'text-white placeholder-white/30' : 'text-gray-800 placeholder-gray-400'"
        @keydown.enter="submit"
      />
      <button
        class="px-2.5 transition-colors"
        :class="isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-800'"
        @click="submit"
      >
        <Plus :size="12" />
      </button>
    </div>
  </div>
</template>
