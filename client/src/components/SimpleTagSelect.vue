<script setup lang="ts">
import { Check } from '@lucide/vue'

const props = defineProps<{
  selected: string[]
  options: string[]
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
        background: selected.includes(tag) ? 'var(--accent-indigo)' : 'var(--glass-input-bg)',
        color: selected.includes(tag) ? 'var(--txt-on-color)' : 'var(--txt-muted)',
        border: `1px solid ${selected.includes(tag) ? 'var(--accent-indigo-border)' : 'var(--glass-input-border)'}`,
      }"
      @click="toggle(tag)"
    >
      <Check v-if="selected.includes(tag)" :size="7" class="inline mr-0.5" :stroke-width="3" />
      {{ tag }}
    </button>
  </div>
</template>
