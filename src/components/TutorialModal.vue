<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <button class="modal-close-btn" @click="close">&times;</button>

      <div class="slides-container">
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="slide"
          :class="{ active: currentSlide === index }"
        >
          <h2>{{ slide.title }}</h2>
          <p>{{ slide.content }}</p>
        </div>
      </div>

      <div class="slide-controls">
        <button
          id="prevBtn"
          @click="prev"
          :style="{ display: currentSlide === 0 ? 'none' : 'inline-block' }"
        >
          Anterior
        </button>
        <button
          id="nextBtn"
          @click="next"
          :style="{ display: currentSlide === slides.length - 1 ? 'none' : 'inline-block' }"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close'])
const close = () => emit('close')

const currentSlide = ref(0)
const slides = ref([
  {
    title: 'Bienvenido al Tutorial',
    content: 'Aprende a usar este tablero Kanban en pocos pasos.',
  },
  {
    title: 'Paso 1: Registrarse/Iniciar Sesión',
    content:
      'Haz clic en Iniciar Sesión y registrate en "Sign up". Ingresa tus datos y confirma tu cuenta. Luego inicia sesión y estarás listo para crear proyectos y recibir invitaciones.',
  },
  {
    title: 'Paso 2: Añadir Tareas',
    content:
      'Para añadir una tarea ve al boton "+", no olvides describirla y asignarle un colaborador. También puedes ponerle Tags a las tareas.',
  },
  {
    title: '¡Listo!',
    content:
      'Ya sabes lo básico. ¡Ahora a organizar tu trabajo!. Crea un proyecto e invita a tus colaboradores (deben tener una cuenta antes de invitarlos).',
  },
])

const next = () => {
  if (currentSlide.value < slides.value.length - 1) currentSlide.value++
}
const prev = () => {
  if (currentSlide.value > 0) currentSlide.value--
}
</script>
