<template>
  <div class="project-selector">
    <select
      :value="store.currentProjectId"
      @change="handleProjectChange"
      :disabled="!store.projects.length"
    >
      <option v-if="!store.projects.length" disabled value="">Crea un proyecto</option>
      <option v-for="project in store.projects" :key="project.id" :value="project.id">
        {{ project.name }}
      </option>
    </select>
    <button id="new-project-btn">Proyecto Nuevo</button>
    <button id="delete-project-btn" :disabled="!store.currentProjectId">Eliminar</button>
    <button id="share-project-btn" :disabled="!store.currentProjectId">Compartir</button>
  </div>
</template>

<script setup>
import { useKanbanStore } from '@/stores/kanbanStore'

const store = useKanbanStore()

const handleProjectChange = (event) => {
  store.selectProject(event.target.value)
}

// Aquí añadiremos la lógica para los botones más adelante
</script>

<style scoped>
/* Estilos para el selector, puedes copiarlos del style.css original */
.project-selector {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 1rem;
}
</style>
