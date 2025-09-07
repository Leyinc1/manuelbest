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
      throw new Error(errorData.error || `Error ${response.status}`)
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
    // CORRECCIÓN CLAVE: Las tareas en el ref `tasks` YA SON las del proyecto actual.
    // No necesitamos un segundo filtro aquí.
    return {
      requerimientos: tasks.value.filter((t) => t.status === 'requerimientos'),
      todo: tasks.value.filter((t) => t.status === 'todo'),
      'in-progress': tasks.value.filter((t) => t.status === 'in-progress'),
      testing: tasks.value.filter((t) => t.status === 'testing'),
      done: tasks.value.filter((t) => t.status === 'done'),
    }
  })

  const selectedProjectName = computed(() => {
    const project = projects.value.find((p) => p.id === currentProjectId.value)
    return project ? project.name : ''
  })

  // --- ACTIONS ---
  async function fetchTasks() {
    if (!currentProjectId.value) return
    const fetchedTasks = await apiCall(
      `/.netlify/functions/get-tasks?projectId=${currentProjectId.value}`,
    )
    if (fetchedTasks) {
      tasks.value = fetchedTasks
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
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      const result = await apiCall(`/.netlify/functions/delete-task?id=${taskId}`, {
        method: 'DELETE',
      })
      if (result) tasks.value = tasks.value.filter((t) => t.id !== taskId)
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
    const taskIndex = tasks.value.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    // Optimistically update the local state
    const oldStatus = tasks.value[taskIndex].status;
    tasks.value[taskIndex].status = newStatus;

    // Make the API call to update the backend
    const result = await apiCall('/.netlify/functions/update-task', {
      method: 'PUT',
      body: JSON.stringify({ id: taskId, status: newStatus }),
    });

    // If the API call fails, revert the change
    if (!result) {
      tasks.value[taskIndex].status = oldStatus;
      alert('Error: No se pudo actualizar la tarea. Por favor, inténtalo de nuevo.');
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
