<script setup lang="ts">
import { Check } from '@lucide/vue'

const props = defineProps<{
  selected: string[]
  options: string[]
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'update:selected', v: string[]): void
}>()

function toggle(tag: string) {
  const next = props.selected.includes(tag)
    ? props.selected.filter(t => t !== tag)
    : [...props.selected, tag]
  emit('update:selected', next)
}
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      v-for="tag in options"
      :key="tag"
      class="text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer"
      :style="{
        background: selected.includes(tag) ? (isDark ? '#5B52C8' : '#6366F1') : (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.05)'),
        color: selected.includes(tag) ? '#ffffff' : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,10,40,0.48)'),
        border: `1px solid ${selected.includes(tag) ? (isDark ? 'rgba(165,148,255,0.35)' : 'rgba(99,102,241,0.25)') : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)')}`,
      }"
      @click="toggle(tag)"
    >
      <Check v-if="selected.includes(tag)" :size="7" class="inline mr-0.5" :stroke-width="3" />
      {{ tag }}
    </button>
  </div>
</template>
