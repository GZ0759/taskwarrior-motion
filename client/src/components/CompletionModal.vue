<script setup lang="ts">
import { computed } from 'vue'
import { X, Check } from '@lucide/vue'
import { Motion, AnimatePresence } from 'motion-v'
import AchievementBadge from './AchievementBadge.vue'

const props = defineProps<{
  description: string
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const PC = ['#FFD700', '#FF9F1C', '#FF6B35', '#FFBF69', '#FFF59D', '#FF8A65', '#FFCC02', '#F9A825']

const particles = computed(() =>
  Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
    const d = 55 + Math.random() * 85
    return { id: i, x: Math.cos(a) * d, y: Math.sin(a) * d, color: PC[i % PC.length], size: 4 + Math.random() * 8 }
  })
)

const stars = computed(() =>
  Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 380,
    size: 9 + Math.random() * 14,
    delay: Math.random() * 0.8,
  }))
)

const cardBg = computed(() =>
  props.isDark
    ? {
        background: 'rgba(12,6,26,0.72)',
        backdropFilter: 'blur(60px) saturate(240%)',
        WebkitBackdropFilter: 'blur(60px) saturate(240%)',
        boxShadow: '0 1.5px 0 rgba(255,255,255,0.12) inset,0 40px 80px rgba(0,0,0,0.70),0 0 80px rgba(99,102,241,0.18)',
      }
    : {
        background: 'rgba(250,248,255,0.80)',
        backdropFilter: 'blur(60px) saturate(200%)',
        WebkitBackdropFilter: 'blur(60px) saturate(200%)',
        boxShadow: '0 1.5px 0 rgba(255,255,255,0.88) inset,0 32px 80px rgba(80,60,180,0.16),0 0 60px rgba(99,102,241,0.10)',
      }
)

const borderGrad = 'linear-gradient(135deg,#4ADE80,#22C55E,#06B6D4,#6366F1,#8B5CF6,#4ADE80)'

const tp = () => props.isDark ? 'rgba(255,255,255,0.92)' : 'rgba(15,10,40,0.88)'
const td = () => props.isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,10,40,0.82)'
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-6">
    <div class="absolute inset-0 glass-overlay" @click="emit('close')" />

    <Motion
      :initial="{ scale: 0.48, opacity: 0, y: 60 }"
      :animate="{ scale: 1, opacity: 1, y: 0 }"
      :exit="{ scale: 0.82, opacity: 0, y: 20 }"
      :transition="{ type: 'spring', stiffness: 265, damping: 22 }"
      class="relative z-10 w-80 rounded-3xl grad-flow p-[1px]"
      :style="{ background: borderGrad, backgroundSize: '200% 100%' }"
    >
      <div class="rounded-3xl overflow-hidden relative" :style="cardBg">
        <button
          class="absolute top-4 right-4 z-20 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
          :style="{ background: 'rgba(0,0,0,0.18)' }"
          @click="emit('close')"
        >
          <X :size="13" class="text-white/80" />
        </button>

        <div class="absolute left-1/2 top-[34%] pointer-events-none z-0">
          <Motion
            v-for="p in particles"
            :key="p.id"
            :initial="{ x: 0, y: 0, opacity: 1, scale: 0 }"
            :animate="{ x: p.x, y: p.y, opacity: 0, scale: 1 }"
            :transition="{ duration: 0.85, delay: 0.18, ease: 'easeOut' }"
            class="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
            :style="{ width: `${p.size}px`, height: `${p.size}px`, backgroundColor: p.color }"
          />
        </div>

        <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <Motion
            v-for="s in stars"
            :key="s.id"
            :initial="{ opacity: 0, scale: 0 }"
            :animate="{ opacity: [0, 0.95, 0.55, 0], scale: [0, 1.2, 0.9, 0] }"
            :transition="{ duration: 1.5, delay: 0.22 + s.delay, repeat: Infinity, repeatDelay: 2.0 }"
            class="absolute select-none"
            :style="{
              left: `calc(50% + ${s.x}px)`,
              top: `calc(50% + ${s.y}px)`,
              fontSize: `${s.size}px`,
              color: 'rgba(255,255,200,0.88)',
            }"
          >✦</Motion>
        </div>

        <div class="relative z-10 px-6 pt-8 pb-6 text-center">
          <AchievementBadge />

          <Motion
            :initial="{ opacity: 0, y: 14 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.32 }"
          >
            <h2
              class="text-[26px] font-black my-6"
              :style="{
                color: tp(),
                textShadow: isDark ? '0 2px 10px rgba(0,0,0,0.18)' : 'none',
              }"
            >我完成任务啦！</h2>

            <div
              class="rounded-2xl px-4 py-3 mb-5 flex items-center gap-3 text-left"
              :style="{
                background: isDark ? 'rgba(74,222,128,0.12)' : 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(74,222,128,0.25)',
              }"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                :style="{ background: 'linear-gradient(135deg,#4ADE80,#22C55E)' }"
              >
                <Check :size="13" :stroke-width="3" class="text-white" />
              </div>
              <p class="text-[13px] font-semibold leading-snug" :style="{ color: td() }">{{ description }}</p>
            </div>

            <button
              class="w-full py-4 rounded-2xl text-sm font-black transition-opacity hover:opacity-90 cursor-pointer"
              :style="{
                background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                color: '#fff',
                boxShadow: '0 4px 22px rgba(124,58,237,0.45)',
              }"
              @click="emit('close')"
            >
              我太棒了
            </button>
          </Motion>
        </div>
      </div>
    </Motion>
  </div>
</template>
