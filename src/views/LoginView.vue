
<template>
  <div class="auth-container">
    <div class="auth-form q-pa-md q-gutter-md">
      <div class="text-h5">{{ isLogin ? 'Iniciar Sesión' : 'Registro' }}</div>
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <q-input type="email" v-model="email" label="Email" filled dense required />
        <q-input type="password" v-model="password" label="Contraseña" filled dense required />
        <div class="row q-gutter-sm">
          <q-btn color="primary" type="submit" :label="isLogin ? 'Login' : 'Register'" />
          <q-btn flat color="primary" :label="isLogin ? 'Registrarse' : 'Iniciar sesión'" @click="toggleForm" />
        </div>
      </q-form>
    </div>
  </div>

</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const isLogin = ref(true);
const email = ref('');
const password = ref('');

const toggleForm = () => {
  isLogin.value = !isLogin.value;
};

const handleSubmit = () => {
  const credentials = { email: email.value, password: password.value };
  if (isLogin.value) {
    authStore.login(credentials);
  } else {
    authStore.register(credentials);
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}
.auth-form {
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
}
</style>
