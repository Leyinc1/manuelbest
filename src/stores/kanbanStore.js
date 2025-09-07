import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'

// El helper para la API se mantiene igual, ya está preparado
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
  // --- STATE ---
  const projects = ref([])
  const tasks = ref([])
  const currentProjectId = ref(null)
  let pollingIntervalId = null

  // NUEVO: Estado para manejar el modal
  const isModalOpen = ref(false)
  const isEditing = ref(false)
  const editingTask = ref(null) // Contendrá la tarea a editar o los datos para una nueva

  // NUEVO: Constantes del script original
  const availableTags = ref(['Bug', 'Mejora', 'Urgente', 'Marketing', 'Diseño'])

  // --- GETTERS (se mantienen igual) ---
  const tasksByStatus = computed(() => {
    const tasksInProject = tasks.value.filter((task) => task.project_id === currentProjectId.value)
    return {
      todo: tasksInProject.filter((t) => t.status === 'todo'),
      'in-progress': tasksInProject.filter((t) => t.status === 'in-progress'),
      done: tasksInProject.filter((t) => t.status === 'done'),
    }
  })

  // --- ACTIONS ---

  // MODIFICADO: fetchTasks ahora solo obtiene tareas del proyecto actual
  async function fetchTasks() {
    if (!currentProjectId.value) return
    const fetchedTasks = await apiCall(
      `/.netlify/functions/get-tasks?projectId=${currentProjectId.value}`,
    )
    if (fetchedTasks) {
      tasks.value = fetchedTasks
    }
  }

  // MODIFICADO: fetchProjects ahora inicia el polling
  async function fetchProjects() {
    const authStore = useAuthStore()
    if (!authStore.user) {
      projects.value = []
      tasks.value = []
      currentProjectId.value = null
      return
    }
    projects.value = (await apiCall('/.netlify/functions/get-projects')) || []
    if (projects.value.length > 0) {
      if (!currentProjectId.value || !projects.value.find((p) => p.id === currentProjectId.value)) {
        await selectProject(projects.value[0].id)
      } else {
        // Si ya había uno seleccionado, solo recargamos las tareas
        await fetchTasks()
      }
    } else {
      tasks.value = []
      currentProjectId.value = null
    }
    startPolling() // Inicia la auto-actualización
  }

  async function selectProject(projectId) {
    currentProjectId.value = projectId
    await fetchTasks()
  }

  // --- NUEVO: Acciones completas para Tareas (CRUD) ---
  async function createTask(taskData) {
    const payload = {
      ...taskData,
      projectId: currentProjectId.value,
    }
    const newTask = await apiCall('/.netlify/functions/create-task', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (newTask) {
      tasks.value.push(newTask) // Actualización optimista
    }
  }

  async function updateTask(taskData) {
    const result = await apiCall('/.netlify/functions/update-task', {
      method: 'PUT',
      body: JSON.stringify(taskData),
    })
    if (result) {
      const index = tasks.value.findIndex((t) => t.id === taskData.id)
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], ...taskData } // Actualización optimista
      }
    }
  }

  async function deleteTask(taskId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      const result = await apiCall(`/.netlify/functions/delete-task?id=${taskId}`, {
        method: 'DELETE',
      })
      if (result) {
        tasks.value = tasks.value.filter((t) => t.id !== taskId) // Actualización optimista
      }
    }
  }

  // --- NUEVO: Acciones para el Modal ---
  function openModalForNew(status) {
    isEditing.value = false
    editingTask.value = {
      content: '',
      description: '',
      assigned_to: '',
      tags: [],
      status: status, // El estado de la columna donde se hizo clic
    }
    isModalOpen.value = true
  }

  function openModalForEdit(task) {
    isEditing.value = true
    // Clonamos la tarea para no modificar la original directamente hasta guardar
    editingTask.value = JSON.parse(JSON.stringify(task))
    isModalOpen.value = true
  }

  function closeModal() {
    isModalOpen.value = false
    editingTask.value = null
  }

  // --- NUEVO: Polling ---
  function startPolling() {
    stopPolling() // Asegurarse de que no hay otro intervalo corriendo
    pollingIntervalId = setInterval(async () => {
      if (!currentProjectId.value) return
      const latestTasks = await apiCall(
        `/.netlify/functions/get-tasks?projectId=${currentProjectId.value}`,
      )
      // Comparamos si los datos han cambiado para evitar re-renderizados innecesarios
      if (latestTasks && JSON.stringify(latestTasks) !== JSON.stringify(tasks.value)) {
        console.log('Cambios detectados, actualizando tablero...')
        tasks.value = latestTasks
      }
    }, 10000) // Consulta cada 10 segundos
  }

  function stopPolling() {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId)
      pollingIntervalId = null
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
    startPolling,
    stopPolling,
  }
})
