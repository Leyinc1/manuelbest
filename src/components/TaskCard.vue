<template>
  <div class="card" :class="`border-${statusId}`" @click.stop="kanbanStore.openModalForEdit(task)">
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

defineProps({
  task: {
    type: Object,
    required: true,
  },
  statusId: {
    type: String,
    required: true,
  },
})

const kanbanStore = useKanbanStore()
</script>

<style scoped>
.card {
  position: relative;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: grab;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border-left: 5px solid transparent; /* Borde para dar color */
  font-weight: 500;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
}

/* Colores del borde izquierdo según la columna */
.border-requerimientos {
  border-left-color: #6a0dad;
}
.border-todo {
  border-left-color: #0077b6;
}
.border-in-progress {
  border-left-color: #fca311;
}
.border-testing {
  border-left-color: #e63946;
}
.border-done {
  border-left-color: #2a9d8f;
}

.dragging {
  opacity: 0.5;
  transform: rotate(3deg);
}

.card span {
  display: block;
  margin-right: 50px; /* Espacio para los botones */
  word-wrap: break-word;
}

.card .delete-btn,
.card .edit-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #adb5bd;
  font-size: 16px;
  opacity: 0;
  transition:
    opacity 0.2s,
    color 0.2s;
}

.card:hover .delete-btn,
.card:hover .edit-btn {
  opacity: 1;
}

.card .delete-btn {
  right: 10px;
}
.card .edit-btn {
  right: 40px;
}

.delete-btn:hover {
  color: #e63946;
}
.edit-btn:hover {
  color: #0077b6;
}

.assigned-person {
  font-size: 0.8rem;
  font-weight: 400;
  color: #6c757d;
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.assigned-person::before {
  content: '👤'; /* Icono de persona */
  margin-right: 8px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px; /* Espacio antes del título */
}

.tag {
  padding: 3px 10px;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 12px;
  color: #fff;
}

/* Colores predefinidos para etiquetas comunes */
.tag-bug {
  background-color: #d62828;
}
.tag-mejora {
  background-color: #0077b6;
}
.tag-urgente {
  background-color: #fca311;
}
.tag-marketing {
  background-color: #9b5de5;
}
.tag-diseño {
  background-color: #f15bb5;
}
.tag-default {
  background-color: #6c757d;
} /* Color por defecto */
</style>