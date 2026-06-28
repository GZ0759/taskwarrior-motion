<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, Check } from '@lucide/vue'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'radix-vue'
import { Motion } from 'motion-v'

const props = defineProps<{
  modelValue: string
  options: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const open = ref(false)

function select(v: string) {
  emit('update:modelValue', v)
  open.value = false
}

function handleHover(e: MouseEvent, enter: boolean, sel: boolean) {
  const el = e.currentTarget as HTMLElement
  if (sel) return
  el.style.background = enter ? 'var(--glass-panel-hover-bg)' : 'transparent'
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <button
        class="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer"
        :style="{
          background: 'var(--glass-input-bg)',
          color: modelValue ? 'var(--txt-primary)' : 'var(--txt-muted)',
          border: '1px solid var(--glass-input-border)',
        }"
      >
        <span>{{ modelValue || '无项目' }}</span>
        <ChevronDown
          :size="11"
          :style="{
            color: 'var(--txt-muted)',
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
            background: 'var(--glass-modal-bg)',
            border: '1px solid var(--glass-modal-border)',
            boxShadow: 'var(--shadow-dropdown)',
            borderRadius: 16,
            overflow: 'hidden',
          }"
        >
          <button
            v-for="(opt, i) in ['无项目', ...options]"
            :key="opt"
            class="w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between cursor-pointer"
            :style="{
              color: (i === 0 ? '' : opt) === modelValue ? 'var(--accent-indigo-light)' : 'var(--txt-primary)',
              background: (i === 0 ? '' : opt) === modelValue ? 'var(--accent-indigo-bg)' : 'transparent',
            }"
            @click="select(i === 0 ? '' : opt)"
            @mouseenter="handleHover($event, true, (i === 0 ? '' : opt) === modelValue)"
            @mouseleave="handleHover($event, false, (i === 0 ? '' : opt) === modelValue)"
          >
            {{ opt }}
            <Check v-if="(i === 0 ? '' : opt) === modelValue" :size="10" :stroke-width="3" :style="{ color: 'var(--accent-indigo-light)' }" />
          </button>
        </Motion>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
