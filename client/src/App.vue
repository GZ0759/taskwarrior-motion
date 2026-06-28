<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Sparkles, Volume2, VolumeX, Sun, Moon, Monitor, Keyboard, Settings, ListTodo, LayoutGrid, CalendarDays } from '@lucide/vue'
import { useTaskStore } from '@/stores/task'
import { useTheme } from '@/composables/useTheme'
import { useKeyboard } from '@/composables/useKeyboard'
import { useSound } from '@/composables/useSound'
import { useTimeTracking } from '@/composables/useTimeTracking'
import { Motion, AnimatePresence } from 'motion-v'
import Heatmap from '@/components/Heatmap.vue'
import ProjectProgress from '@/components/ProjectProgress.vue'
import TaskCard from '@/components/TaskCard.vue'
import AddTaskBtn from '@/components/AddTaskBtn.vue'
import AddTaskModal from '@/components/AddTaskModal.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import CompletedSection from '@/components/CompletedSection.vue'
import CompletionModal from '@/components/CompletionModal.vue'
import TaskEditModal from '@/components/TaskEditModal.vue'
import HelpModal from '@/components/HelpModal.vue'
import ProjectManageModal from '@/components/ProjectManageModal.vue'
import TagList from '@/components/TagList.vue'
import TagManageModal from '@/components/TagManageModal.vue'
import DayCompletedModal from '@/components/DayCompletedModal.vue'
import KanbanView from '@/views/KanbanView.vue'
import CalendarView from '@/views/CalendarView.vue'
import type { Task, UpdateTaskRequest } from '@/types/task'
import { getTodayStr, taskDateToISO, parseTaskDate } from '@/utils/date'

const store = useTaskStore()
const { theme, isDark, toggleTheme } = useTheme()
const { soundEnabled, toggleSound } = useSound()

const doneInfo = ref<{ description: string } | null>(null)

type ViewType = 'tasks' | 'kanban' | 'calendar'
const currentView = ref<ViewType>('tasks')
const leftTab = ref<'projects' | 'tags'>('projects')

const allProjects = computed(() => {
  if (store.stats?.projects) {
    return Object.keys(store.stats.projects)
  }
  const set = new Set<string>()
  store.tasks.forEach((t) => {
    if (t.project) set.add(t.project)
  })
  return Array.from(set)
})

const allTags = computed(() => {
  const set = new Set<string>()
  store.tasks.forEach((t) => {
    t.tags?.forEach((tag) => set.add(tag))
  })
  return Array.from(set)
})

const todayCount = computed(() => store.stats?.todayCount ?? 0)
const totalDone = computed(() => store.stats?.totalDone ?? 0)
const activeCount = computed(() => store.stats?.pendingCount ?? store.pendingTasks.length)

const kanbanStats = computed(() => {
  const pending = store.pendingTasks.filter(t => !t.start).length
  const inProgress = store.pendingTasks.filter(t => t.start).length
  return { pending, inProgress }
})

const todayTaskCount = computed(() => {
  const today = getTodayStr()
  return store.calendarTasks.filter(t => t.due && taskDateToISO(t.due) === today).length
})

const rtTitles: Record<ViewType, string> = { tasks: '事项', kanban: '看板', calendar: '日历' }
const title = computed(() => rtTitles[currentView.value])

const subtitle = computed(() => {
  switch (currentView.value) {
    case 'tasks':
      return `${activeCount.value} 项待完成`
    case 'kanban':
      return `${kanbanStats.value.pending} 个待办 · ${kanbanStats.value.inProgress} 个进行中`
    case 'calendar':
      return `今天 ${todayTaskCount.value} 个任务`
    default:
      return ''
  }
})

const themeIcon = computed(() => {
  if (theme.value === 'light') return Sun
  if (theme.value === 'dark') return Moon
  return Monitor
})

const editingTask = ref<Task | null>(null)
const showHelp = ref(false)
const showAddTask = ref(false)
const showSettings = ref(false)
const settingsPos = ref({ top: 0, left: 0 })
const settingsBtnRef = ref<HTMLButtonElement | null>(null)
const managingProject = ref<string | null>(null)
const managingTag = ref<string | null>(null)
const dayModalDate = ref<string | null>(null)
const dayModalTasks = ref<Task[]>([])
const achievementEnabled = ref((() => { try { return localStorage.getItem('twm-achievement') !== 'false' } catch { return true } })())

const selectedIndex = ref(-1)

