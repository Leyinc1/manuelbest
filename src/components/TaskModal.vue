<template>
  <q-dialog v-model="dialogOpen" persistent>
    <q-card style="min-width: 380px; max-width: 600px;" class="glass-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ kanbanStore.isEditing ? 'Editar Tarea' : 'Crear Nueva Tarea' }}</div>
        <q-space />
        <q-btn flat round dense icon="close" @click="kanbanStore.closeModal()" />
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="saveTask" class="q-gutter-md">
          <input type="hidden" v-model="formData.id" />
          <input type="hidden" v-model="formData.status" />

          <q-input v-model="formData.content" label="Título de la Tarea" filled autofocus :rules="[v=>!!v || 'Requerido']"/>
          <q-input v-model="formData.description" type="textarea" autogrow label="Descripción" filled />
          <q-input v-model="formData.assigned_to" label="Asignado a" filled />

          <div>
            <div class="text-caption text-grey-5 q-mb-xs">Etiquetas</div>
            <div class="row q-col-gutter-sm">
              <div v-for="tag in kanbanStore.availableTags" :key="tag" class="col-auto">
                <q-checkbox v-model="formData.tags" :val="tag" :label="tag" color="primary" dense />
              </div>
            </div>
          </div>

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="Cancelar" color="secondary" @click="kanbanStore.closeModal()" />
            <q-btn color="primary" type="submit" :label="kanbanStore.isEditing ? 'Guardar Cambios' : 'Crear Tarea'" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useKanbanStore } from '@/stores/kanbanStore'

const kanbanStore = useKanbanStore()

const formData = ref({
  id: null,
  content: '',
  description: '',
  assigned_to: '',
  tags: [],
  status: '',
})

const dialogOpen = computed({
  get: () => kanbanStore.isModalOpen,
  set: (v) => v ? null : kanbanStore.closeModal()
})

watch(
  () => kanbanStore.editingTask,
  (task) => {
    if (task) {
      // Copia los datos de la tarea que el store nos pasa
      formData.value = { ...task }
    }
  },
  {
    deep: true, // Importante para observar cambios dentro del objeto
    immediate: true,
  },
)

const saveTask = () => {
  // Validamos que el título no esté vacío
  if (!formData.value.content || !formData.value.content.trim()) return

  if (kanbanStore.isEditing) {
    // Si estamos editando, llamamos a la acción de actualizar
    kanbanStore.updateTask(formData.value)
  } else {
    // Si estamos creando, llamamos a la acción de crear
    kanbanStore.createTask(formData.value)
  }
  // Al terminar, cerramos el modal
  kanbanStore.closeModal()
}
</script>
