<template>
  <section id="proyectos" class="view-card content-section active">
    <h2>Proyectos Destacados</h2>
    <div class="projects-grid q-mt-md">
      <q-card v-for="p in projects" :key="p.url" flat bordered class="project-card cursor-pointer">
        <div class="row items-center no-wrap q-pa-md">
          <div class="col">
            <div class="text-subtitle1 text-weight-medium">{{ p.name }}</div>
            <div class="text-caption text-grey-5">{{ p.short }}</div>
          </div>
          <div class="col-auto">
            <q-btn flat round dense icon="info" color="primary" />
          </div>
        </div>

        <!-- Ventanita de información al hacer click -->
        <q-popup-proxy anchor-click transition-show="scale" transition-hide="scale">
          <q-card style="min-width: 280px; max-width: 360px;">
            <q-card-section class="text-subtitle2">{{ p.name }}</q-card-section>
            <q-separator />
            <q-card-section class="text-body2">
              <div class="q-mb-sm">{{ p.description }}</div>
              <div v-if="p.techs?.length" class="row q-col-gutter-xs">
                <div v-for="t in p.techs" :key="t" class="col-auto">
                  <q-chip dense>{{ t }}</q-chip>
                </div>
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat color="primary" label="Abrir" :href="p.url" target="_blank" />
              <q-btn flat color="secondary" label="Copiar enlace" @click.stop="copy(p.url)" />
            </q-card-actions>
          </q-card>
        </q-popup-proxy>
      </q-card>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const projects = ref([
  {
    name: 'IGD GROUP',
    short: 'Página Web Corporativa',
    url: 'https://igdgroupsac.com',
    description: 'Sitio corporativo con información de servicios y contacto.',
    techs: ['Vue', 'Vite', 'Quasar']
  },
  {
    name: 'Gestión Hotel V2 (Python)',
    short: 'Proyecto de hotelería',
    url: 'https://github.com/NAACH21/GEST_HOTEL_V2',
    description: 'Sistema de gestión para hotelería con módulos de reservas y clientes.',
    techs: ['Python']
  },
  {
    name: 'Gestión Hotel (Java)',
    short: 'Proyecto de hotelería',
    url: 'https://github.com/Leyinc1/Gestion-Hotel',
    description: 'Aplicación de escritorio en Java para administración hotelera.',
    techs: ['Java']
  }
])

function copy(text) {
  navigator.clipboard?.writeText(text)
    .then(() => $q.notify({ type: 'positive', message: 'Enlace copiado al portapapeles' }))
    .catch(() => $q.notify({ type: 'warning', message: 'No se pudo copiar el enlace' }))
}
</script>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}
.project-card:hover { box-shadow: 0 8px 18px rgba(0,0,0,0.22); }
</style>
