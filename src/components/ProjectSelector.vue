<template>
  <div class="project-selector">
    <select
      :value="kanbanStore.currentProjectId"
      @change="handleProjectChange"
      :disabled="!kanbanStore.projects.length"
    >
      <option v-if="!kanbanStore.projects.length" disabled value="">
        Crea un proyecto para empezar
      </option>
      <option v-for="project in kanbanStore.projects" :key="project.id" :value="project.id">
        {{ project.name }}
      </option>
    </select>
    <button id="new-project-btn" @click="kanbanStore.createProject">Proyecto Nuevo</button>
    <button
      id="delete-project-btn"
      :disabled="!kanbanStore.currentProjectId"
      @click="kanbanStore.deleteProject"
    >
      Eliminar
    </button>
    <button
      id="share-project-btn"
      :disabled="!kanbanStore.currentProjectId"
      @click="kanbanStore.shareProject"
    >
      Compartir
    </button>
  </div>
</template>

<script setup>
import { useKanbanStore } from '@/stores/kanbanStore'

const kanbanStore = useKanbanStore()

const handleProjectChange = (event) => {
  kanbanStore.selectProject(event.target.value)
}
</script>
