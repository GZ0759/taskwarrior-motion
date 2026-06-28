<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from '@lucide/vue'
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'radix-vue'
import { Motion } from 'motion-v'

const props = withDefaults(defineProps<{
  modelValue: string
  isDark: boolean
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

const tp = () => props.isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)'
const tm = () => props.isDark ? 'rgba(255,255,255,0.40)' : 'rgba(15,10,40,0.42)'
const ts = () => props.isDark ? 'rgba(255,255,255,0.24)' : 'rgba(15,10,40,0.22)'
const fieldBg = () => props.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'
const panelBg = () => props.isDark ? 'rgba(12,6,26,0.62)' : 'rgba(252,250,255,0.74)'
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
        <span class="flex items-center gap-2">
          <CalendarDays :size="12" :style="{ color: tm(), flexShrink: 0 }" />
          {{ displayVal || placeholder }}
        </span>
        <span class="flex items-center gap-1">
          <span v-if="modelValue" class="hover:opacity-70 transition-opacity cursor-pointer" :style="{ color: tm() }" @click="clear">
            <X :size="11" />
          </span>
          <ChevronDown
            :size="11"
            :style="{
              color: tm(),
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
            background: panelBg(),
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)'}`,
            boxShadow: `0 24px 60px ${isDark ? 'rgba(0,0,0,0.65)' : 'rgba(80,60,180,0.14)'}`,
            borderRadius: 16,
            padding: 12,
          }"
        >
          <div class="flex items-center justify-between mb-3">
            <button class="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer" :style="{ color: tm() }" @click="prevM">
              <ChevronLeft :size="13" />
            </button>
            <span class="text-xs font-bold" :style="{ color: tp() }">
              {{ new Date(vy, vm).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }) }}
            </span>
            <button class="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer" :style="{ color: tm() }" @click="nextM">
              <ChevronRight :size="13" />
            </button>
          </div>
          <div class="grid grid-cols-7 mb-1">
            <div v-for="d in ['日','一','二','三','四','五','六']" :key="d" class="text-center text-[9px] font-bold py-1" :style="{ color: ts() }">{{ d }}</div>
          </div>
          <div class="grid grid-cols-7 gap-px">
            <button
              v-for="(c, i) in cells"
              :key="i"
              :disabled="!c.day"
              class="aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all"
              :style="{
                background: c.date === modelValue ? '#6366F1' : c.date === todayStr ? (isDark ? 'rgba(99,102,241,0.22)' : 'rgba(99,102,241,0.12)') : 'transparent',
                color: c.date === modelValue ? '#fff' : c.date === todayStr ? '#818CF8' : !c.day ? 'transparent' : c.date < todayStr && c.date !== '' ? ts() : tp(),
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
              background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
              color: '#818CF8',
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
