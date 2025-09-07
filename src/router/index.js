import { createRouter, createWebHashHistory } from 'vue-router'
import InicioView from '../views/InicioView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'inicio',
      component: InicioView,
    },
    {
      path: '/objetivo',
      name: 'objetivo',
      component: () => import('../views/ObjetivoView.vue'),
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
    },
    {
      path: '/intereses',
      name: 'intereses',
      component: () => import('../views/InteresesView.vue'),
    },
    {
      path: '/kanban',
      name: 'kanban',
      // Esto cargará el componente de la vista Kanban cuando se visite /kanban
      component: () => import('../views/KanbanView.vue'),
    },
    /*
    {
      path: '/calendario',
      name: 'calendario',
      // Dejamos esto preparado para el futuro
      component: () => import('../views/CalendarioView.vue'),
    },
    */
    // Añadiremos las rutas para Kanban y Calendario más adelante
  ],
})

export default router
