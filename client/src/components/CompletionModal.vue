<script setup lang="ts">
import { computed } from 'vue'
import { X, Zap, Check } from '@lucide/vue'
import AchievementBadge from './AchievementBadge.vue'

const props = defineProps<{
  description: string
  todayCount: number
  totalDone: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 粒子颜色池
const PARTICLE_COLORS = ['#FFD700', '#FF9F1C', '#FF6B35', '#FFBF69', '#FFF59D', '#FF8A65', '#FFCC02', '#F9A825']

// 生成 24 个粒子
const particles = computed(() => {
  return Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
    const dist = 55 + Math.random() * 85
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      size: 4 + Math.random() * 8,
    }
  })
})

// 生成 14 个浮动星星
const stars = computed(() => {
  return Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 380,
    size: 9 + Math.random() * 14,
    delay: Math.random() * 0.8,
  }))
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-6">
    <!-- 遮罩 -->
    <div
      class="absolute inset-0 glass-overlay"
      @click="emit('close')"
    />

    <!-- 弹窗卡片 -->
    <div
      class="relative z-10 w-80 rounded-3xl overflow-hidden completion-gradient fade-in-up"
    >
      <!-- 关闭按钮 -->
      <button
        class="absolute top-4 right-4 z-20 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        :style="{ background: 'rgba(0,0,0,0.18)' }"
        @click="emit('close')"
      >
        <X :size="13" class="text-white/80" />
      </button>

      <!-- 粒子爆炸 -->
      <div class="absolute left-1/2 top-[34%] pointer-events-none z-0">
        <div
          v-for="p in particles"
          :key="p.id"
          class="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
          :style="{
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `particleBurst 0.85s 0.18s ease-out forwards`,
            '--px': `${p.x}px`,
            '--py': `${p.y}px`,
          }"
        />
      </div>

      <!-- 浮动星星 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <span
          v-for="s in stars"
          :key="s.id"
          class="absolute select-none"
          :style="{
            left: `calc(50% + ${s.x}px)`,
            top: `calc(50% + ${s.y}px)`,
            fontSize: `${s.size}px`,
            color: 'rgba(255,255,200,0.88)',
            animation: `starFloat 1.5s ${0.22 + s.delay}s ease-in-out infinite 2.0s`,
          }"
        >✦</span>
      </div>

      <div class="relative z-10 px-6 pt-8 pb-6 text-center">
        <!-- 成就徽章 -->
        <AchievementBadge />

        <div class="fade-in-up" style="animation-delay: 0.32s">
          <h2
            class="text-[26px] font-black text-white mt-5 mb-1"
            :style="{ textShadow: '0 2px 10px rgba(0,0,0,0.18)' }"
          >太棒了！</h2>
          <p class="text-white/60 text-sm mb-5 font-medium">任务已完成</p>

          <!-- 任务卡片 -->
          <div
            class="rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 text-left"
            :style="{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.28)',
            }"
          >
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              :style="{ background: 'rgba(255,255,255,0.32)' }"
            >
              <Check :size="13" :stroke-width="3" class="text-white" />
            </div>
            <p class="text-white text-[13px] font-semibold leading-snug">{{ description }}</p>
          </div>

          <!-- 统计 -->
          <div class="flex gap-3 mb-5">
            <div
              class="flex-1 rounded-2xl py-3.5 text-center"
              :style="{ background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)' }"
            >
              <div class="text-[28px] font-black text-white tabular-nums leading-none">
                {{ todayCount }}
              </div>
              <div class="text-white/55 text-[10px] font-semibold mt-1">今日完成</div>
            </div>
            <div
              class="flex-1 rounded-2xl py-3.5 text-center"
              :style="{ background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)' }"
            >
              <div class="text-[28px] font-black text-white tabular-nums leading-none">
                {{ totalDone }}
              </div>
              <div class="text-white/55 text-[10px] font-semibold mt-1">累计完成</div>
            </div>
          </div>

          <!-- 按钮 -->
          <button
            class="w-full py-4 rounded-2xl text-sm font-black transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            :style="{
              background: 'rgba(255,255,255,0.95)',
              color: '#E8540A',
              boxShadow: '0 4px 22px rgba(0,0,0,0.14)',
            }"
            @click="emit('close')"
          >
            <Zap :size="15" fill="#E8540A" :stroke-width="0" />
            继续加油
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes particleBurst {
  0% { transform: translate(-50%, -50%) translate(0, 0) scale(0); opacity: 1; }
  100% { transform: translate(-50%, -50%) translate(var(--px), var(--py)) scale(1); opacity: 0; }
}

@keyframes starFloat {
  0% { opacity: 0; transform: scale(0); }
  30% { opacity: 0.95; transform: scale(1.2); }
  60% { opacity: 0.55; transform: scale(0.9); }
  100% { opacity: 0; transform: scale(0); }
}
</style>
