<template>
  <div class="user-status">
    <div v-if="authStore.user" class="user-info">
      <span>Bienvenido, {{ authStore.user.email }}</span>
      <button class="btn btn-secondary" @click="authStore.logout()">Cerrar Sesión</button>
    </div>
    <div v-else class="login-actions">
      <button class="btn btn-primary" @click="authStore.login()">Iniciar Sesión</button>
      <button class="btn btn-secondary" @click="authStore.signup()">Registrarse</button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
</script>

<style scoped>
.user-status {
  text-align: center;
  padding: 10px 0;
}

.user-info, .login-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

.user-info span {
    font-weight: 500;
}

</style>