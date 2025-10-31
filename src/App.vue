<template>
  <q-layout view="hHh lpR fFf" class="app-layout" :class="[{ 'reduce-effects': reduceEffects }, { 'paused-anim': pausedAnim }]">
    <q-header elevated class="header-gradient text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" aria-label="Abrir menú" />
        <q-toolbar-title>Manuel Best</q-toolbar-title>
        <q-space />
        <q-btn flat round dense :icon="reduceEffects ? 'bolt' : 'bolt'" :color="reduceEffects ? 'cyan' : 'blue'" @click="togglePerformance()">
          <q-tooltip>Modo rendimiento: {{ reduceEffects ? 'Activado' : 'Desactivado' }}</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above side="left" bordered :width="280">
      <!-- Reuse existing Sidebar content inside the drawer -->
      <Sidebar />
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <transition name="fade-slide" mode="out-in">
          <RouterView />
        </transition>
      </q-page>
    </q-page-container>
  </q-layout>

</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from './components/AppSidebar.vue'
import { useAuthStore } from './stores/authStore'

const authStore = useAuthStore()
const leftDrawerOpen = ref(true)
// Por defecto activamos modo rendimiento (usuario reporta lentitud)
const reduceEffects = ref(true)
const pausedAnim = ref(false)

onMounted(() => {
  authStore.tryAutoLogin()

  // Detect low-power or user preference and reduce heavy effects
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const decideReduce = () => {
    const lowThreads = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    const lowMem = (navigator.deviceMemory && navigator.deviceMemory <= 4)
    reduceEffects.value = mq.matches || lowThreads || lowMem
  }
  decideReduce()
  mq.addEventListener?.('change', decideReduce)

  // Pause animations when tab is not visible to avoid background GPU/CPU usage
  const updatePaused = () => { pausedAnim.value = document.hidden }
  document.addEventListener('visibilitychange', updatePaused)
  updatePaused()
})

function togglePerformance() {
  reduceEffects.value = !reduceEffects.value
}
</script>

<style>
/* --- VARIABLES Y ESTILOS GLOBALES --- */
:root {
  --bg-dark: #060914; /* casi negro azulado */
  --bg-light: #0b1222; /* azul muy oscuro */
  --card-bg: rgba(17, 24, 39, 0.6); /* slate/azul translúcido */
  --primary-color: #1E3A8A; /* blue-800 */
  --text-dark: #e2e8f0;
  --text-light: #f8fafc;
  --border-color: rgba(255,255,255,0.12);
  --accent-1: #2563EB; /* blue-600 */
  --accent-2: #06B6D4; /* cyan-500 */
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Lato', sans-serif;
  margin: 0;
  line-height: 1.6;
  background:
    radial-gradient(900px 600px at 15% 10%, rgba(37,99,235,0.12), transparent 60%),
    radial-gradient(700px 500px at 85% 20%, rgba(6,182,212,0.10), transparent 60%),
    linear-gradient(180deg, var(--bg-light) 0%, #060a16 100%);
  color: var(--text-dark);
}

a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: #2980b9;
}

hr {
  border: none;
  border-top: 1px solid var(--border-color);
  opacity: 0.3;
  margin: 20px 0;
}

/* --- Decorative Background Layers --- */
.app-layout { position: relative; overflow: hidden; }
/* Eliminamos blobs animados por rendimiento */
.bg-decor, .bg-decor * { display: none !important; }

@keyframes float1 { from { transform: translateY(0) } to { transform: translateY(30px) } }
@keyframes float2 { from { transform: translateY(0) } to { transform: translateY(-30px) } }