useKeyboard({
  onNewTask: () => {
    showAddTask.value = true
  },
  onNextTask: () => {
    if (selectedIndex.value < store.pendingTasks.length - 1) {
      selectedIndex.value++
    }
  },
  onPrevTask: () => {
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    }
  },
  onCompleteTask: () => {
    if (selectedIndex.value >= 0 && selectedIndex.value < store.pendingTasks.length) {
      const task = store.pendingTasks[selectedIndex.value]
      handleCompleteTask(task.uuid, task.description)
      if (selectedIndex.value >= store.pendingTasks.length - 1) {
        selectedIndex.value = Math.max(0, store.pendingTasks.length - 2)
      }
    }
  },
  onEditTask: () => {
    if (selectedIndex.value >= 0 && selectedIndex.value < store.pendingTasks.length) {
      editingTask.value = store.pendingTasks[selectedIndex.value]
    }
  },
  onCloseModal: () => {
    doneInfo.value = null
    editingTask.value = null
    showHelp.value = false
    showAddTask.value = false
    showSettings.value = false
    managingProject.value = null
    managingTag.value = null
  },
  onShowHelp: () => {
    showHelp.value = !showHelp.value
  },
  onUndo: () => {
    store.undo()
  },
})

onMounted(() => {
  store.fetchTasks()
  store.fetchPendingTasks()
  store.fetchStats()
})

watch(currentView, (view) => {
  selectedIndex.value = -1
  switch (view) {
    case 'tasks':
      store.fetchPendingTasks()
      break
    case 'kanban':
      store.fetchPendingTasks()
      break
    case 'calendar':
      store.fetchCalendarTasks()
      break
  }
})

function handleAddTask(description: string) {
  store.addTask({ description })
}

async function handleDayClick(date: string) {
  dayModalTasks.value = await store.fetchCompletedOnDate(date)
  dayModalDate.value = date
}

async function handleCompleteTask(uuid: string, desc: string) {
  await store.completeTask(uuid)
  await store.fetchStats()
  if (achievementEnabled.value) {
    doneInfo.value = { description: desc }
  }
}

function handleUpdateTask(uuid: string, data: Partial<Task>) {
  if (data.status === 'started') {
    store.startTask(uuid)
  } else if (data.status === 'pending') {
    store.stopTask(uuid)
  } else {
    store.updateTask(uuid, data as UpdateTaskRequest)
  }
}

function handleStartTask(uuid: string) {
  const task = store.tasks.find(t => t.uuid === uuid)
  if (task) {
    store.startTask(uuid)
    const { startTracking } = useTimeTracking()
    startTracking(task)
  }
}

function handleStopTask(uuid: string) {
  const { activeTask, stopTracking } = useTimeTracking()
  if (activeTask.value?.uuid === uuid) {
    stopTracking()
  }
  store.stopTask(uuid)
}

function handleDeleteTask(uuid: string) {
  store.deleteTask(uuid)
}

function handleSaveEdit(uuid: string, data: UpdateTaskRequest) {
  store.updateTask(uuid, data)
}

function handleUncompleteTask(uuid: string) {
  store.uncompleteTask(uuid)
}

function handleDeleteProject(name: string) {
  store.tasks
    .filter((t) => t.project === name)
    .forEach((t) => store.updateTask(t.uuid, { project: '' }))
}

function handleRenameProject(oldName: string, newName: string) {
  store.tasks
    .filter((t) => t.project === oldName)
    .forEach((t) => store.updateTask(t.uuid, { project: newName }))
  store.fetchStats()
}

function handleAddProject(name: string) {
  // Projects are task properties; no extra action needed
}

function handleRenameTag(oldName: string, newName: string) {
  store.tasks
    .filter((t) => t.tags?.includes(oldName))
    .forEach((t) =>
      store.updateTask(t.uuid, {
        tags: t.tags?.map(tag => tag === oldName ? newName : tag)
      })
    )
  store.fetchStats()
}

function handleDeleteTag(name: string) {
  store.tasks
    .filter((t) => t.tags?.includes(name))
    .forEach((t) =>
      store.updateTask(t.uuid, { tags: t.tags?.filter((tag) => tag !== name) })
    )
}

function openSettings() {
  if (!showSettings.value && settingsBtnRef.value) {
    const r = settingsBtnRef.value.getBoundingClientRect()
    settingsPos.value = { top: r.bottom + 8, left: Math.max(8, r.right - 196) }
  }
  showSettings.value = !showSettings.value
}

const completedTasks = computed(() =>
  store.completedTasks.sort((a, b) =>
    (b.end ?? '').localeCompare(a.end ?? '')
  )
)

const tabBtnClass = (id: string, cur: string) =>
  id === cur
    ? (isDark.value ? 'bg-white/15 text-white' : 'bg-indigo-500 text-white')
    : (isDark.value ? 'text-white/40 hover:bg-white/10 hover:text-white/70' : 'text-gray-500 hover:bg-gray-100')

