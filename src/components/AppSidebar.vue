<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <q-img :src="photoSrc" alt="Foto de Manuel Ipenza Negri" class="profile-pic" ratio="1" fit="cover" loading="lazy" decoding="async" spinner-color="primary">
        <template #error>
          <div class="profile-fallback">
            <q-avatar size="120px" color="primary" text-color="white" icon="person" />
            <div class="text-caption q-mt-sm">Coloca tu foto en <code>src/assets/yo.jpeg</code></div>
          </div>
        </template>
      </q-img>
      <h1>Manuel Ipenza Negri</h1>
      <p class="job-title">Desarrollador FullStack</p>
      <hr />
      <q-list padding class="q-mt-sm">
        <q-item clickable v-ripple to="/" exact>
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/objetivo">
          <q-item-section avatar><q-icon name="flag" /></q-item-section>
          <q-item-section>Objetivo</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/tecnologias">
          <q-item-section avatar><q-icon name="widgets" /></q-item-section>
          <q-item-section>Tecnologías</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/proyectos">
          <q-item-section avatar><q-icon name="work" /></q-item-section>
          <q-item-section>Proyectos</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/intereses">
          <q-item-section avatar><q-icon name="favorite" /></q-item-section>
          <q-item-section>Intereses</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/Perfiles">
          <q-item-section avatar><q-icon name="groups" /></q-item-section>
          <q-item-section>Perfiles Recomendados</q-item-section>
        </q-item>
      </q-list>
      <hr />
      <UserStatus />
      <hr />
      <div class="contact-info">
        <h2>Contacto</h2>
        <p><a href="mailto:manuelipenza@manuel.best">manuelipenza@manuel.best</a></p>
        <p><a href="https://github.com/Leyinc1" target="_blank" rel="noopener noreferrer">GitHub | Leyinc1</a></p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import UserStatus from './UserStatus.vue'
import { computed } from 'vue'
import profileImg from '@/assets/yo.jpeg'

// Usamos la imagen desde assets para que Vite la procese correctamente
const photoSrc = computed(() => profileImg)
</script>

<style scoped>
.profile-pic {
  width: 100%;
  max-width: 200px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid var(--primary-color);
  margin: 0 auto 20px;
}
.profile-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 12px;
}
@media (max-width: 992px) {
  .profile-pic { max-width: 140px; }
}
</style>
