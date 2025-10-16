import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import jwtDecode from 'jwt-decode'

// Helper to parse JWT
function parseJwt(token) {
  try {
    if (typeof jwtDecode === 'function') return jwtDecode(token);
    // Fallback: manual base64 decode of payload
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding JWT with jwt-decode", e);
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
    if (response) {
      // Backend may return PascalCase (C#) or camelCase (JS). Accept both.
      const tokenValue = response.token ?? response.Token ?? null;
      const userValue = response.user ?? response.User ?? null;
      if (tokenValue) {
        // Normalize shape for setAuth
        setAuth({ token: tokenValue, user: userValue });
        router.push({ name: 'inicio' }); // Redirect to home after login
      } else {
        console.warn('Login response did not include a token:', response);
      }
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
    // Accept either { token, user } or { Token, User }
    const tokenValue = authResponse.token ?? authResponse.Token ?? null;
    const userValue = authResponse.user ?? authResponse.User ?? null;
    user.value = userValue || null;
    token.value = tokenValue || null;
    if (tokenValue) localStorage.setItem('token', tokenValue);
    if (userValue) localStorage.setItem('user', JSON.stringify(userValue));
  }

  function tryAutoLogin() {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const decodedToken = parseJwt(storedToken);
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
          // Token is valid and not expired
          token.value = storedToken;
          user.value = JSON.parse(storedUser);
        } else {
          // Token is expired or invalid
          logout();
        }
      } catch (error) {
        console.error("Failed to auto-login, clearing session:", error);
        logout();
      }
    }
  }

  return { user, token, isAuthenticated, login, register, logout, tryAutoLogin };
});