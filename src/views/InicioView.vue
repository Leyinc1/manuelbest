<template>
  <section id="inicio" class="view-card content-section active">
    <h2>Inicio / Páginas de Interés</h2>
    <ul class="link-list">
      <li class="indice">
        <RouterLink to="/qr">QR GENERATOR</RouterLink> - Generador de códigos QR sencillo y rápido.
      </li>
      <li class="texto-pequeño">Introduce texto, enlace o información y genera un QR para compartir o descargar.</li>

      <li class="indice">
        <RouterLink to="/pomodoro">Pomodoro</RouterLink> - Reloj Pomodoro para sesiones de estudio y
        trabajo.
      </li>
      <li class="texto-pequeño">Proximamente: Totalmente personalizable.</li>
      <li class="indice">
        <RouterLink to="/tetris">Juego Tetris</RouterLink> - Ultima versión del Juego Tetris de Manuel.best. (EN REPARACIÓN)
      </li>
    </ul>

  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
