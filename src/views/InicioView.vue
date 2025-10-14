<template>
  <section id="inicio" class="view-card content-section active">
    <h2>Inicio / Páginas de Interés</h2>
    <ul class="link-list">
      <li class="indice">
        <RouterLink to="/kanban">Tablero Kanban</RouterLink> - Ultima versión del tablero Kanban de
        Manuel.Best (EN REPARACIÓN)
      </li>
      <li class="texto-pequeño">
        Tablero Kanban totalmente funcional, recuerda inciar sesión o registrarte para poder usarlo
        o recibir invitaciones.
      </li>
      <li class="texto-pequeño">
        Actualmente en la versión 6.0, ya no es necesario recargar la pagina para ver los cambios.
      </li>
      <li class="texto-pequeño">Click en el boton de "?" para ver tutorial.</li>

      <li class="indice">
        <RouterLink to="/calendario">Horario Interactivo</RouterLink> - Ultima versión del
        calendario Drag and Drop de Manuel.Best (EN REPARACIÓN)
      </li>
      <li class="texto-pequeño">
        Calendario personal totalmente funcional, recuerda iniciar sesión o registrarte para poder
        usarlo!
      </li>
      <li class="texto-pequeño">No olvides guardar tu horario!</li>
      <li class="texto-pequeño">Proximamente: Colores personalizados</li>
      <li class="indice">
        <RouterLink to="/pomodoro">Pomodoro</RouterLink> - Reloj Pomodoro para sesiones de estudio y
        trabajo.
      </li>
      <li class="texto-pequeño">Proximamente: Totalmente personalizable.</li>
      <li class="indice">
        <RouterLink to="/tetris">Juego Tetris</RouterLink> - Ultima versión del Juego Tetris de Manuel.best.
      </li>
    </ul>

  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
