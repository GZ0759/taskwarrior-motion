<script setup lang="ts">
import { Check } from '@lucide/vue'
import { Motion } from 'motion-v'
</script>

<template>
  <div class="w-24 h-24 mx-auto relative">
    <Motion
      :initial="{ scale: 0, rotate: -30 }"
      :animate="{ scale: 1, rotate: 0 }"
      :transition="{ delay: 0.12, type: 'spring', stiffness: 255, damping: 17 }"
      class="w-full h-full rounded-full flex items-center justify-center"
      :style="{
        background: 'linear-gradient(135deg,#4ADE80,#22C55E)',
        boxShadow: '0 8px 32px rgba(34,197,94,0.35)',
      }"
    >
      <Check :size="36" :stroke-width="3.5" class="text-white" />
    </Motion>
    <Motion
      :animate="{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }"
      :transition="{ duration: 2, repeat: Infinity, ease: 'easeInOut' }"
      class="absolute inset-0 rounded-full pointer-events-none"
      :style="{ boxShadow: '0 0 0 3px rgba(74,222,128,0.5)' }"
    />
  </div>
</template>
