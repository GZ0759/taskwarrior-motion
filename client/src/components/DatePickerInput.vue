<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from '@lucide/vue'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'radix-vue'
import { Motion } from 'motion-v'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
}>(), {
  placeholder: '选择日期',
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const open = ref(false)

const fmt = (d: Date) => d.toISOString().split('T')[0]

const initDate = props.modelValue ? new Date(props.modelValue + 'T00:00:00') : new Date()
const vy = ref(initDate.getFullYear())
const vm = ref(initDate.getMonth())

watch(() => props.modelValue, (nv) => {
  if (nv) {
    const d = new Date(nv + 'T00:00:00')
    vy.value = d.getFullYear()
    vm.value = d.getMonth()
  }
})

const todayStr = computed(() => fmt(new Date()))

const firstDay = computed(() => new Date(vy.value, vm.value, 1).getDay())
const dim = computed(() => new Date(vy.value, vm.value + 1, 0).getDate())

const cells = computed(() => {
  const arr: { day: number | null; date: string }[] = []
  for (let i = 0; i < firstDay.value; i++) arr.push({ day: null, date: '' })
  for (let d = 1; d <= dim.value; d++) {
    const ds = `${vy.value}-${String(vm.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    arr.push({ day: d, date: ds })
  }
  return arr
})

const displayVal = computed(() => {
  if (!props.modelValue) return ''
  return new Date(props.modelValue + 'T00:00:00').toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
})

function prevM() {
  if (vm.value === 0) { vy.value--; vm.value = 11 }
  else vm.value--
}
function nextM() {
  if (vm.value === 11) { vy.value++; vm.value = 0 }
  else vm.value++
}
function select(date: string) {
  emit('update:modelValue', date)
  open.value = false
}
function clear(e: MouseEvent) {
  e.stopPropagation()
  emit('update:modelValue', '')
}
function selectToday() {
  emit('update:modelValue', todayStr.value)
  open.value = false
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
        <span class="flex items-center gap-2">
          <CalendarDays :size="12" :style="{ color: 'var(--txt-muted)', flexShrink: 0 }" />
          {{ displayVal || placeholder }}
        </span>
        <span class="flex items-center gap-1">
          <span v-if="modelValue" class="hover:opacity-70 transition-opacity cursor-pointer" :style="{ color: 'var(--txt-muted)' }" @click="clear">
            <X :size="11" />
          </span>
          <ChevronDown
            :size="11"
            :style="{
              color: 'var(--txt-muted)',
              transform: open ? 'rotate(180deg)' : '',
              transition: 'transform 0.15s',
            }"
          />
        </span>
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
            background: 'var(--glass-modal-bg)',
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            border: '1px solid var(--glass-modal-border)',
            boxShadow: 'var(--shadow-dropdown)',
            borderRadius: 16,
            padding: 12,
          }"
        >
          <div class="flex items-center justify-between mb-3">
            <button class="w-7 h-7 rounded-xl flex items-center justify-center transition-colors cursor-pointer nav-btn" :style="{ color: 'var(--txt-muted)' }" @click="prevM">
              <ChevronLeft :size="13" />
            </button>
            <span class="text-xs font-bold" :style="{ color: 'var(--txt-primary)' }">
              {{ new Date(vy, vm).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }) }}
            </span>
            <button class="w-7 h-7 rounded-xl flex items-center justify-center transition-colors cursor-pointer nav-btn" :style="{ color: 'var(--txt-muted)' }" @click="nextM">
              <ChevronRight :size="13" />
            </button>
          </div>
          <div class="grid grid-cols-7 mb-1">
            <div v-for="d in ['日','一','二','三','四','五','六']" :key="d" class="text-center text-[9px] font-bold py-1" :style="{ color: 'var(--txt-subtle)' }">{{ d }}</div>
          </div>
          <div class="grid grid-cols-7 gap-px">
            <button
              v-for="(c, i) in cells"
              :key="i"
              :disabled="!c.day"
              class="aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all"
              :style="{
                background: c.date === modelValue ? 'var(--accent-indigo)' : c.date === todayStr ? 'var(--today-highlight)' : 'transparent',
                color: c.date === modelValue ? 'var(--txt-on-color)' : c.date === todayStr ? 'var(--txt-accent)' : !c.day ? 'transparent' : c.date < todayStr && c.date !== '' ? 'var(--txt-subtle)' : 'var(--txt-primary)',
                cursor: c.day ? 'pointer' : 'default',
                fontWeight: c.date === modelValue || c.date === todayStr ? 700 : 500,
              }"
              @click="c.day && select(c.date)"
            >
              {{ c.day }}
            </button>
          </div>
          <button
            v-if="modelValue !== todayStr"
            class="w-full mt-2 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
            :style="{
              background: 'var(--accent-indigo-bg)',
              color: 'var(--txt-accent)',
            }"
            @click="selectToday"
          >
            选择今天
          </button>
        </Motion>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped>
.nav-btn:hover {
  background: var(--ctrl-btn);
}
</style>
