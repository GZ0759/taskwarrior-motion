<script setup lang="ts">
import { Trophy } from '@lucide/vue'
</script>

<template>
  <div class="w-32 h-32 mx-auto relative">
    <!-- SVG sunburst 射线 -->
    <svg class="absolute inset-0 w-full h-full" viewBox="0 0 128 128" overflow="visible">
      <line
        v-for="i in 16"
        :key="i"
        :x1="64 + Math.cos((i - 1) * (Math.PI * 2 / 16)) * 34"
        :y1="64 + Math.sin((i - 1) * (Math.PI * 2 / 16)) * 34"
        :x2="64 + Math.cos((i - 1) * (Math.PI * 2 / 16)) * 50"
        :y2="64 + Math.sin((i - 1) * (Math.PI * 2 / 16)) * 50"
        stroke="rgba(255,255,255,0.38)"
        stroke-width="2.5"
        stroke-linecap="round"
        class="fade-in-up"
        :style="{ animationDelay: `${0.06 + (i - 1) * 0.025}s` }"
      />
    </svg>

    <!-- 中心徽章 -->
    <div
      class="absolute inset-[16px] rounded-full flex flex-col items-center justify-center gap-0.5 badge-center fade-in-up"
      :style="{ animationDelay: '0.12s' }"
    >
      <Trophy
        :size="28"
        :stroke-width="1.8"
        class="text-white"
        :style="{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.20))' }"
      />
      <span class="text-[8px] font-black text-white/80 tracking-[0.16em] mt-0.5">DONE</span>
    </div>

    <!-- 脉冲光环 -->
    <div
      class="absolute inset-0 rounded-full pointer-events-none pulse-ring"
      :style="{ boxShadow: '0 0 0 3px rgba(255,255,255,0.38)' }"
    />
  </div>
</template>
