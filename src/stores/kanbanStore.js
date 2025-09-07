import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore' // <-- IMPORTANTE: Traemos el store de autenticación

// Esta función ahora es inteligente: PIDE EL TOKEN al authStore
const getAuthHeaders = () => {
  const authStore = useAuthStore()
  const user = authStore.user

  if (!user || !user.token) {
    return {}
  }

  return { Authorization: `Bearer ${user.token.access_token}` }
}

// El resto de la función es igual, pero ahora usará los headers correctos
const apiCall = async (endpoint, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders(), ...options.headers }
  try {
    const response = await fetch(endpoint, { ...options, headers })
    if (response.status === 401) {
      console.error('API call no autorizada. El usuario no está logueado o el token es inválido.')
      return null
    }
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error ${response.status}`)
    }
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true }
    }
    return await response.json()
  } catch (error) {
    console.error(`Error en la llamada a ${endpoint}:`, error)
    alert(`Error: ${error.message}`)
    return null
  }
}

export const useKanbanStore = defineStore('kanban', () => {
  // --- STATE ---
  const projects = ref([])
  const tasks = ref([])
  const currentProjectId = ref(null)

  // --- GETTERS ---
  const tasksByStatus = computed(() => {
    return {
      todo: tasks.value.filter((t) => t.status === 'todo'),
      'in-progress': tasks.value.filter((t) => t.status === 'in-progress'),
      done: tasks.value.filter((t) => t.status === 'done'),
    }
  })

  // --- ACTIONS ---
  // IMPORTANTE: Esta acción ahora revisa si estás logueado ANTES de buscar proyectos
  async function fetchProjects() {
    const authStore = useAuthStore()
    if (!authStore.user) {
      // Si no hay usuario, se limpia todo y no se hace nada más.
      projects.value = []
      tasks.value = []
      currentProjectId.value = null
      return
    }

    projects.value = (await apiCall('/.netlify/functions/get-projects')) || []
    if (projects.value.length > 0) {
      if (!currentProjectId.value || !projects.value.find((p) => p.id === currentProjectId.value)) {
        await selectProject(projects.value[0].id)
      }
    } else {
      tasks.value = []
      currentProjectId.value = null
    }
  }

  async function selectProject(projectId) {
    currentProjectId.value = projectId
    await fetchTasks()
  }

  async function fetchTasks() {
    if (!currentProjectId.value) {
      tasks.value = []
      return
    }
    const result = await apiCall(
      `/.netlify/functions/get-tasks?projectId=${currentProjectId.value}`,
    )
    tasks.value = result || []
  }

  async function updateTaskStatus(taskId, newStatus) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.status = newStatus
    }

    await apiCall('/.netlify/functions/update-task', {
      method: 'PUT',
      body: JSON.stringify({ id: taskId, status: newStatus }),
    })
  }

  return {
    projects,
    tasks,
    currentProjectId,
    tasksByStatus,
    fetchProjects,
    selectProject,
    fetchTasks,
    updateTaskStatus,
  }
})
