<template>
  <div class="archivos-view">
    <h1>Archivos</h1>

    <section class="upload-section">
      <h2>Subir archivo</h2>
      <input type="file" ref="fileInput" @change="onFileChange" />
      <button @click="uploadFile" :disabled="!selectedFile">Subir</button>
      <div v-if="uploading">Subiendo...</div>
      <!-- DEBUG TOKEN -->
      <div style="margin-top:8px;padding:8px;border:1px dashed #ccc;border-radius:6px;background:#fff">
        <strong>Debug token</strong>
        <div>Token presente: <code>{{ !!localToken }}</code></div>
        <div>Preview: <code>{{ tokenPreview }}</code></div>
        <button @click="toggleDecoded">{{ showDecoded ? 'Ocultar' : 'Mostrar' }} token decodificado</button>
        <pre v-if="showDecoded" style="white-space:pre-wrap;margin-top:8px">{{ decodedPayloadString }}</pre>
      </div>
    </section>

    <section class="list-section">
      <h2>Archivos disponibles</h2>
      <button @click="fetchFiles">Refrescar</button>
      <ul>
        <li v-for="file in files" :key="file.name">
          <span>{{ file.name }}</span>
          <button @click="downloadFile(file.name)">Descargar</button>
        </li>
      </ul>
      <div v-if="files.length === 0">No hay archivos.</div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const selectedFile = ref(null)
const files = ref([])
const uploading = ref(false)
const showDecoded = ref(false)
const decodedPayload = ref(null)

// Reactive token value so UI updates when user logs in/out
const tokenRef = computed(() => authStore.token?.value)

const tokenPreview = computed(() => tokenRef.value ? (tokenRef.value.slice(0,10) + '...') : '\u2014')

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

function onFileChange(e) {
  selectedFile.value = e.target.files[0]
}

async function uploadFile() {
  if (!selectedFile.value) return
  uploading.value = true

  const form = new FormData()
  form.append('file', selectedFile.value)

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
      alert(`Error al subir archivo: ${res.status} ${body ?? ''}`)
      return
    }
    alert('Archivo subido')
    selectedFile.value = null
    fetchFiles()
  } catch (err) {
    console.error(err)
    alert(err.message)
  } finally {
    uploading.value = false
  }
}

async function fetchFiles() {
  try {
    const token = authStore.token?.value
    console.debug('[Archivos] list token preview:', token ? token.slice(0,10) + '...' : null)
    const res = await fetch('/api/Files', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    if (!res.ok) {
      const body = await res.text().catch(() => null)
      console.error('[Archivos] list failed', res.status, body)
      alert(`Error al listar archivos: ${res.status} ${body ?? ''}`)
      return
    }
    files.value = await res.json()
  } catch (err) {
    console.error(err)
    alert(err.message)
  }
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
.archivos-view { padding: 20px }
.upload-section, .list-section { margin-bottom: 20px }
</style>
