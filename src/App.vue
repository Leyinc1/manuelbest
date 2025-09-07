<template>
  <div class="portfolio-container">
    <Sidebar />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import Sidebar from './components/AppSidebar.vue'
</script>

<style>
/* --- VARIABLES Y ESTILOS GLOBALES --- */
:root {
  --bg-dark: #2c3e50;
  --bg-light: #ecf0f1;
  --card-bg: #ffffff;
  --primary-color: #3498db;
  --text-dark: #34495e;
  --text-light: #ecf0f1;
  --border-color: #bdc3c7;
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Lato', sans-serif;
  margin: 0;
  line-height: 1.6;
  background-color: var(--bg-light);
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

/* --- DISEÑO PRINCIPAL (Layout) --- */
.portfolio-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

/* --- BARRA LATERAL --- */
.sidebar {
  width: 320px;
  background-color: var(--bg-dark);
  color: var(--text-light);
  padding: 40px 20px;
  position: fixed;
  height: 100%;
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
.main-content {
  margin-left: 320px;
  padding: 40px;
  width: calc(100% - 320px);
  display: flex;
  flex-direction: column;
}

.main-content h2 {
  color: var(--text-dark);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 10px;
  margin-top: 0;
}

/* --- TARJETAS DE CONTENIDO (Cards) --- */
.card {
  background-color: var(--card-bg);
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;

  /* Por defecto, las tarjetas están ocultas */
  display: none;
}

/* La clase 'active' hace visible la tarjeta y le añade la animación */
.card.active {
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

/* --- DISEÑO RESPONSIVO (Sin cambios, sigue siendo importante) --- */
@media (max-width: 992px) {
  .portfolio-container {
    flex-direction: column;
  }
  .sidebar {
    position: static;
    width: 100%;
    height: auto;
    padding-bottom: 20px;
  }
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 10px 0;
  }
  .nav-button {
    flex-shrink: 0;
  }
  .main-content {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }
}
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
    position: static; /* La barra deja de estar fija */
    width: 100%;
    height: auto;
    padding: 20px;
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

.main-content {
  flex-grow: 1;
  padding: 2rem;
}
</style>
