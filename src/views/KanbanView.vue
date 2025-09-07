<template>
  <div class="kanban-view">
    <div v-if="authStore.user">
      <ProjectSelector />

      <div v-if="kanbanStore.projects.length > 0" class="kanban-board">
        <KanbanColumn title="Por Hacer" statusId="todo" :tasks="kanbanStore.tasksByStatus.todo" />
        <KanbanColumn
          title="En Progreso"
          statusId="in-progress"
          :tasks="kanbanStore.tasksByStatus['in-progress']"
        />
        <KanbanColumn title="Hecho" statusId="done" :tasks="kanbanStore.tasksByStatus.done" />
      </div>
      <div v-else class="no-projects">
        <h2>Bienvenido a tu Tablero Kanban</h2>
        <p>Parece que no tienes ningún proyecto. ¡Crea uno para empezar a organizar tus tareas!</p>
      </div>
    </div>

    <div v-else class="no-projects">
      <h2>Tablero Kanban</h2>
      <p>Por favor, inicia sesión para ver tus proyectos.</p>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useKanbanStore } from '@/stores/kanbanStore'
import { useAuthStore } from '@/stores/authStore'
import ProjectSelector from '@/components/ProjectSelector.vue'
import KanbanColumn from '@/components/KanbanColumn.vue'

const kanbanStore = useKanbanStore()
const authStore = useAuthStore()

// Esta lógica se mantiene, es correcta.
// "Observa" al usuario. Si cambia (login/logout), reacciona.
watch(
  () => authStore.user,
  (newUser) => {
    // Si hay un nuevo usuario (acaba de iniciar sesión o ya estaba logueado al cargar la página)
    // entonces, le pedimos al kanbanStore que cargue los proyectos.
    if (newUser) {
      kanbanStore.fetchProjects()
    } else {
      // Si el usuario cierra sesión (newUser es null), limpiamos el tablero.
      kanbanStore.projects = []
      kanbanStore.tasks = []
      kanbanStore.currentProjectId = null
    }
  },
  { immediate: true },
) // immediate: true hace que se ejecute una vez al cargar
</script>

<style>
/* Pega aquí TODO el contenido de tu archivo Kanban/style.css original */
.kanban-view {
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.kanban-board {
  display: flex;
  gap: 15px;
  flex-grow: 1;
}

.no-projects {
  text-align: center;
  margin-top: 50px;
}
/* ...y el resto de los estilos del kanban... */
</style>
