import './assets/main.css'
// Quasar CSS and extras
import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/authStore'
import { Quasar, Notify } from 'quasar'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(Quasar, { plugins: { Notify } })

// Attempt to load user from localStorage on startup
const authStore = useAuthStore(pinia)
authStore.tryAutoLogin()

app.mount('#app')
