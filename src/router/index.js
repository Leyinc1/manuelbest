import { createRouter, createWebHashHistory } from 'vue-router'
import InicioView from '../views/InicioView.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    name: 'inicio',
    component: InicioView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/objetivo',
    name: 'objetivo',
    component: () => import('../views/ObjetivoView.vue'),
  },
  {
    path: '/Perfiles',
    name: 'Perfiles',
    component: () => import('../views/PerfilesView.vue'),
  },
  {
    path: '/tecnologias',
    name: 'tecnologias',
    component: () => import('../views/TecnologiasView.vue'),
  },
  {
    path: '/proyectos',
    name: 'proyectos',
    component: () => import('../views/ProyectosView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/intereses',
    name: 'intereses',
    component: () => import('../views/InteresesView.vue'),
  },
  {
    path: '/kanban',
    name: 'kanban',
    component: () => import('../views/KanbanView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/archivos',
    name: 'archivos',
    component: () => import('../views/ArchivosView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/pomodoro',
    name: 'pomodoro',
    component: () => import('../views/PomodoroView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/calendario',
    name: 'calendario',
    component: () => import('../views/CalendarioView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tetris',
    name: 'tetris',
    component: () => import('../views/TetrisView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    // If route requires auth and user is not authenticated, redirect to login
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // If user is authenticated and tries to go to login page, redirect to home
    next({ name: 'inicio' })
  } else {
    // Otherwise, allow navigation
    next()
  }
})

export default router
