<template>
  <div class="card" @click.stop="kanbanStore.openModalForEdit(task)">
    <div v-if="task.tags && task.tags.length > 0" class="tags-container">
      <span
        v-for="tag in task.tags"
        :key="tag"
        :class="`tag tag-${tag.toLowerCase().replace(/\s+/g, '-')}`"
      >
        {{ tag }}
      </span>
    </div>

    <span>{{ task.content }}</span>

    <div v-if="task.assigned_to" class="assigned-person">
      {{ task.assigned_to }}
    </div>

    <div class="card-actions">
      <button class="edit-btn" @click.stop="kanbanStore.openModalForEdit(task)">
        <i class="fas fa-pencil-alt"></i>
      </button>
      <button class="delete-btn" @click.stop="kanbanStore.deleteTask(task.id)">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useKanbanStore } from '@/stores/kanbanStore'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const kanbanStore = useKanbanStore()
</script>
