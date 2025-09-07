import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// --- NUESTRAS IMPORTACIONES ---
import netlifyIdentity from 'netlify-identity-widget'
import { useAuthStore } from '@/stores/authStore'
// --- FIN DE IMPORTACIONES ---

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// --- LÓGICA DE IDENTITY ---
const authStore = useAuthStore(pinia)

netlifyIdentity.init()

netlifyIdentity.on('login', (user) => {
  authStore.setUser(user)
  netlifyIdentity.close()
})

netlifyIdentity.on('logout', () => {
  authStore.setUser(null)
})

// Inicializa el estado del usuario con el usuario actual de Netlify Identity.
// Esto puede ser 'null' si nadie ha iniciado sesión.
authStore.setUser(netlifyIdentity.currentUser())

// Monta la aplicación inmediatamente.
app.mount('#app')
// --- FIN DE LÓGICA ---
