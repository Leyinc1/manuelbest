import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Helper to parse JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT", e);
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  // --- STATE ---
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);

  // --- GETTERS ---
  const isAuthenticated = computed(() => !!token.value);

  // --- ACTIONS ---
  async function apiAuthCall(endpoint, payload) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Error ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error in auth call to ${endpoint}:`, error);
      alert(`Authentication Error: ${error.message}`);
      return null;
    }
  }

  async function login(credentials) {
    const response = await apiAuthCall('/api/auth/login', credentials);
    if (response && response.token) {
      setAuth(response);
      router.push({ name: 'inicio' }); // Redirect to home after login
    }
  }

  async function register(credentials) {
    const response = await apiAuthCall('/api/auth/register', credentials);
    if (response) {
      alert("Registration successful! Please log in.");
      // Optionally, redirect to a login page or clear form
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push({ name: 'inicio' }); // Redirect to home after logout
  }

  function setAuth(authResponse) {
    user.value = authResponse.user;
    token.value = authResponse.token;
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
  }

  function tryAutoLogin() {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
        const decodedToken = parseJwt(storedToken);
        // Check if token is expired
        if (decodedToken.exp * 1000 > Date.now()) {
            token.value = storedToken;
            user.value = JSON.parse(storedUser);
        } else {
            // Token is expired, clear it
            logout();
        }
    }
  }

  return { user, token, isAuthenticated, login, register, logout, tryAutoLogin };
});