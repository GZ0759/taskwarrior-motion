<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check, Plus, X } from '@lucide/vue'

const props = defineProps<{
  value: string
  options: string[]
}>()

const emit = defineEmits<{
  (e: 'update:value', v: string): void
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

function submit() {
  const v = newVal.value.trim()
  if (v) {
    if (!allOptions.value.includes(v)) {
      localAdded.value.push(v)
      emit('add', v)
    }
    // 添加后自动选中
    emit('update:value', v)
  }
  newVal.value = ''
}

function select(opt: string) {
  emit('update:value', opt)
}

function remove(opt: string) {
  emit('delete', opt)
}
</script>

<template>
  <div class="rounded-xl overflow-hidden glass-picker">
    <div class="p-1.5 space-y-0.5 max-h-36 overflow-y-auto">
      <!-- 无项目 -->
      <button
        class="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        :class="!value
          ? 'bg-white text-gray-800'
          : 'text-white/55 hover:bg-white/10 hover:text-white/80'"
        @click="select('')"
      >无项目</button>

      <!-- 项目列表 -->
      <div v-for="opt in allOptions" :key="opt" class="flex items-center gap-1">
        <button
          class="flex-1 text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          :class="value === opt
            ? 'bg-white text-gray-800'
            : 'text-white/70 hover:bg-white/10 hover:text-white/90'"
          @click="select(opt)"
        >
          <Check v-if="value === opt" :size="9" :stroke-width="3" />
          {{ opt }}
        </button>
        <button
          class="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-white/8 transition-colors shrink-0"
          @click="remove(opt)"
        >
          <X :size="10" />
        </button>
      </div>
    </div>

    <!-- 添加项目 -->
    <div class="flex items-center gap-1 px-2 pb-2 pt-1 border-t border-white/10">
      <input
        v-model="newVal"
        placeholder="添加项目…"
        class="flex-1 bg-transparent text-xs text-white placeholder-white/30 outline-none py-1 px-1"
        @keydown.enter="submit"
      />
      <button
        class="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors"
        @click="submit"
      >
        <Plus :size="12" />
      </button>
    </div>
  </div>
</template>
