import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'

const apiCall = async (endpoint, options = {}) => {
  const authStore = useAuthStore()
  const user = authStore.user
  if (!user || !user.token) {
    console.error('API call abortada: Usuario no autenticado o token no disponible.')
    return null
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user.token.access_token}`,
    ...options.headers,
  }

  try {
    const response = await fetch(endpoint, { ...options, headers })
    if (!response.ok) {
      const errorData = await response.json()
      // Include details if available
      const errorMessage = errorData.error || `Error ${response.status}`
      const errorDetails = errorData.details ? `: ${errorData.details}` : ''
      throw new Error(errorMessage + errorDetails)
    }
    if (response.status === 204) {
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
  const isModalOpen = ref(false)
  const isEditing = ref(false)
  const editingTask = ref(null)
  const availableTags = ref(['Bug', 'Mejora', 'Urgente', 'Marketing', 'Diseño'])
  const DELETE_PASSWORD = '0846'

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
      const status = task.status || 'todo' // Si el estado es nulo o indefinido, se asigna a 'todo'
      if (categorizedTasks[status]) {
        categorizedTasks[status].push(task)
      } else {
        // Opcional: manejar estados inesperados si es necesario
        console.warn(`Tarea con estado inesperado: ${status}`, task)
        categorizedTasks.todo.push(task) // O ponerla en una columna por defecto
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
    console.log(`Fetching tasks for project: ${currentProjectId.value}`)
    const fetchedTasks = await apiCall(
      `/.netlify/functions/get-tasks?projectId=${currentProjectId.value}`,
    )
    if (fetchedTasks && fetchedTasks.length > 0) {
      console.log('Tasks fetched successfully:', fetchedTasks)
      tasks.value = fetchedTasks
    } else {
      console.log(
        'fetchTasks no devolvió tareas o la respuesta estaba vacía. La respuesta fue:',
        fetchedTasks,
      )
      // Si no hay tareas, nos aseguramos de que el array local esté vacío.
      tasks.value = []
    }
  }

  async function fetchProjects() {
    const authStore = useAuthStore()
    if (!authStore.user?.token) {
      projects.value = []
      tasks.value = []
      currentProjectId.value = null
      stopPolling()
      return
    }

    const fetchedProjects = (await apiCall('/.netlify/functions/get-projects')) || []
    projects.value = fetchedProjects

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
    const newTask = await apiCall('/.netlify/functions/create-task', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (newTask) tasks.value.push(newTask)
  }

  async function updateTask(taskData) {
    const result = await apiCall('/.netlify/functions/update-task', {
      method: 'PUT',
      body: JSON.stringify(taskData),
    })
    if (result) {
      const index = tasks.value.findIndex((t) => t.id === taskData.id)
      if (index !== -1) tasks.value[index] = { ...tasks.value[index], ...taskData }
    }
  }

  async function deleteTask(taskId) {
    console.log(`Intentando eliminar la tarea con ID: ${taskId}`)
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      console.log('Usuario confirmó la eliminación.')
      const result = await apiCall(`/.netlify/functions/delete-task?id=${taskId}`, {
        method: 'DELETE',
      })
      console.log('Resultado de la API de eliminación:', result)
      if (result) {
        tasks.value = tasks.value.filter((t) => t.id !== taskId)
        console.log('Tarea eliminada del estado local.')
      } else {
        console.error('La eliminación de la tarea falló. La API no devolvió un resultado exitoso.')
      }
    } else {
      console.log('Usuario canceló la eliminación.')
    }
  }

  async function createProject() {
    const projectName = prompt('Nombre del nuevo proyecto:')
    if (projectName?.trim()) {
      const newProject = await apiCall('/.netlify/functions/create-project', {
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
        await apiCall(`/.netlify/functions/delete-project?id=${currentProjectId.value}`, {
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
      const result = await apiCall('/.netlify/functions/add-project-member', {
        method: 'POST',
        body: JSON.stringify({ projectId: currentProjectId.value, newUserEmail: email.trim() }),
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
      if (currentProjectId.value && useAuthStore().user) {
        fetchTasks()
      }
    }, 10000)
  }

  function stopPolling() {
    if (pollingIntervalId) clearInterval(pollingIntervalId)
  }

  async function updateTaskStatus(taskId, newStatus) {
    // Find the task in the local state
    const taskIndex = tasks.value.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) return

    // Optimistically update the local state
    const oldStatus = tasks.value[taskIndex].status
    tasks.value[taskIndex].status = newStatus

    // Make the API call to update the backend
    const result = await apiCall('/.netlify/functions/update-task', {
      method: 'PUT',
      body: JSON.stringify({ id: taskId, status: newStatus }),
    })

    // If the API call fails, revert the change
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
