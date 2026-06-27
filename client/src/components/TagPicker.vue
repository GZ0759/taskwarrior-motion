<script setup lang="ts">
import { ref } from 'vue'
import { Check, Plus, X } from '@lucide/vue'

const props = defineProps<{
  selected: string[]
  options: string[]
}>()

const emit = defineEmits<{
  (e: 'update:selected', v: string[]): void
  (e: 'add', v: string): void
  (e: 'delete', v: string): void
}>()

const newVal = ref('')

function toggle(tag: string) {
  const next = props.selected.includes(tag)
    ? props.selected.filter((t) => t !== tag)
    : [...props.selected, tag]
  emit('update:selected', next)
}

function submit() {
  const v = newVal.value.trim()
  if (v) {
    if (!props.options.includes(v)) {
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
    <!-- 标签列表 -->
    <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
      <div v-for="tag in options" :key="tag" class="flex items-center">
        <button
          class="text-[10px] px-2.5 py-1 rounded-l-full font-semibold transition-all"
          :class="selected.includes(tag)
            ? 'bg-white text-gray-800'
            : 'bg-white/12 text-white/65 hover:bg-white/20 hover:text-white/90'"
          @click="toggle(tag)"
        >
          <Check v-if="selected.includes(tag)" :size="8" class="inline mr-0.5" :stroke-width="3" />
          {{ tag }}
        </button>
        <button
          class="text-[10px] px-1.5 py-1 rounded-r-full transition-all"
          :class="selected.includes(tag)
            ? 'bg-white/80 text-gray-600 hover:bg-white'
            : 'bg-white/8 text-white/30 hover:bg-white/18 hover:text-red-400'"
          @click="remove(tag)"
        >
          <X :size="8" />
        </button>
      </div>
    </div>

    <!-- 添加标签 -->
    <div class="flex items-center gap-1 rounded-xl overflow-hidden glass-tag-input">
      <input
        v-model="newVal"
        placeholder="输入新标签，回车添加…"
        class="flex-1 bg-transparent text-xs text-white placeholder-white/30 outline-none py-1.5 px-3"
        @keydown.enter="submit"
      />
      <button
        class="px-2.5 text-white/40 hover:text-white transition-colors"
        @click="submit"
      >
        <Plus :size="12" />
      </button>
    </div>
  </div>
</template>
