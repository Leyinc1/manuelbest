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

netlifyIdentity.on('init', (user) => {
  authStore.setUser(user)
  // Montamos la aplicación Vue SOLO DESPUÉS de que Netlify Identity se haya inicializado.
  app.mount('#app')
})

netlifyIdentity.on('login', (user) => {
  authStore.setUser(user)
  netlifyIdentity.close()
})

netlifyIdentity.on('logout', () => {
  authStore.setUser(null)
})
// --- FIN DE LÓGICA ---
