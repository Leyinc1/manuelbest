import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'

const apiCall = async (endpoint, options = {}) => {
  const authStore = useAuthStore()
  const user = authStore.user
  if (!user || !user.token) return null

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user.token.access_token}`,
    ...options.headers,
  }
  try {
    const response = await fetch(endpoint, { ...options, headers })
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
  // STATE
  const projects = ref([])
  const tasks = ref([])
  const currentProjectId = ref(null)
  let pollingIntervalId = null
  const isModalOpen = ref(false)
  const isEditing = ref(false)
  const editingTask = ref(null)
  const availableTags = ref(['Bug', 'Mejora', 'Urgente', 'Marketing', 'Diseño'])
  const DELETE_PASSWORD = '0846'

  // GETTERS
  const tasksByStatus = computed(() => {
    const tasksInProject = tasks.value.filter((task) => task.project_id === currentProjectId.value)
    return {
      todo: tasksInProject.filter((t) => t.status === 'todo'),
      'in-progress': tasksInProject.filter((t) => t.status === 'in-progress'),
      done: tasksInProject.filter((t) => t.status === 'done'),
    }
  })
  const selectedProjectName = computed(() => {
    const project = projects.value.find((p) => p.id === currentProjectId.value)
    return project ? project.name : ''
  })

  // ACTIONS
  async function fetchTasks() {
    if (!currentProjectId.value) return
    const fetchedTasks = await apiCall(
      `/.netlify/functions/get-tasks?projectId=${currentProjectId.value}`,
    )
    if (fetchedTasks) tasks.value = fetchedTasks
  }

  async function fetchProjects() {
    const authStore = useAuthStore()
    if (!authStore.user) {
      projects.value = []
      tasks.value = []
      currentProjectId.value = null
      return
    }
    const fetchedProjects = (await apiCall('/.netlify/functions/get-projects')) || []
    projects.value = fetchedProjects
    if (fetchedProjects.length > 0) {
      if (
        !currentProjectId.value ||
        !fetchedProjects.find((p) => p.id === currentProjectId.value)
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
    const newTask = await apiCall('/.netlify/functions/create-task', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (newTask) tasks.value.push(newTask)
  }

  async function updateTask(taskData) {
    await apiCall('/.netlify/functions/update-task', {
      method: 'PUT',
      body: JSON.stringify(taskData),
    })
    // La actualización visual se hará por polling o se puede hacer optimista aquí
    await fetchTasks()
  }

  async function deleteTask(taskId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      const result = await apiCall(`/.netlify/functions/delete-task?id=${taskId}`, {
        method: 'DELETE',
      })
      if (result) tasks.value = tasks.value.filter((t) => t.id !== taskId)
    }
  }

  // --- NUEVAS ACCIONES PARA PROYECTOS ---
  async function createProject() {
    const projectName = prompt('Nombre del nuevo proyecto:')
    if (projectName && projectName.trim()) {
      const newProject = await apiCall('/.netlify/functions/create-project', {
        method: 'POST',
        body: JSON.stringify({ name: projectName.trim() }),
      })
      if (newProject) {
        await fetchProjects() // Recarga la lista de proyectos
        await selectProject(newProject.id) // Selecciona el nuevo proyecto
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
        confirm(
          `¿Estás SEGURO de que quieres eliminar el proyecto "${selectedProjectName.value}" y TODAS sus tareas?`,
        )
      ) {
        await apiCall(`/.netlify/functions/delete-project?id=${currentProjectId.value}`, {
          method: 'DELETE',
        })
        currentProjectId.value = null // Deseleccionar
        await fetchProjects() // Recargar proyectos
      }
    } else if (password !== null) {
      alert('Contraseña incorrecta.')
    }
  }

  async function shareProject() {
    if (!currentProjectId.value) return
    const email = prompt('Introduce el email del usuario a invitar (debe estar registrado):')
    if (email && email.trim()) {
      const result = await apiCall('/.netlify/functions/add-project-member', {
        method: 'POST',
        body: JSON.stringify({ projectId: currentProjectId.value, newUserEmail: email.trim() }),
      })
      if (result) alert('¡Usuario invitado exitosamente!')
    }
  }

  // --- Acciones del Modal ---
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

  // --- Polling ---
  function startPolling() {
    stopPolling()
    pollingIntervalId = setInterval(async () => {
      if (!currentProjectId.value || !useAuthStore().user) return
      const latestTasks = await apiCall(
        `/.netlify/functions/get-tasks?projectId=${currentProjectId.value}`,
      )
      if (latestTasks && JSON.stringify(latestTasks) !== JSON.stringify(tasks.value)) {
        tasks.value = latestTasks
      }
    }, 10000)
  }
  function stopPolling() {
    if (pollingIntervalId) clearInterval(pollingIntervalId)
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
    startPolling,
    stopPolling,
  }
})
