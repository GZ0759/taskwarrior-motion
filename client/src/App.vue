<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Sparkles, Volume2, VolumeX, Settings, ListTodo, LayoutGrid, CalendarDays, Plus } from '@lucide/vue'
import { useTaskStore } from '@/stores/task'
import { useTheme } from '@/composables/useTheme'
import { useKeyboard } from '@/composables/useKeyboard'
import { useSound } from '@/composables/useSound'
import { useTaskActions } from '@/composables/useTaskActions'
import { Motion, AnimatePresence } from 'motion-v'
import Heatmap from '@/components/Heatmap.vue'
import ProjectProgress from '@/components/ProjectProgress.vue'
import TaskCard from '@/components/TaskCard.vue'
import AddTaskBtn from '@/components/AddTaskBtn.vue'
import CreateModal from '@/components/CreateModal.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import CompletedSection from '@/components/CompletedSection.vue'
import CompletionModal from '@/components/CompletionModal.vue'
import TaskEditModal from '@/components/TaskEditModal.vue'
import HelpModal from '@/components/HelpModal.vue'
import ProjectManageModal from '@/components/ProjectManageModal.vue'
import TagList from '@/components/TagList.vue'
import TagManageModal from '@/components/TagManageModal.vue'
import DayCompletedModal from '@/components/DayCompletedModal.vue'
import TimerModal from '@/components/TimerModal.vue'
import KanbanView from '@/views/KanbanView.vue'
import CalendarView from '@/views/CalendarView.vue'
import type { Task } from '@/types/task'
import { getTodayStr, taskDateToISO, parseTaskDate } from '@/utils/date'

const store = useTaskStore()
const { startTask, stopTask, updateTask, completeTask, deleteTask, saveEdit, uncompleteTask } = useTaskActions()
const { theme, isDark, setTheme } = useTheme()
const { soundEnabled, toggleSound } = useSound()

const doneInfo = ref<{ description: string } | null>(null)

type ViewType = 'tasks' | 'kanban' | 'calendar'
const currentView = ref<ViewType>((localStorage.getItem('twm-view') as ViewType) || 'tasks')
const leftTab = ref<'projects' | 'tags'>('projects')

const allProjects = computed(() => store.allProjects)
const allTags = computed(() => store.allTags)

const todayCount = computed(() => store.stats?.todayCount ?? 0)
const totalDone = computed(() => store.stats?.totalDone ?? 0)
const activeCount = computed(() => store.stats?.pendingCount ?? store.pendingTasks.length)

const kanbanTasks = computed(() => [...store.pendingTasks, ...store.completedTasks])

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

const editingTask = ref<Task | null>(null)
const showHelp = ref(false)
const showAddTask = ref(false)
const showSettings = ref(false)
const creatingType = ref<'task' | 'project' | 'tag' | null>(null)
const settingsPos = ref({ top: 0, left: 0 })
const settingsBtnRef = ref<HTMLButtonElement | null>(null)
const managingProject = ref<string | null>(null)
const managingTag = ref<string | null>(null)
const timerTask = ref<Task | null>(null)
const dayModalDate = ref<string | null>(null)
const dayModalTasks = ref<Task[]>([])
const achievementEnabled = ref((() => { try { return localStorage.getItem('twm-achievement') !== 'false' } catch { return true } })())

const selectedIndex = ref(-1)

