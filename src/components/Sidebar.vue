<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <img src="/src/assets/yo.jpeg" alt="Foto de Manuel Ipenza Negri" class="profile-pic" />
      <h1>Manuel Ipenza Negri</h1>
      <p class="job-title">Desarrollador FullStack</p>
      <hr />
      <nav class="sidebar-nav">
        <RouterLink to="/" class="nav-button">Inicio</RouterLink>
        <RouterLink to="/objetivo" class="nav-button">Objetivo</RouterLink>
        <RouterLink to="/tecnologias" class="nav-button">Tecnologías</RouterLink>
        <RouterLink to="/proyectos" class="nav-button">Proyectos</RouterLink>
        <RouterLink to="/intereses" class="nav-button">Intereses</RouterLink>
      </nav>
      <hr />
      <div class="contact-info">
        <h2>Contacto</h2>
        <p><a href="mailto:manuelipenza@manuel.best">manuelipenza@manuel.best</a></p>
        <p><a href="https://github.com/Leyinc1" target="_blank">GitHub | Leyinc1</a></p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
/* Aquí irán los estilos específicos de la barra lateral */
.sidebar {
  width: 280px;
  /* ... más estilos ... */
}
.nav-button {
  display: block;
  padding: 10px 15px;
  margin: 5px 0;
  text-decoration: none;
  color: #333;
  border-radius: 5px;
}
.router-link-active {
  background-color: #007bff;
  color: white;
}
</style>
