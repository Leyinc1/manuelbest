<template>
  <div class="column">
    <div class="column-header">
      <h3>{{ title }} ({{ tasks.length }})</h3>
      <button class="add-task-btn" :data-column="statusId">+</button>
    </div>
    <draggable
      class="card-container"
      :list="tasks"
      group="tasks"
      itemKey="id"
      @change="onDragChange"
    >
      <template #item="{ element }">
        <TaskCard :task="element" />
      </template>
    </draggable>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import TaskCard from './TaskCard.vue'
import { useKanbanStore } from '@/stores/kanbanStore'

const props = defineProps({
  title: String,
  statusId: String,
  tasks: Array,
})

const store = useKanbanStore()

const onDragChange = (event) => {
  if (event.added) {
    const { element } = event.added
    // La tarea fue movida a ESTA columna
    store.updateTaskStatus(element.id, props.statusId)
  }
}
</script>