/* --- Header Gradient (estático, azul) --- */
.header-gradient { background: linear-gradient(90deg, #0b1222, #1E3A8A, #2563EB); background-size: 100% 100%; }

/* --- BARRA LATERAL --- */
.sidebar {
  width: 100%;
  background-color: var(--bg-dark);
  color: var(--text-light);
  padding: 24px 16px;
  position: relative;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.sidebar-content h1 {
  margin-bottom: 5px;
  font-size: 2em;
  color: var(--text-light);
}

.sidebar-content .job-title {
  margin-top: 0;
  font-size: 1.2em;
  color: var(--primary-color);
  font-weight: bold;
}

.profile-pic {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid var(--accent-1);
  object-fit: cover;
  margin-bottom: 20px;
}

/* --- Menú de Navegación de la Barra Lateral --- */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
}

.nav-button {
  color: var(--text-light);
  background-color: transparent;
  border: 2px solid transparent;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  font-size: 1.1em;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.nav-button:hover {
  background-color: rgba(236, 240, 241, 0.1);
  color: var(--text-light);
}

/* Estilo para el botón activo */
.nav-button.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.contact-info a {
  color: var(--text-light);
}

/* --- CONTENIDO PRINCIPAL --- */
.main-content { display: block }

.main-content h2 {
  color: var(--text-dark);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 10px;
  margin-top: 0;
}

/* --- TARJETAS DE CONTENIDO (Cards) --- */
.view-card {
  background: var(--card-bg);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22);
  margin-bottom: 30px;
  border: 1px solid var(--border-color);
  /* quitamos blur por rendimiento */
  backdrop-filter: none;
  -webkit-backdrop-filter: none;

  /* Por defecto, las tarjetas están ocultas */
  display: none;
}

/* La clase 'active' hace visible la tarjeta y le añade la animación */
.view-card.active {
  display: block;
  animation: fadeIn 0.5s ease-out forwards;
}

/* --- LISTA DE TECNOLOGÍAS --- */
.tech-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tech-list li {
  background-color: var(--bg-light);
  color: var(--text-dark);
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: bold;
}

/* --- Lista de Enlaces --- */
.link-list {
  list-style: none;
  padding: 0;
}

.link-list li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.link-list li:last-child {
  border-bottom: none;
}

/* --- ANIMACIÓN KEYFRAMES --- */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- Page transition --- */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all .2s ease; will-change: transform, opacity; }
.fade-slide-enter-from { opacity: 0; transform: translateY(8px); }
.fade-slide-leave-to   { opacity: 0; transform: translateY(-8px); }

/* --- DISEÑO RESPONSIVO (Sin cambios, sigue siendo importante) --- */
@media (max-width: 992px) { .main-content { width: 100%; padding: 20px; } }
.indice {
  font-size: 30px;
}
.texto-pequeno {
  font-size: 12px;
}
.projects-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px; /* Espacio entre las tarjetas */
  margin-top: 20px;
}

/* ==============================================
--- CÓDIGO RESPONSIVO (MEJORADO PARA BARRA) ---
==============================================
*/
@media (max-width: 992px) {
  /* --- CAMBIOS AL LAYOUT PRINCIPAL --- */
  .portfolio-container {
    flex-direction: column; /* Apila la barra lateral y el contenido */
  }

  .sidebar {
    position: static; /* dentro del drawer, no fija */
    width: 100%;
    height: auto;
    padding: 16px;
    /* IMPORTANTE: Centra el texto y el contenido cuando está apilado */
    justify-content: center;
    align-items: center;
  }

  /* Ajuste para el contenido dentro de la barra lateral para centrarlo */
  .sidebar-content {
    position: static; /* Quita el 'sticky' para el modo móvil */
    display: flex; /* Convierte el contenido en flexbox */
    flex-direction: column; /* Lo apila */
    align-items: center; /* Centra los ítems */
    width: 100%; /* Asegura que ocupe el ancho disponible */
  }

  .main-content {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }

  /* --- AJUSTES ESPECÍFICOS PARA LA NAVEGACIÓN EN MÓVIL --- */
  .sidebar-nav {
    flex-direction: row; /* Pone los botones en fila */
    flex-wrap: nowrap; /* Evita que los botones salten de línea */
    overflow-x: auto; /* ¡Permite hacer scroll horizontal si no caben! */
    -webkit-overflow-scrolling: touch; /* Mejora el scroll en iOS */
    padding: 10px 0;
    justify-content: flex-start; /* Alinea los botones al inicio */
    gap: 10px; /* Asegura un espacio entre ellos */
    width: 100%; /* Ocupa todo el ancho disponible */
  }

  .nav-button {
    flex-shrink: 0; /* ¡MUY IMPORTANTE! Evita que los botones se encojan */
    min-width: fit-content; /* Permite que el botón sea tan ancho como su texto */
    padding: 8px 15px; /* Ajusta el padding para que no sean tan grandes */
    font-size: 0.9em; /* Reduce el tamaño de la fuente si es necesario */
  }

  /* --- AJUSTES A LA CUADRÍCULA DE PROYECTOS --- */
  .projects-grid .card {
    width: 100%; /* Cada proyecto ocupa una fila completa */
  }

  /* Ajustes para el texto dentro de la barra lateral */
  .sidebar h1 {
    font-size: 1.8em; /* Ajusta tamaño del nombre */
  }
  .sidebar .job-title {
    font-size: 1em; /* Ajusta tamaño del título */
  }
}

/* Reduce motion for users who prefer it and to improve perf on low-end devices */
@media (prefers-reduced-motion: reduce) {
  .bg-decor .blob { animation: none !important; }
  .header-gradient { animation: none !important; }
  .fade-slide-enter-active, .fade-slide-leave-active { transition: none !important; }
}

/* App-level performance modes */
.reduce-effects .bg-decor .blob { display: none; }
.reduce-effects .grid-overlay { opacity: 0.15; }
.reduce-effects .header-gradient { animation: none !important; }
.reduce-effects .view-card { backdrop-filter: none; -webkit-backdrop-filter: none; background: rgba(255,255,255,0.06); box-shadow: 0 6px 16px rgba(0,0,0,0.18); }
.paused-anim .bg-decor .blob { animation: none !important; }
.paused-anim .header-gradient { animation: none !important; }

.main-content {
  flex-grow: 1;
  padding: 2rem;
}
</style>
