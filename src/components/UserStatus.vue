<template>
  <div class="user-status">
    <div v-if="authStore.user">
      <p>Bienvenido, {{ authStore.user.email }}</p>
      <button @click="authStore.logout()">Cerrar Sesión</button>
    </div>
    <div v-else>
      <button @click="authStore.login()">Iniciar Sesión</button>
      <button @click="authStore.signup()">Registrarse</button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
</script>

<style scoped>
/* Estilos rápidos, ajústalos como quieras */
.user-status {
  text-align: center;
  padding: 10px 0;
}
p {
  font-size: 0.8em;
  margin-bottom: 10px;
}
button {
  margin: 0 5px;
}
</style>
