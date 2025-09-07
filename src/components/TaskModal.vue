<template>
  <div v-if="kanbanStore.isModalOpen" class="modal-overlay" @click="kanbanStore.closeModal()">
    <div class="modal-content" @click.stop>
      <button class="modal-close-btn" @click="kanbanStore.closeModal()">&times;</button>
      <h2 id="modal-title">{{ kanbanStore.isEditing ? 'Editar Tarea' : 'Crear Nueva Tarea' }}</h2>

      <form id="task-form" @submit.prevent="saveTask">
        <input type="hidden" id="task-id-input" v-model="formData.id" />
        <input type="hidden" id="task-status-input" v-model="formData.status" />

        <div class="form-group">
          <label for="task-content-input">Título de la Tarea</label>
          <input type="text" id="task-content-input" v-model="formData.content" required />
        </div>

        <div class="form-group">
          <label for="task-description-input">Descripción</label>
          <textarea id="task-description-input" v-model="formData.description"></textarea>
        </div>

        <div class="form-group">
          <label for="task-assigned-input">Asignado a</label>
          <input type="text" id="task-assigned-input" v-model="formData.assigned_to" />
        </div>

        <div class="form-group">
          <label>Etiquetas</label>
          <div id="task-tags-container">
            <div v-for="tag in kanbanStore.availableTags" :key="tag" class="tag-checkbox">
              <input type="checkbox" :id="`tag-${tag}`" :value="tag" v-model="formData.tags" />
              <label :for="`tag-${tag}`">{{ tag }}</label>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="modal-save-btn">
            {{ kanbanStore.isEditing ? 'Guardar Cambios' : 'Crear Tarea' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useKanbanStore } from '@/stores/kanbanStore'

const kanbanStore = useKanbanStore()

// Estado local para el formulario
const formData = ref({
  id: null,
  content: '',
  description: '',
  assigned_to: '',
  tags: [],
  status: '',
})

// 'watch' es una función de Vue que observa cambios.
// Aquí, observamos la tarea que se está editando en el store.
watch(
  () => kanbanStore.editingTask,
  (newTask) => {
    if (newTask) {
      // Si hay una tarea para editar, llenamos el formulario
      formData.value = { ...newTask }
    } else {
      // Si no, lo reseteamos
      formData.value = {
        id: null,
        content: '',
        description: '',
        assigned_to: '',
        tags: [],
        status: '',
      }
    }
  },
)

const saveTask = () => {
  if (kanbanStore.isEditing) {
    // Lógica para actualizar (la añadiremos al store después)
  } else {
    // Lógica para crear (la añadiremos al store después)
  }
  kanbanStore.closeModal()
}
</script>
