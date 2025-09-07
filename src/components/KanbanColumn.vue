<template>
  <div class="column" :id="statusId">
    <div class="column-header" :class="`header-${statusId}`">
      <h3>{{ title }} ({{ tasks.length }})</h3>
      <button class="add-task-btn" @click="kanbanStore.openModalForNew(statusId)">+</button>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Colores para cada cabecera */
.header-todo {
  background-color: #0077b6;
} /* Azul */
.header-in-progress {
  background-color: #fca311;
} /* Naranja */
.header-done {
  background-color: #2a9d8f;
} /* Verde */

.card-container {
  padding: 20px;
  min-height: 400px;
  flex-grow: 1;
}

.add-task-btn {
  border: none;
  background-color: rgba(255, 255, 255, 0.3);
  color: #fff;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: 500;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  transition: background-color 0.2s;
}

.add-task-btn:hover {
  background-color: rgba(255, 255, 255, 0.5);
}
</style>