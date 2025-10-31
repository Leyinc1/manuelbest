<template>
  <q-layout view="hHh lpR fFf" class="app-layout" :class="[{ 'reduce-effects': reduceEffects }, { 'paused-anim': pausedAnim }]">
    <!-- Decorative animated background -->
    <div class="bg-decor">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
      <div class="grid-overlay"></div>
    </div>
    <q-header elevated class="header-gradient text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" aria-label="Abrir menú" />
        <q-toolbar-title>Manuel Best</q-toolbar-title>
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
const reduceEffects = ref(false)
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
</script>

<style>
/* --- VARIABLES Y ESTILOS GLOBALES --- */
:root {
  --bg-dark: #0b1020;
  --bg-light: #0f1427;
  --card-bg: rgba(255,255,255,0.08);
  --primary-color: #7C4DFF; /* indigo accent */
  --text-dark: #e2e8f0;
  --text-light: #f8fafc;
  --border-color: rgba(255,255,255,0.18);
  --accent-1: #D946EF; /* fuchsia */
  --accent-2: #22D3EE; /* cyan */
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Lato', sans-serif;
  margin: 0;
  line-height: 1.6;
  background: radial-gradient(1200px 800px at 10% 10%, rgba(124,77,255,0.25), transparent 60%),
              radial-gradient(800px 600px at 90% 20%, rgba(34,211,238,0.18), transparent 60%),
              linear-gradient(180deg, var(--bg-light) 0%, #0a0f1f 100%);
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
.bg-decor { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.bg-decor .blob { position: absolute; filter: blur(24px); opacity: 0.5; mix-blend-mode: screen; will-change: transform; transform: translateZ(0); }
.bg-decor .b1 { width: 40vw; height: 40vw; top: -10vw; left: -10vw; background: radial-gradient(circle, rgba(124,77,255,0.6), transparent 60%); animation: float1 18s ease-in-out infinite alternate; }
.bg-decor .b2 { width: 35vw; height: 35vw; bottom: -10vw; right: -10vw; background: radial-gradient(circle, rgba(217,70,239,0.5), transparent 60%); animation: float2 22s ease-in-out infinite alternate; }
.bg-decor .grid-overlay { position: absolute; inset: 0; background:
  radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0) 0 0/26px 26px; opacity: 0.3; }

@keyframes float1 { from { transform: translateY(0) } to { transform: translateY(30px) } }
@keyframes float2 { from { transform: translateY(0) } to { transform: translateY(-30px) } }

/* --- Header Gradient --- */
.header-gradient { background: linear-gradient(90deg, #7C4DFF, #D946EF, #22D3EE); background-size: 200% 200%; animation: hueShift 18s ease infinite; will-change: background-position; }
@keyframes hueShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

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
  border: 5px solid var(--primary-color);
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
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  margin-bottom: 30px;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

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
.fade-slide-enter-active, .fade-slide-leave-active { transition: all .28s ease; will-change: transform, opacity; }
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
