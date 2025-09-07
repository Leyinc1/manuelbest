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

app.use(createPinia())

// --- LÓGICA DE IDENTITY ---
// Inicializamos Pinia para poder usar el store aquí mismo
const pinia = app.config.globalProperties.$pinia || createPinia()
const authStore = useAuthStore(pinia)

netlifyIdentity.init()
netlifyIdentity.on('init', (user) => {
  authStore.setUser(user)
})
netlifyIdentity.on('login', (user) => {
  authStore.setUser(user)
  netlifyIdentity.close()
})
netlifyIdentity.on('logout', () => {
  authStore.setUser(null)
})
// --- FIN DE LÓGICA ---

app.use(router)
app.mount('#app')
