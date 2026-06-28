<script setup lang="ts">
import { Motion } from 'motion-v'

const props = defineProps<{
  on: boolean
}>()

const emit = defineEmits<{
  (e: 'update:on', value: boolean): void
}>()

function toggle() {
  emit('update:on', !props.on)
}
</script>

<template>
  <button
    class="w-10 h-6 rounded-full relative flex-shrink-0 focus:outline-none cursor-pointer"
    :style="{
      background: on ? 'var(--accent-indigo)' : 'var(--toggle-off-bg)',
      transition: 'background 0.2s',
    }"
    @click="toggle"
  >
    <Motion
      class="absolute top-0.5 w-5 h-5 rounded-full shadow-md"
      :animate="{ x: on ? 18 : 2 }"
      :transition="{ type: 'spring', stiffness: 500, damping: 30 }"
      :style="{ background: 'var(--toggle-knob-bg)' }"
    />
  </button>
</template>
