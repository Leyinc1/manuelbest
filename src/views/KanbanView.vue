<template>
  <div class="kanban-view">
    <div v-if="authStore.user">
      <ProjectSelector />

      <div v-if="kanbanStore.projects.length > 0" class="kanban-board">
        <KanbanColumn title="Por Hacer" statusId="todo" :tasks="kanbanStore.tasksByStatus.todo" />
        <KanbanColumn
          title="En Progreso"
          statusId="in-progress"
          :tasks="kanbanStore.tasksByStatus['in-progress']"
        />
        <KanbanColumn title="Hecho" statusId="done" :tasks="kanbanStore.tasksByStatus.done" />
      </div>
      <div v-else class="no-projects">
        <h2>Bienvenido a tu Tablero Kanban</h2>
        <p>Parece que no tienes ningún proyecto. ¡Crea uno para empezar a organizar tus tareas!</p>
      </div>
    </div>

    <div v-else class="no-projects">
      <h2>Tablero Kanban</h2>
      <p>Por favor, inicia sesión para ver tus proyectos.</p>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useKanbanStore } from '@/stores/kanbanStore'
import { useAuthStore } from '@/stores/authStore'
import ProjectSelector from '@/components/ProjectSelector.vue'
import KanbanColumn from '@/components/KanbanColumn.vue'

const kanbanStore = useKanbanStore()
const authStore = useAuthStore()

// Esta lógica se mantiene, es correcta.
// "Observa" al usuario. Si cambia (login/logout), reacciona.
watch(
  () => authStore.user,
  (newUser) => {
    // Si hay un nuevo usuario (acaba de iniciar sesión o ya estaba logueado al cargar la página)
    // entonces, le pedimos al kanbanStore que cargue los proyectos.
    if (newUser) {
      kanbanStore.fetchProjects()
    } else {
      // Si el usuario cierra sesión (newUser es null), limpiamos el tablero.
      kanbanStore.projects = []
      kanbanStore.tasks = []
      kanbanStore.currentProjectId = null
    }
  },
  { immediate: true },
) // immediate: true hace que se ejecute una vez al cargar
</script>

<style>
/* Pega aquí TODO el contenido de tu archivo Kanban/style.css original */
.kanban-view {
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.kanban-board {
  display: flex;
  gap: 15px;
  flex-grow: 1;
}

.no-projects {
  text-align: center;
  margin-top: 50px;
}
/* --- CONFIGURACIÓN GENERAL --- */
body {
  font-family: 'Poppins', sans-serif;
  background-color: #f8f9fa; /* Un blanco un poco más cálido */
  color: #343a40;
  margin: 0;
  padding: 20px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

h1 {
  text-align: center;
  color: #212529;
  font-weight: 700;
  margin-bottom: 40px;
}

/* --- ESTILOS DEL SELECTOR DE PROYECTOS --- */
.header-container {
  max-width: 1200px; /* Aumentado para dar espacio a las nuevas columnas */
  margin: 0 auto 40px auto;
  text-align: center;
}

.project-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap; /* Para que los botones se ajusten en pantallas pequeñas */
}

#project-dropdown {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  padding: 10px 15px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  min-width: 200px;
}

#new-project-btn,
#share-project-btn,
#delete-project-btn {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

#new-project-btn {
  background-color: #2a9d8f;
}
#new-project-btn:hover {
  background-color: #268a7f;
}

#share-project-btn {
  background-color: #0077b6;
}
#share-project-btn:hover {
  background-color: #005f9c;
}

#delete-project-btn {
  background-color: #e63946;
}
#delete-project-btn:hover {
  background-color: #c12c38;
}

/* --- TABLERO KANBAN --- */
.kanban-board {
  display: flex;
  justify-content: center;
  gap: 20px; /* Reducido para mejor ajuste */
  padding: 20px;
  flex-wrap: nowrap; /* Evita el salto de línea de las columnas */
  overflow-x: auto; /* Permite scroll horizontal si no caben */
}

/* --- COLUMNAS --- */
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
#header-requerimientos {
  background-color: #6a0dad;
} /* Púrpura */
#header-todo {
  background-color: #0077b6;
} /* Azul */
#header-in-progress {
  background-color: #fca311;
} /* Naranja */
#header-testing {
  background-color: #e63946;
} /* Rojo */
#header-terminado {
  background-color: #2a9d8f;
} /* Verde */

.card-container {
  padding: 20px;
  min-height: 400px;
  flex-grow: 1;
}

/* --- TARJETAS --- */
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

/* Añadimos el color del borde izquierdo según la columna */
#requerimientos .card {
  border-left-color: #6a0dad;
}
#todo .card {
  border-left-color: #0077b6;
}
#in-progress .card {
  border-left-color: #fca311;
}
#testing .card {
  border-left-color: #e63946;
}
#terminado .card {
  border-left-color: #2a9d8f;
}

.dragging {
  opacity: 0.5;
  transform: rotate(3deg);
}

/* --- BOTONES EN LAS TARJETAS --- */
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

