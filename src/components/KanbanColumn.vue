<template>
  <div class="column" :id="statusId">
    <div class="column-header" :class="`header-${statusId}`">
      <h3>{{ title }} ({{ tasks.length }})</h3>
    </div>
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
    <button class="add-task-btn" @click="kanbanStore.openModalForNew(statusId)">Añadir tarea</button>
  </div>
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
.column {
  background-color: #f1f1f1; /* Un gris muy claro para el fondo de las tarjetas */
  border-radius: 12px;
  width: 300px; /* Ancho fijo para cada columna */
  flex-shrink: 0; /* Evita que las columnas se encojan */
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.column-header {
  padding: 15px 20px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #fff;
  border-radius: 12px 12px 0 0;
  text-align: center;
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

/* --- BOTÓN PARA AÑADIR TAREAS --- */
.add-task-btn {
  width: calc(100% - 40px);
  margin: 0 20px 20px;
  padding: 12px;
  border: none;
  background-color: #e9ecef;
  color: #495057;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  border-radius: 8px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.add-task-btn:hover {
  background-color: #ced4da;
  color: #212529;
}
</style>
