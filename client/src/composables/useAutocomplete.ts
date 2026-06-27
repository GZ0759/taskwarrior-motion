import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/task'

export function useAutocomplete() {
  const store = useTaskStore()
  const query = ref('')
  const showSuggestions = ref(false)

  const projects = computed(() => {
    const projectSet = new Set<string>()
    store.tasks.forEach((t) => {
      if (t.project) {
        projectSet.add(t.project)
      }
    })
    return Array.from(projectSet).sort()
  })

  const tags = computed(() => {
    const tagSet = new Set<string>()
    store.tasks.forEach((t) => {
      t.tags?.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

  const filteredProjects = computed(() => {
    if (!query.value) return projects.value
    return projects.value.filter((p) => p.toLowerCase().includes(query.value.toLowerCase()))
  })

  const filteredTags = computed(() => {
    if (!query.value) return tags.value
    return tags.value.filter((t) => t.toLowerCase().includes(query.value.toLowerCase()))
  })

  function selectProject(project: string) {
    query.value = project
    showSuggestions.value = false
  }

  function selectTag(tag: string) {
    query.value = tag
    showSuggestions.value = false
  }

  function clear() {
    query.value = ''
    showSuggestions.value = false
  }

  return {
    query,
    showSuggestions,
    projects,
    tags,
    filteredProjects,
    filteredTags,
    selectProject,
    selectTag,
    clear,
  }
}
