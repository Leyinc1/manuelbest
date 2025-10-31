<template>
  <q-card flat bordered class="task-card" :class="`border-${statusId}`" @click.stop="kanbanStore.openModalForEdit(task)">
    <q-card-section v-if="task.tags && task.tags.length" class="q-pt-sm q-pb-none">
      <div class="row q-col-gutter-xs">
        <div v-for="tag in task.tags" :key="tag" class="col-auto">
          <q-chip dense square :class="`chip-${tag.toLowerCase().replace(/\\s+/g, '-')}`" text-color="white">
            {{ tag }}
          </q-chip>
        </div>
      </div>
    </q-card-section>
    <q-card-section>
      <div class="text-subtitle1 text-weight-medium">{{ task.content }}</div>
      <div v-if="task.assigned_to" class="text-caption q-mt-xs text-grey-5 flex items-center">
        <q-icon name="person" size="16px" class="q-mr-xs" /> {{ task.assigned_to }}
      </div>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat dense round icon="edit" color="primary" @click.stop="kanbanStore.openModalForEdit(task)" />
      <q-btn flat dense round icon="delete" color="negative" @click.stop="kanbanStore.deleteTask(task.id)" />
    </q-card-actions>
  </q-card>
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
.task-card {
  position: relative;
  margin-bottom: 12px;
  cursor: grab;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border-left: 5px solid transparent; /* Borde para dar color */
  font-weight: 500;
}
.task-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18);
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

.task-card span {
  display: block;
  margin-right: 50px; /* Espacio para los botones */
  word-wrap: break-word;
}

.task-card .delete-btn,
.task-card .edit-btn {
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

.task-card:hover .delete-btn,
.task-card:hover .edit-btn {
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
.tag-bug, .chip-bug {
  background-color: #d62828;
}
.tag-mejora, .chip-mejora {
  background-color: #0077b6;
}
.tag-urgente, .chip-urgente {
  background-color: #fca311;
}
.tag-marketing, .chip-marketing {
  background-color: #9b5de5;
}
.tag-diseño, .chip-diseño {
  background-color: #f15bb5;
}
.tag-default, .chip-default {
  background-color: #6c757d;
} /* Color por defecto */
</style>