useKeyboard({
  onNewTask: () => {
    creatingType.value = 'task'
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
  onCompleteTask: async () => {
    if (selectedIndex.value >= 0 && selectedIndex.value < store.pendingTasks.length) {
      const task = store.pendingTasks[selectedIndex.value]
      const result = await completeTask(task.uuid, task.description, achievementEnabled.value)
      if (result) doneInfo.value = result
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
    creatingType.value = null
    showSettings.value = false
    managingProject.value = null
    managingTag.value = null
    timerTask.value = null
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
  store.fetchCompletedTasks()
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
      store.fetchCompletedTasks()
      break
    case 'calendar':
      store.fetchCalendarTasks()
      break
  }
  localStorage.setItem('twm-view', view)
})

function handleAddTask(description: string) {
  store.addTask({ description })
}

function handleCreate(value: string) {
  if (creatingType.value === 'task') {
    store.addTask({ description: value })
  } else if (creatingType.value === 'project') {
    store.addProject(value)
  } else if (creatingType.value === 'tag') {
    store.addTag(value)
  }
}

async function handleDayClick(date: string) {
  dayModalTasks.value = await store.fetchCompletedOnDate(date)
  dayModalDate.value = date
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
  store.addProject(name)
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
    ? 'bg-[var(--accent-indigo)] text-[var(--txt-on-color)]'
    : 'text-[var(--txt-muted)] hover:bg-[var(--glass-panel-hover-bg)] hover:text-[var(--txt-primary)]'

const ctrlBtnClass = (active = false) =>
  active
    ? 'bg-[var(--glass-panel-hover-bg)] text-[var(--txt-primary)]'
    : 'text-[var(--ctrl-btn)] hover:text-[var(--ctrl-btn-hover)] hover:bg-[var(--glass-panel-hover-bg)]'

const panelCls = () =>
  'bg-[var(--glass-panel-bg)] backdrop-blur-2xl border border-[var(--glass-panel-border)]'

const divider = () => 'var(--divider)'
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
          :style="{ borderBottom: '1px solid var(--divider)' }"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              :style="{
                background: 'linear-gradient(135deg, var(--btn-primary-from), var(--btn-primary-to))',
                boxShadow: '0 4px 14px var(--btn-primary-shadow)',
              }"
            >
              <Sparkles :size="15" class="text-white" />
            </div>
            <div>
              <div class="text-[13px] font-bold" :style="{ color: 'var(--txt-primary)' }">
                taskwarrior
              </div>
              <div class="text-[10px]" :style="{ color: 'var(--txt-muted)' }">motion</div>
            </div>
          </div>
          <div class="flex gap-0.5">
            <button
              ref="settingsBtnRef"
              class="p-2 rounded-xl transition-colors cursor-pointer"
              :class="ctrlBtnClass()"
              @click="openSettings"
            >
              <Settings :size="14" />
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
            :style="{ borderTop: '1px solid var(--divider)', paddingTop: '20px' }"
          >
            <div class="flex gap-1 mb-4 items-center">
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
              <button
                class="ml-auto p-1.5 rounded-xl transition-colors cursor-pointer"
              :class="ctrlBtnClass(showSettings)"
                @click="creatingType = leftTab === 'projects' ? 'project' : 'tag'"
              >
                <Plus :size="12" />
              </button>
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
          :style="{ borderBottom: '1px solid var(--divider)' }"
        >
          <div>
            <h1
              class="text-xl font-black"
              :style="{ color: 'var(--txt-primary)' }"
            >{{ title }}</h1>
            <p
              class="text-xs mt-0.5"
              :style="{ color: 'var(--txt-muted)' }"
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
                <AddTaskBtn @open="creatingType = 'task'" />
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
                      background: 'var(--today-highlight)',
                      border: '1px solid var(--border-emphasis)',
                    }"
                  >
                    <Sparkles
                      :size="26"
                      :style="{ color: 'var(--txt-accent)' }"
                    />
                  </div>
                  <p
                    class="text-base font-black mb-1"
                    :style="{ color: 'var(--txt-primary)' }"
                  >今日任务全部完成</p>
                  <p
                    class="text-sm"
                    :style="{ color: 'var(--txt-muted)' }"
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
                @complete="async (uuid, desc) => { const result = await completeTask(uuid, desc, achievementEnabled); if (result) doneInfo = result }"
                @edit="editingTask = $event"
                @delete="deleteTask"
                @timer="timerTask = $event"
              />

              <CompletedSection
                :tasks="completedTasks"
                @uncomplete="uncompleteTask"
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
                :tasks="kanbanTasks"
                :is-dark="isDark"
                @edit="editingTask = $event"
                @complete="async (uuid, desc) => { const result = await completeTask(uuid, desc, achievementEnabled); if (result) doneInfo = result }"
                @update="updateTask"
                @start="startTask"
                @stop="stopTask"
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
        :pos="settingsPos"
        :theme="theme"
        :sound-enabled="soundEnabled"
        :achievement-enabled="achievementEnabled"
        @update:theme="setTheme"
        @update:sound-enabled="soundEnabled = $event"
        @update:achievement-enabled="achievementEnabled = $event; try { localStorage.setItem('twm-achievement', String($event)) } catch {}"
        @show-help="showHelp = true; showSettings = false"
        @close="showSettings = false"
      />
      <CreateModal
        v-if="creatingType"
        key="create"
        :type="creatingType"
        :is-dark="isDark"
        @create="handleCreate"
        @close="creatingType = null"
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
        @save="saveEdit"
        @delete="deleteTask"
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
      <TimerModal
        v-if="timerTask"
        key="timer"
        :task="timerTask"
        :is-dark="isDark"
        @close="timerTask = null"
        @start="startTask"
        @stop="stopTask"
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
        background: 'var(--glass-modal-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        color: 'var(--txt-primary)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-toast)',
      }"
    >
      {{ store.error }}
      <button class="ml-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" @click="store.error = null">×</button>
    </div>
  </div>
</template>
