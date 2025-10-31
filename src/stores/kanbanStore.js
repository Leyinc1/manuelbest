import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'

const apiCall = async (endpoint, options = {}) => {
  const authStore = useAuthStore()
  // authStore.token is a ref; read its value
  const token = authStore.token?.value
  if (!token) { // Check if the token exists
    console.error('API call abortada: Usuario no autenticado o token no disponible.')
    return null
  }

    // Log minimal info for debugging (do not leak full token in logs)
    try {
      const tokenPreview = token ? `${token.slice(0, 10)}...` : null
      console.debug('[apiCall] endpoint:', endpoint, 'method:', options.method || 'GET', 'tokenPreview:', tokenPreview)
    } catch {
      // ignore logging errors
    }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  try {
    const response = await fetch(endpoint, { ...options, headers })
    if (!response.ok) {
      const errorData = await response.json()
      // Include details if available
      const errorMessage = errorData.message || errorData.error || `Error ${response.status}`
      const errorDetails = errorData.details ? `: ${errorData.details}` : ''
      throw new Error(errorMessage + errorDetails)
    }
    if (response.status === 204) {
      return []; // Return empty array for No Content
    }
    const text = await response.text();
    return text ? JSON.parse(text) : []; // Parse text only if not empty, otherwise return empty array
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
  let pollingIntervalId = null
  const isModalOpen = ref(false)
  const isEditing = ref(false)
  const editingTask = ref(null)
  const availableTags = ref(['Bug', 'Mejora', 'Urgente', 'Marketing', 'Diseño'])
  const DELETE_PASSWORD = '0846'
  const isMockActive = ref(false)

  // --- GETTERS ---
  const tasksByStatus = computed(() => {
    const categorizedTasks = {
      requerimientos: [],
      todo: [],
      'in-progress': [],
      testing: [],
      done: [],
    }

    tasks.value.forEach((task) => {
      const status = task.status || 'todo'
      if (categorizedTasks[status]) {
        categorizedTasks[status].push(task)
      } else {
        console.warn(`Tarea con estado inesperado: ${status}`, task)
        categorizedTasks.todo.push(task)
      }
    })

    return categorizedTasks
  })

  const selectedProjectName = computed(() => {
    const project = projects.value.find((p) => p.id === currentProjectId.value)
    return project ? project.name : ''
  })

  // --- ACTIONS ---
  async function fetchTasks() {
    if (!currentProjectId.value) {
      console.log('fetchTasks abortado: no hay currentProjectId.')
      return
    }
    const fetchedTasks = await apiCall(`/api/Tasks?projectId=${currentProjectId.value}`)
    if (fetchedTasks) {
      tasks.value = fetchedTasks
    } else {
      tasks.value = []
    }
  }

  async function fetchProjects() {
    const authStore = useAuthStore()
    // authStore.token is the source of truth for the JWT token
    if (!authStore.token) {
      projects.value = []
      tasks.value = []
      currentProjectId.value = null
      stopPolling()
      return
    }

    const fetchedProjects = (await apiCall('/api/Projects')) || []
    console.debug('[fetchProjects] raw projects:', fetchedProjects)

    // Normalize backend property casing: backend may return PascalCase (Id/Name)
    const normalized = fetchedProjects.map((p) => ({
      // keep original properties, but ensure `id` and `name` exist in camelCase
      ...p,
      id: p.id ?? p.Id,
      name: p.name ?? p.Name,
    }))
    projects.value = normalized
    console.debug('[fetchProjects] normalized projects:', projects.value)

    // === TEMPORARY DEBUG FALLBACK ===
    // If no projects were returned from the API, populate a small mock so the
    // UI can be tested immediately on the server. Remove this in production.
    if (!projects.value || projects.value.length === 0) {
      console.warn('[fetchProjects] no projects returned from API — applying temporary mock for debugging')
      const now = Date.now()
      const mock = [
        { id: '00000000-0000-0000-0000-000000000001', name: 'Proyecto de prueba 1', ownerId: 'me', createdAt: now },
        { id: '00000000-0000-0000-0000-000000000002', name: 'Proyecto de prueba 2', ownerId: 'me', createdAt: now },
      ]
      projects.value = mock
      isMockActive.value = true
    } else {
      isMockActive.value = false
    }

    if (fetchedProjects.length > 0) {
      if (
        !currentProjectId.value ||
        !fetchedProjects.some((p) => p.id === currentProjectId.value)
      ) {
        await selectProject(fetchedProjects[0].id)
      } else {
        await fetchTasks()
      }
    } else {
      tasks.value = []
      currentProjectId.value = null
    }
    startPolling()
  }



  async function selectProject(projectId) {
    currentProjectId.value = projectId
    await fetchTasks()
  }

  async function createTask(taskData) {
    const payload = { ...taskData, projectId: currentProjectId.value }
    const newTask = await apiCall('/api/Tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (newTask) tasks.value.push(newTask)
  }

  async function updateTask(taskData) {
    const { id, ...payload } = taskData
    const result = await apiCall(`/api/Tasks/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    if (result) {
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) tasks.value[index] = { ...tasks.value[index], ...taskData }
    }
  }

  async function deleteTask(taskId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      const result = await apiCall(`/api/Tasks/${taskId}`, {
        method: 'DELETE',
      })
      if (result) {
        tasks.value = tasks.value.filter((t) => t.id !== taskId)
      }
    }
  }

  async function createProject() {
    const projectName = prompt('Nombre del nuevo proyecto:')
    if (projectName?.trim()) {
      const newProject = await apiCall('/api/Projects', {
        method: 'POST',
        body: JSON.stringify({ name: projectName.trim() }),
      })
      if (newProject) {
        projects.value.push(newProject)
        await selectProject(newProject.id)
      }
    }
  }

  async function deleteProject() {
    if (!currentProjectId.value) return
    const password = prompt(
      `Para eliminar "${selectedProjectName.value}", introduce la contraseña:`,
    )
    if (password === DELETE_PASSWORD) {
      if (
        confirm(`¿SEGURO que quieres eliminar "${selectedProjectName.value}" y TODAS sus tareas?`)
      ) {
        await apiCall(`/api/Projects/${currentProjectId.value}`, {
          method: 'DELETE',
        })
        currentProjectId.value = null
        await fetchProjects()
      }
    } else if (password !== null) {
      alert('Contraseña incorrecta.')
    }
  }

  async function shareProject() {
    if (!currentProjectId.value) return
    const email = prompt('Introduce el email del usuario a invitar (debe estar registrado):')
    if (email?.trim()) {
      const result = await apiCall(`/api/Projects/${currentProjectId.value}/members`, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      })
      if (result) alert('¡Usuario invitado exitosamente!')
    }
  }

  function openModalForNew(status) {
    isEditing.value = false
    editingTask.value = { content: '', description: '', assigned_to: '', tags: [], status }
    isModalOpen.value = true
  }

  function openModalForEdit(task) {
    isEditing.value = true
    editingTask.value = JSON.parse(JSON.stringify(task))
    isModalOpen.value = true
  }

  function closeModal() {
    isModalOpen.value = false
    editingTask.value = null
  }

  function startPolling() {
    stopPolling()
    pollingIntervalId = setInterval(() => {
      if (currentProjectId.value && useAuthStore().user?.value) {
        fetchTasks()
      }
    }, 10000)
  }

  function stopPolling() {
    if (pollingIntervalId) clearInterval(pollingIntervalId)
  }

  async function updateTaskStatus(taskId, newStatus) {
    const taskIndex = tasks.value.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) return

    const oldStatus = tasks.value[taskIndex].status
    tasks.value[taskIndex].status = newStatus

    const result = await apiCall(`/api/Tasks/${taskId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    })

    if (!result) {
      tasks.value[taskIndex].status = oldStatus
      alert('Error: No se pudo actualizar la tarea. Por favor, inténtalo de nuevo.')
    }
  }

  return {
    projects,
    tasks,
    currentProjectId,
    isModalOpen,
    isEditing,
    editingTask,
    availableTags,
    tasksByStatus,
    fetchProjects,
    selectProject,
    createTask,
    updateTask,
    deleteTask,
    openModalForNew,
    openModalForEdit,
    closeModal,
    createProject,
    deleteProject,
    shareProject,
    updateTaskStatus,
  }
})
