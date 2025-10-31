<template>
  <q-card flat bordered class="kanban-col">
    <div class="column-header" :class="`header-${statusId}`">
      <div class="row items-center no-wrap q-px-md q-py-sm">
        <div class="col text-white text-weight-medium">{{ title }}</div>
        <div class="col-auto"><q-badge color="white" text-color="dark">{{ tasks.length }}</q-badge></div>
      </div>
    </div>
    <q-separator inset />
    <div class="q-pa-md">
      <draggable
        class="card-container"
        :list="tasks"
        group="tasks"
        itemKey="id"
        @change="onDragChange"
      >
        <template #item="{ element }">
          <TaskCard :task="element" :status-id="statusId" />
        </template>
      </draggable>
      <div class="q-mt-md flex">
        <q-btn class="full-width" color="secondary" icon="add" label="Añadir tarea" @click="kanbanStore.openModalForNew(statusId)" />
      </div>
    </div>
  </q-card>
</template>

<script setup>
// El script de este archivo se mantiene igual, no es necesario cambiarlo
import draggable from 'vuedraggable'
import TaskCard from './TaskCard.vue'
import { useKanbanStore } from '@/stores/kanbanStore'

const props = defineProps({
  title: String,
  statusId: String,
  tasks: Array,
})

const kanbanStore = useKanbanStore()

const onDragChange = (event) => {
  if (event.added) {
    const { element } = event.added
    kanbanStore.updateTaskStatus(element.id, props.statusId)
  }
}
</script>

<style scoped>
.kanban-col { background: rgba(255,255,255,0.06); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15); }

.column-header {
  padding: 15px 20px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #fff;
  border-radius: 12px 12px 0 0;
}

/* Colores para cada cabecera */
.header-requerimientos {
  background-color: #6a0dad;
} /* Púrpura */
.header-todo {
  background-color: #0077b6;
} /* Azul */
.header-in-progress {
  background-color: #fca311;
} /* Naranja */
.header-testing {
  background-color: #e63946;
} /* Rojo */
.header-done {
  background-color: #2a9d8f;
} /* Verde */

.card-container {
  padding: 20px;
  min-height: 400px;
  flex-grow: 1;
}

</style>
