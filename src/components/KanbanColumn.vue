<template>
  <div class="column">
    <div class="column-header">
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
        <TaskCard :task="element" />
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
