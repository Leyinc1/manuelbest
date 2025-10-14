
<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>{{ isLogin ? 'Iniciar Sesión' : 'Registro' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" v-model="password" required />
        </div>
        <button type="submit">{{ isLogin ? 'Login' : 'Register' }}</button>
      </form>
      <a @click.prevent="toggleForm" href="#">
        {{ isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
      </a>
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
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}
button:hover {
  background-color: #0056b3;
}
a {
  text-align: center;
  display: block;
  color: #007bff;
  cursor: pointer;
}
</style>
