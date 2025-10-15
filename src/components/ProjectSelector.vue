<template>
  <div class="project-selector">
    <select
      v-model="kanbanStore.currentProjectId"
      @change="onProjectChange"
      :disabled="!kanbanStore.projects.length"
    >
      <option v-if="!kanbanStore.projects.length" disabled value="">
        Crea un proyecto para empezar
      </option>
      <option v-for="project in kanbanStore.projects" :key="project.id" :value="project.id">
        {{ project.name }}
      </option>
    </select>
    <button class="btn btn-success" @click="kanbanStore.createProject">Proyecto Nuevo</button>
    <button
      class="btn btn-danger"
      :disabled="!kanbanStore.currentProjectId"
      @click="kanbanStore.deleteProject"
    >
      Eliminar
    </button>
    <button
      class="btn btn-primary"
      :disabled="!kanbanStore.currentProjectId"
      @click="kanbanStore.shareProject"
    >
      Compartir
    </button>

    <!-- DEBUG: muestra proyectos y proyecto actual (quitar en producción) -->
    <div style="margin-top:8px;font-size:0.85rem;color:#666">
      <div><strong>Debug projects:</strong></div>
      <pre style="white-space:pre-wrap">{{ JSON.stringify(kanbanStore.projects, null, 2) }}</pre>
      <div><strong>Selected project id:</strong> {{ kanbanStore.currentProjectId }}</div>
    </div>
  </div>
</template>

<script setup>
import { useKanbanStore } from '@/stores/kanbanStore'

const kanbanStore = useKanbanStore()

const onProjectChange = (event) => {
  // event may be undefined when v-model updates; use the store value
  const newId = event?.target?.value ?? kanbanStore.currentProjectId
  console.debug('[ProjectSelector] project change ->', newId)
  kanbanStore.selectProject(newId)
}
</script>