/* --- ESTILOS PARA LA PERSONA ASIGNADA --- */
.card .assigned-person {
  font-size: 0.8rem;
  font-weight: 400;
  color: #6c757d;
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.card .assigned-person::before {
  content: '👤'; /* Icono de persona */
  margin-right: 8px;
}
/* --- ESTILOS PARA LA MODAL DE TAREAS --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #aaa;
  cursor: pointer;
  line-height: 1;
}

.modal-close-btn:hover {
  color: #333;
}

#task-form .form-group {
  margin-bottom: 20px;
}

#task-form label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #495057;
}

#task-form input[type='text'],
#task-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  box-sizing: border-box; /* Importante para que el padding no afecte el ancho */
}

.modal-save-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background-color: #0077b6; /* Azul */
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s;
}

.modal-save-btn:hover {
  background-color: #005f9c;
}

/* Modificación para que la tarjeta entera sea clickeable */
.card {
  /* ... otros estilos de la tarjeta ... */
  cursor: pointer; /* Cambiamos el cursor para indicar que es clickeable */
}
/* --- ESTILOS PARA LAS ETIQUETAS (TAGS) --- */
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

/* Colores predefinidos para etiquetas comunes (puedes añadir más) */
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

/* --- ESTILOS NUEVOS PARA CHECKBOXES DE TAGS --- */
.tags-checkbox-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tag-checkbox {
  display: flex;
  align-items: center;
}
.tag-checkbox input[type='checkbox'] {
  display: none;
} /* Ocultamos el checkbox real */
.tag-checkbox label {
  padding: 5px 12px;
  border: 1px solid #ced4da;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.tag-checkbox input[type='checkbox']:checked + label {
  background-color: #0077b6;
  color: white;
  border-color: #0077b6;
}

/* --- ESTILOS PARA CONTROLES DE USUARIO --- */
#user-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

#user-greeting {
  font-weight: 500;
  color: #495057;
}

#login-btn,
#logout-btn {
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.2s;
}

#login-btn {
  background-color: #0077b6; /* Azul */
  color: white;
}

#login-btn:hover {
  background-color: #005f9c;
  transform: translateY(-2px);
}

#logout-btn {
  background-color: #6c757d; /* Gris */
  color: white;
}

#logout-btn:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}
#tutorialBtn {
  position: fixed;
  bottom: 30px; /* Un poco más arriba para que no esté pegado al borde */
  right: 30px; /* Un poco más a la izquierda para que no esté pegado al borde */
  width: 70px; /* Más grande */
  height: 70px; /* Más grande */
  border-radius: 50%; /* Asegura que sea un círculo perfecto */
  background-color: #20b2aa; /* Verde marino (LightSeaGreen) */
  color: white;
  border: none;
  font-size: 32px; /* Tamaño del signo de interrogación */
  font-weight: bold; /* Para que el '?' sea más notorio */
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Una sombra más pronunciada */
  display: flex; /* Para centrar el '?' */
  justify-content: center; /* Centrar horizontalmente */
  align-items: center; /* Centrar verticalmente */
  transition:
    background-color 0.3s ease,
    transform 0.3s ease; /* Transición suave para hover */
  z-index: 1000; /* Asegura que el botón esté por encima de otros elementos */
}

#tutorialBtn:hover {
  background-color: #1a938a; /* Un verde marino un poco más oscuro al pasar el ratón */
  transform: scale(1.05); /* Ligeramente más grande al pasar el ratón */
}
.hidden {
  display: none !important;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Más alto que el botón de tutorial */
}

.modal-content {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.modal-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #aaa;
  cursor: pointer;
  line-height: 1;
}

.modal-close-btn:hover {
  color: #333;
}

.slides-container {
  margin-bottom: 30px;
}

.slide {
  display: none; /* Ocultamos todas las diapositivas por defecto */
}

.slide.active {
  display: block; /* Mostramos solo la activa */
}

.slide h2 {
  color: #2a9d8f;
  margin-top: 0;
}

.slide-controls {
  display: flex;
  justify-content: space-between;
}

#prevBtn,
#nextBtn {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  background-color: #f8f9fa;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

#nextBtn {
  background-color: #2a9d8f;
  color: white;
  border-color: #2a9d8f;
}

#prevBtn:hover,
#nextBtn:hover {
  opacity: 0.8;
}

/* --- ESTILOS RESPONSIVOS --- */

/* Para Tablets y pantallas medianas */
@media (max-width: 1600px) {
  .kanban-board {
    justify-content: flex-start;
  }
}

/* Para Tablets */
@media (max-width: 1024px) {
  .column {
    width: 280px;
  }
}

/* Para Móviles */
@media (max-width: 768px) {
  body {
    padding: 10px;
  }
  h1 {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }
  .project-selector {
    flex-direction: column;
    gap: 10px;
  }
  #tutorialBtn {
    width: 60px;
    height: 60px;
    font-size: 28px;
    bottom: 20px;
    right: 20px;
  }
}

@media (max-width: 480px) {
  .project-selector button {
    width: 80%;
  }
  .card-container {
    padding: 15px;
  }
  .modal-content {
    padding: 20px;
  }
  h1 {
    font-size: 1.5rem;
  }
}
</style>
