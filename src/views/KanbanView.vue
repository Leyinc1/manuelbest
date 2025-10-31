<template>
  <div class="kanban-view">
    <div v-if="authStore.user">
      <q-card flat bordered class="glass-card q-mb-md">
        <q-card-section class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-6">
            <ProjectSelector />
          </div>
          <div class="col-12 col-md-6 row justify-end q-gutter-sm">
            <q-btn color="primary" icon="sync" label="Recargar" @click="kanbanStore.fetchProjects" />
            <q-btn flat color="secondary" icon="help" label="Tutorial" @click="showTutorial = true" />
          </div>
        </q-card-section>
      </q-card>

      <div v-if="kanbanStore.projects.length > 0" class="kanban-board row q-col-gutter-md">
        <div class="col-12 col-md-6 col-lg-4 col-xl-3">
          <KanbanColumn title="Requerimientos" statusId="requerimientos" :tasks="kanbanStore.tasksByStatus.requerimientos" />
        </div>
        <div class="col-12 col-md-6 col-lg-4 col-xl-3">
          <KanbanColumn title="Por Hacer" statusId="todo" :tasks="kanbanStore.tasksByStatus.todo" />
        </div>
        <div class="col-12 col-md-6 col-lg-4 col-xl-3">
          <KanbanColumn title="En Progreso" statusId="in-progress" :tasks="kanbanStore.tasksByStatus['in-progress']" />
        </div>
        <div class="col-12 col-md-6 col-lg-4 col-xl-3">
          <KanbanColumn title="Testing" statusId="testing" :tasks="kanbanStore.tasksByStatus.testing" />
        </div>
        <div class="col-12 col-md-6 col-lg-4 col-xl-3">
          <KanbanColumn title="Hecho" statusId="done" :tasks="kanbanStore.tasksByStatus.done" />
        </div>
      </div>
      <div v-else class="no-projects">
        <h2>Bienvenido a tu Tablero Kanban</h2>
        <p>Parece que no tienes ningún proyecto. ¡Crea uno para empezar a organizar tus tareas!</p>
      </div>
      <TaskModal />
      <TutorialModal v-if="showTutorial" @close="showTutorial = false" />
    </div>

    <div v-else class="no-projects">
      <h2>Tablero Kanban</h2>
      <p>Por favor, inicia sesión para ver tus proyectos.</p>
      <div class="q-mt-sm">
        <q-btn color="primary" label="Mostrar mock de proyectos" @click="kanbanStore.forceMockProjects" />
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
  padding: 24px;
}

.kanban-board { flex-grow: 1; }

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

.glass-card { background: rgba(255,255,255,0.06); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.15); }
</style>
