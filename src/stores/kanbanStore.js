import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Opcional: Para simular la autenticación por ahora
const getAuthHeaders = () => {
  // En un futuro, integraremos Netlify Identity aquí.
  // Por ahora, asumimos que estamos logueados para las pruebas.
  // Si tienes un token de prueba, puedes ponerlo aquí.
  // const user = window.netlifyIdentity?.currentUser();
  // if (!user) return {};
  // return { Authorization: `Bearer ${user.token.access_token}` };
  return {} // Sin headers por ahora para pruebas locales si el backend lo permite
}

// Helper para centralizar las llamadas a la API
const apiCall = async (endpoint, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeaders(), ...options.headers }
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
  // Reemplaza las variables globales del script original
  const projects = ref([])
  const tasks = ref([])
  const currentProjectId = ref(null)

  // --- GETTERS ---
  // Equivalente a tener datos computados a partir del estado
  const currentProjectTasks = computed(() => {
    if (!currentProjectId.value) return []
    // Filtramos las tareas para solo mostrar las del proyecto actual
    // En el futuro, la API podría devolver solo las tareas necesarias
    return tasks.value
  })

  const tasksByStatus = computed(() => {
    return {
      todo: currentProjectTasks.value.filter((t) => t.status === 'todo'),
      'in-progress': currentProjectTasks.value.filter((t) => t.status === 'in-progress'),
      done: currentProjectTasks.value.filter((t) => t.status === 'done'),
    }
  })

  // --- ACTIONS ---
  // Reemplaza las funciones de la API del script original
  async function fetchProjects() {
    projects.value = (await apiCall('/.netlify/functions/get-projects')) || []
    if (projects.value.length > 0) {
      // Si no hay un proyecto seleccionado, seleccionamos el primero
      if (!currentProjectId.value || !projects.value.find((p) => p.id === currentProjectId.value)) {
        await selectProject(projects.value[0].id)
      }
    } else {
      // Si no hay proyectos, limpiamos el tablero
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
    // Actualización optimista: movemos la tarjeta en la UI inmediatamente
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.status = newStatus
    }

    // Y luego enviamos la actualización a la API en segundo plano
    await apiCall('/.netlify/functions/update-task', {
      method: 'PUT',
      body: JSON.stringify({ id: taskId, status: newStatus }),
    })
    // No necesitamos recargar todo, la UI ya está actualizada.
    // Opcional: podríamos volver a llamar a fetchTasks() si la API devuelve el objeto completo.
  }

  // Aquí añadiremos el resto de acciones (createTask, deleteProject, etc.)

  return {
    projects,
    tasks,
    currentProjectId,
    currentProjectTasks,
    tasksByStatus,
    fetchProjects,
    selectProject,
    fetchTasks,
    updateTaskStatus,
  }
})