const ctrlBtnClass = (active = false) =>
  active
    ? (isDark.value ? 'bg-white/12 text-white' : 'bg-black/8 text-gray-800')
    : (isDark.value ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-800 hover:bg-black/[0.06]')

const panelCls = () => isDark.value
  ? 'bg-white/[0.07] backdrop-blur-2xl border border-white/[0.13]'
  : 'bg-white/55 backdrop-blur-2xl border border-white/80'

const divider = () => isDark.value ? 'rgba(255,255,255,0.10)' : 'rgba(15,10,40,0.07)'
</script>

<template>
  <div
    class="h-screen flex overflow-hidden"
    :class="isDark ? 'mesh-dark' : 'mesh-light'"
  >
    <div class="flex gap-5 p-5 w-full h-full">
      <!-- LEFT PANEL -->
      <div
        class="flex flex-col rounded-3xl shadow-2xl overflow-hidden shrink-0"
        :class="panelCls()"
        :style="{ width: '310px', minWidth: '270px' }"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 pt-5 pb-4 shrink-0"
          :style="{ borderBottom: `1px solid ${divider()}` }"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              :style="{
                background: 'linear-gradient(135deg,#7C3AED,#6366F1)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.45)',
              }"
            >
              <Sparkles :size="15" class="text-white" />
            </div>
            <div>
              <div class="text-[13px] font-bold" :style="{ color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)' }">
                taskwarrior
              </div>
              <div class="text-[10px]" :style="{ color: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(15,10,40,0.46)' }">motion</div>
            </div>
          </div>
          <div class="flex gap-0.5">
            <button
              class="p-2 rounded-xl transition-colors cursor-pointer"
              :class="ctrlBtnClass()"
              title="快捷键 (?)"
              @click="showHelp = true"
            >
              <Keyboard :size="14" />
            </button>
            <button
              ref="settingsBtnRef"
              class="p-2 rounded-xl transition-colors cursor-pointer"
              :class="ctrlBtnClass(showSettings)"
              title="设置"
              @click="openSettings"
            >
              <Settings :size="14" />
            </button>
            <button
              class="p-2 rounded-xl transition-colors cursor-pointer"
              :class="ctrlBtnClass()"
              @click="toggleTheme"
            >
              <component :is="themeIcon" :size="14" />
            </button>
          </div>
        </div>

        <!-- Heatmap + Projects/Tags -->
        <div class="flex-1 flex flex-col min-h-0 px-5 py-5">
          <div class="shrink-0">
            <Heatmap @day-click="handleDayClick" />
          </div>
          <div
            class="flex-1 min-h-0 overflow-y-auto"
            :style="{ borderTop: `1px solid ${divider()}`, paddingTop: '20px' }"
          >
            <div class="flex gap-1 mb-4">
              <button
                class="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
                :class="tabBtnClass('projects', leftTab)"
                @click="leftTab = 'projects'"
              >项目进度</button>
              <button
                class="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
                :class="tabBtnClass('tags', leftTab)"
                @click="leftTab = 'tags'"
              >标签</button>
            </div>
            <ProjectProgress v-if="leftTab === 'projects'" @select="managingProject = $event" />
            <TagList v-else @select="managingTag = $event" />
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL -->
      <div
        class="flex-1 flex flex-col rounded-3xl shadow-2xl overflow-hidden"
        :class="panelCls()"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 pt-5 pb-4 shrink-0"
          :style="{ borderBottom: `1px solid ${divider()}` }"
        >
          <div>
            <h1
              class="text-xl font-black"
              :style="{ color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)' }"
            >{{ title }}</h1>
            <p
              class="text-xs mt-0.5"
              :style="{ color: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(15,10,40,0.46)' }"
            >{{ subtitle }}</p>
          </div>
          <div class="flex gap-1">
            <button
              v-for="tab in ([
                { key: 'tasks', label: '事项', icon: ListTodo },
                { key: 'kanban', label: '看板', icon: LayoutGrid },
                { key: 'calendar', label: '日历', icon: CalendarDays },
              ] as const)"
              :key="tab.key"
              class="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
              :class="tabBtnClass(tab.key, currentView)"
              @click="currentView = tab.key"
            ><component :is="tab.icon" :size="11" class="inline mr-1" />{{ tab.label }}</button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto px-6 pt-4 pb-6">
          <AnimatePresence mode="wait">
            <!-- Tasks view -->
            <Motion
              v-if="currentView === 'tasks'"
              key="tasks"
              :initial="{ opacity: 0, y: 4 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -4 }"
              :transition="{ duration: 0.16 }"
              class="flex flex-col"
              tag="div"
            >
              <div class="mb-4">
                <AddTaskBtn :is-dark="isDark" @open="showAddTask = true" />
              </div>

              <AnimatePresence>
                <Motion
                  v-if="store.pendingTasks.length === 0"
                  :initial="{ opacity: 0 }"
                  :animate="{ opacity: 1 }"
                  class="flex flex-col items-center justify-center py-20 text-center"
                  tag="div"
                >
                  <div
                    class="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    :style="{
                      background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(99,102,241,0.12)',
                      border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(99,102,241,0.18)',
                    }"
                  >
                    <Sparkles
                      :size="26"
                      :style="{ color: isDark ? 'rgba(255,255,255,0.45)' : '#818CF8' }"
                    />
                  </div>
                  <p
                    class="text-base font-black mb-1"
                    :style="{ color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,10,40,0.88)' }"
                  >今日任务全部完成</p>
                  <p
                    class="text-sm"
                    :style="{ color: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(15,10,40,0.46)' }"
                  >再添加一些，继续保持状态</p>
                </Motion>
              </AnimatePresence>

              <TaskCard
                v-for="(task, i) in store.pendingTasks"
                :key="task.uuid"
                :task="task"
                :index="i"
                :selected="selectedIndex === i"
                :all-projects="allProjects"
                :all-tags="allTags"
                @complete="handleCompleteTask"
                @edit="editingTask = $event"
                @delete="handleDeleteTask"
              />

              <CompletedSection
                :tasks="completedTasks"
                :is-dark="isDark"
                @uncomplete="handleUncompleteTask"
              />
            </Motion>

            <!-- Kanban view -->
            <Motion
              v-else-if="currentView === 'kanban'"
              key="kanban"
              :initial="{ opacity: 0, y: 4 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -4 }"
              :transition="{ duration: 0.16 }"
              class="h-full"
              tag="div"
            >
              <KanbanView
                :tasks="store.tasks"
                :is-dark="isDark"
                @edit="editingTask = $event"
                @complete="handleCompleteTask"
                @update="handleUpdateTask"
                @start="handleStartTask"
                @stop="handleStopTask"
              />
            </Motion>

            <!-- Calendar view -->
            <Motion
              v-else-if="currentView === 'calendar'"
              key="calendar"
              :initial="{ opacity: 0, y: 4 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -4 }"
              :transition="{ duration: 0.16 }"
              class="h-full"
              tag="div"
            >
              <CalendarView
                :tasks="store.tasks"
                :is-dark="isDark"
                @edit="editingTask = $event"
              />
            </Motion>
          </AnimatePresence>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AnimatePresence>
      <SettingsPanel
        v-if="showSettings"
        key="settings"
        :is-dark="isDark"
        :pos="settingsPos"
        :sound-enabled="soundEnabled"
        :achievement-enabled="achievementEnabled"
        @update:sound-enabled="soundEnabled = $event"
        @update:achievement-enabled="achievementEnabled = $event; try { localStorage.setItem('twm-achievement', String($event)) } catch {}"
        @close="showSettings = false"
      />
      <AddTaskModal
        v-if="showAddTask"
        key="add"
        :is-dark="isDark"
        @add="handleAddTask"
        @close="showAddTask = false"
      />
      <CompletionModal
        v-if="doneInfo"
        key="completion"
        :description="doneInfo.description"
        :is-dark="isDark"
        @close="doneInfo = null"
      />
      <TaskEditModal
        v-if="editingTask"
        key="edit"
        :task="editingTask"
        :is-dark="isDark"
        :all-projects="allProjects"
        :all-tags="allTags"
        @close="editingTask = null"
        @save="handleSaveEdit"
        @delete="handleDeleteTask"
        @add-project="handleAddProject"
        @delete-project="handleDeleteProject"
        @add-tag="() => {}"
        @delete-tag="handleDeleteTag"
      />
      <ProjectManageModal
        v-if="managingProject"
        key="proj"
        :project="managingProject"
        :tasks="store.tasks"
        :is-dark="isDark"
        :all-projects="allProjects"
        @close="managingProject = null"
        @rename="handleRenameProject"
        @delete="handleDeleteProject"
        @add-project="handleAddProject"
      />
      <TagManageModal
        v-if="managingTag"
        key="tag"
        :tag="managingTag"
        :tasks="store.tasks"
        :is-dark="isDark"
        @close="managingTag = null"
        @rename="handleRenameTag"
        @delete="handleDeleteTag"
      />
      <HelpModal
        v-if="showHelp"
        key="help"
        :is-dark="isDark"
        @close="showHelp = false"
      />
      <DayCompletedModal
        v-if="dayModalDate"
        key="day"
        :date="dayModalDate"
        :tasks="dayModalTasks"
        :is-dark="isDark"
        @close="dayModalDate = null"
      />
    </AnimatePresence>

    <!-- Error toast -->
    <div
      v-if="store.error"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-[13px] font-medium shadow-2xl"
      :style="{
        background: isDark ? 'rgba(14,7,34,0.88)' : 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        color: isDark ? '#fff' : '#1a1a2e',
        border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.28)',
      }"
    >
      {{ store.error }}
      <button class="ml-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" @click="store.error = null">×</button>
    </div>
  </div>
</template>
