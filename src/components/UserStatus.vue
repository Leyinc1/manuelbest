<template>
  <div class="user-status">
    <div v-if="authStore.isAuthenticated && authStore.user" class="user-info">
      <span>Bienvenido, {{ authStore.user.email }}</span>
      <button class="btn btn-secondary" @click="authStore.logout()">Cerrar Sesión</button>
    </div>
    <div v-else class="login-actions">
      <RouterLink to="/login" class="btn btn-primary">Iniciar Sesión / Registrarse</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { RouterLink } from 'vue-router';
const authStore = useAuthStore();
</script>

<style scoped>
.user-status {
  text-align: center;
  padding: 10px 0;
  width: 100%;
}

.user-info,
.login-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.user-info span {
  font-weight: 500;
  word-break: break-all;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
    padding: 8px 15px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
}
</style>