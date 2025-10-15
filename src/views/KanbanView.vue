<template>
  <div class="kanban-view">
    <div v-if="authStore.user">
        <ProjectSelector />

        <!-- DEBUG: Información de sesión y control manual de carga (quitar en prod) -->
        <div style="margin:12px 0;padding:10px;border:1px dashed #ccc;border-radius:6px;background:#fafafa">
          <div style="margin-bottom:8px;font-weight:600">Debug sesión</div>
          <div style="font-size:0.9rem;color:#333">Token (preview): <code>{{ authStore.token ? authStore.token.slice(0,20) + '...' : '—' }}</code></div>
          <div style="font-size:0.9rem;color:#333;margin-top:6px">User: <pre style="display:inline">{{ authStore.user }}</pre></div>
          <div style="margin-top:8px">
            <button class="btn" @click="kanbanStore.fetchProjects">Forzar cargar proyectos</button>
          </div>
        </div>

      <div v-if="kanbanStore.projects.length > 0" class="kanban-board">
        <KanbanColumn
          title="Requerimientos"
          statusId="requerimientos"
          :tasks="kanbanStore.tasksByStatus.requerimientos"
        />
        <KanbanColumn title="Por Hacer" statusId="todo" :tasks="kanbanStore.tasksByStatus.todo" />
        <KanbanColumn
          title="En Progreso"
          statusId="in-progress"
          :tasks="kanbanStore.tasksByStatus['in-progress']"
        />
        <KanbanColumn
          title="Testing"
          statusId="testing"
          :tasks="kanbanStore.tasksByStatus.testing"
        />
        <KanbanColumn title="Hecho" statusId="done" :tasks="kanbanStore.tasksByStatus.done" />
      </div>
      <div v-else class="no-projects">
        <h2>Bienvenido a tu Tablero Kanban</h2>
        <p>Parece que no tienes ningún proyecto. ¡Crea uno para empezar a organizar tus tareasss!</p>
      </div>
      <TaskModal />
      <TutorialModal v-if="showTutorial" @close="showTutorial = false" />
    </div>

    <div v-else class="no-projects">
      <h2>Tablero Kanban</h2>
      <p>Por favor, inicia sesión para ver tus proyectos.</p>
      <div style="margin-top:12px">
        <button class="btn" @click="kanbanStore.forceMockProjects">Mostrar mock de proyectos</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useKanbanStore } from '@/stores/kanbanStore'
import { useAuthStore } from '@/stores/authStore'
import ProjectSelector from '@/components/ProjectSelector.vue'
import KanbanColumn from '@/components/KanbanColumn.vue'
import TaskModal from '@/components/TaskModal.vue'
import TutorialModal from '@/components/TutorialModal.vue' // Importa el nuevo componente
const kanbanStore = useKanbanStore()
const authStore = useAuthStore()
const showTutorial = ref(false)

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

<style scoped>
.kanban-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
  padding: 40px;
}

.kanban-board {
  display: flex;
  gap: 20px;
  flex-grow: 1;
  padding: 20px 0;
}

.no-projects {
  text-align: center;
  margin-top: 50px;
}

/* --- ESTILOS RESPONSIVOS --- */

/* Para Tablets y pantallas medianas */
@media (max-width: 1600px) {
  .kanban-board {
    justify-content: flex-start;
  }
}
</style>
