<template>
  <div class="archivos-view">
    <h1>Archivos</h1>

    <section class="upload-section">
      <h2>Subir archivo</h2>
      <input type="file" ref="fileInput" @change="onFileChange" />
      <button @click="uploadFile" :disabled="!selectedFile">Subir</button>
      <div v-if="uploading">Subiendo...</div>
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
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const selectedFile = ref(null)
const files = ref([])
const uploading = ref(false)

onMounted(() => {
  if (authStore.isAuthenticated) fetchFiles()
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
    const res = await fetch('/api/Files/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) throw new Error('Error al subir archivo')
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
  const res = await fetch('/api/Files', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    if (!res.ok) throw new Error('Error al listar archivos')
    files.value = await res.json()
  } catch (err) {
    console.error(err)
    alert(err.message)
  }
}

async function downloadFile(name) {
  try {
    const token = authStore.token?.value
    const res = await fetch(`/api/Files/download/${encodeURIComponent(name)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!res.ok) throw new Error('Error al descargar archivo')

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
