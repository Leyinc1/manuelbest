<template>
  <div class="archivos-view">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card flat bordered class="glass-card">
          <q-card-section class="text-h6">Subir archivo</q-card-section>
          <q-separator inset />
          <q-card-section>
            <q-file v-model="selectedFileList" label="Selecciona un archivo" filled use-chips :counter="true" :disable="uploading"/>
            <div class="q-mt-md row items-center q-gutter-sm">
              <q-btn color="primary" :loading="uploading" :disable="!firstSelectedFile" icon="cloud_upload" label="Subir" @click="uploadFile"/>
              <q-btn flat color="secondary" icon="refresh" label="Refrescar" @click="fetchFiles"/>
            </div>
          </q-card-section>
          <q-expansion-item icon="security" label="Debug token" dense expand-separator>
            <q-card>
              <q-card-section>
                <div>Token presente: <code>{{ !!tokenRef }}</code></div>
                <div>Preview: <code>{{ tokenPreview }}</code></div>
                <q-btn flat size="sm" color="primary" :label="showDecoded ? 'Ocultar' : 'Mostrar'" @click="toggleDecoded" />
                <pre v-if="showDecoded" class="q-mt-sm decoded-pre">{{ decodedPayloadString }}</pre>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card flat bordered class="glass-card">
          <q-card-section class="text-h6">Archivos disponibles</q-card-section>
          <q-separator inset />
          <q-card-section>
            <q-table
              :rows="files"
              :columns="columns"
              row-key="name"
              :loading="loading"
              flat
              dense
              :rows-per-page-options="[5,10,25,50]"
              no-data-label="No hay archivos"
            >
              <template #body-cell-actions="props">
                <q-td :props="props">
                  <q-btn round dense color="primary" icon="download" @click="downloadFile(props.row.name)" />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = useAuthStore()
const selectedFileList = ref([])
const files = ref([])
const uploading = ref(false)
const loading = ref(false)
const showDecoded = ref(false)
const decodedPayload = ref(null)

// Reactive token value so UI updates when user logs in/out
const tokenRef = computed(() => authStore.token?.value)

const tokenPreview = computed(() => tokenRef.value ? (tokenRef.value.slice(0,10) + '...') : '\u2014')
const firstSelectedFile = computed(() => Array.isArray(selectedFileList.value) && selectedFileList.value.length ? selectedFileList.value[0] : null)

function toggleDecoded() {
  showDecoded.value = !showDecoded.value
  if (showDecoded.value && tokenRef.value) {
    try {
      const payload = JSON.parse(atob(tokenRef.value.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))
      decodedPayload.value = payload
    } catch {
      decodedPayload.value = { error: 'No se pudo decodificar token' }
    }
  }
}

const decodedPayloadString = computed(() => decodedPayload.value ? JSON.stringify(decodedPayload.value, null, 2) : '')

onMounted(() => {
  if (tokenRef.value) fetchFiles()
})

// If the token becomes available later (after login), auto-fetch files
watch(tokenRef, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    fetchFiles()
  }
})

// QFile maneja selección, no necesitamos onFileChange

async function uploadFile() {
  if (!firstSelectedFile.value) return
  uploading.value = true

  const form = new FormData()
  form.append('file', firstSelectedFile.value)

    try {
    const token = authStore.token?.value
    console.debug('[Archivos] upload token preview:', token ? token.slice(0,10) + '...' : null)
    const res = await fetch('/api/Files/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => null)
      console.error('[Archivos] upload failed', res.status, body)
      $q.notify({ type: 'negative', message: `Error al subir: ${res.status} ${body ?? ''}` })
      return
    }
    $q.notify({ type: 'positive', message: 'Archivo subido' })
    selectedFileList.value = []
    fetchFiles()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: err.message })
  } finally {
    uploading.value = false
  }
}

async function fetchFiles() {
  try {
    loading.value = true
    const token = authStore.token?.value
    console.debug('[Archivos] list token preview:', token ? token.slice(0,10) + '...' : null)
    const res = await fetch('/api/Files', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    if (!res.ok) {
      const body = await res.text().catch(() => null)
      console.error('[Archivos] list failed', res.status, body)
      $q.notify({ type: 'warning', message: `Error al listar: ${res.status} ${body ?? ''}` })
      return
    }
    files.value = await res.json()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: err.message })
  }
  finally { loading.value = false }
}

async function downloadFile(name) {
  try {
    const token = authStore.token?.value
    console.debug('[Archivos] download token preview:', token ? token.slice(0,10) + '...' : null)
    const res = await fetch(`/api/Files/download/${encodeURIComponent(name)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!res.ok) {
      const body = await res.text().catch(() => null)
      console.error('[Archivos] download failed', res.status, body)
      alert(`Error al descargar archivo: ${res.status} ${body ?? ''}`)
      return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error(err)
    alert(err.message)
  }
}
</script>

<style scoped>
.archivos-view { padding: 12px; position: relative; z-index: 1; }
.glass-card { background: rgba(255,255,255,0.06); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.15); }
.decoded-pre { white-space: pre-wrap; word-break: break-word; }
</style>
