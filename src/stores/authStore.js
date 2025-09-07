import { defineStore } from 'pinia'
import { ref } from 'vue'
import netlifyIdentity from 'netlify-identity-widget'

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const user = ref(null)

  // --- ACTIONS ---
  const login = () => {
    netlifyIdentity.open('login')
  }

  const logout = () => {
    netlifyIdentity.logout()
  }

  const signup = () => {
    netlifyIdentity.open('signup')
  }

  // --- PRIVATE (para ser llamadas por los listeners) ---
  const setUser = (newUser) => {
    user.value = newUser
  }

  return { user, login, logout, signup, setUser }
})
