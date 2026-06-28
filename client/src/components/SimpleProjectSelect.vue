<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, Check } from '@lucide/vue'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'radix-vue'
import { Motion } from 'motion-v'

const props = defineProps<{
  modelValue: string
  options: string[]
  isDark: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const open = ref(false)

function select(v: string) {
  emit('update:modelValue', v)
  open.value = false
}

const tp = () => props.isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)'
const tm = () => props.isDark ? 'rgba(255,255,255,0.40)' : 'rgba(15,10,40,0.42)'
const fieldBg = () => props.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'
const dropBg = () => props.isDark ? 'rgba(12,6,26,0.62)' : 'rgba(252,250,255,0.74)'

function handleHover(e: MouseEvent, enter: boolean, sel: boolean) {
  const el = e.currentTarget as HTMLElement
  if (sel) return
  el.style.background = enter
    ? (props.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.03)')
    : 'transparent'
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <button
        class="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer"
        :style="{
          background: fieldBg(),
          color: modelValue ? tp() : tm(),
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        }"
      >
        <span>{{ modelValue || '无项目' }}</span>
        <ChevronDown
          :size="11"
          :style="{
            color: tm(),
            transform: open ? 'rotate(180deg)' : '',
            transition: 'transform 0.15s',
          }"
        />
      </button>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        :side-offset="4"
        align="start"
        side="bottom"
        :style="{ zIndex: 9999, outline: 'none', width: 'var(--radix-popover-trigger-width)' }"
      >
        <Motion
          :initial="{ opacity: 0, scale: 0.96, y: -6 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :exit="{ opacity: 0, scale: 0.96, y: -6 }"
          :transition="{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }"
          :style="{
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            background: dropBg(),
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
            boxShadow: `0 20px 50px ${isDark ? 'rgba(0,0,0,0.60)' : 'rgba(80,60,180,0.18)'}`,
            borderRadius: 16,
            overflow: 'hidden',
          }"
        >
          <button
            v-for="(opt, i) in ['无项目', ...options]"
            :key="opt"
            class="w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between cursor-pointer"
            :style="{
              color: (i === 0 ? '' : opt) === modelValue ? (isDark ? '#A5B4FC' : '#6366F1') : tp(),
              background: (i === 0 ? '' : opt) === modelValue ? (isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.07)') : 'transparent',
            }"
            @click="select(i === 0 ? '' : opt)"
            @mouseenter="handleHover($event, true, (i === 0 ? '' : opt) === modelValue)"
            @mouseleave="handleHover($event, false, (i === 0 ? '' : opt) === modelValue)"
          >
            {{ opt }}
            <Check v-if="(i === 0 ? '' : opt) === modelValue" :size="10" :stroke-width="3" :style="{ color: isDark ? '#A5B4FC' : '#6366F1' }" />
          </button>
        </Motion>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
