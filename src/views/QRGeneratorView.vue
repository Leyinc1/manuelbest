<template>
  <section id="qr-generator" class="view-card content-section active">
    <h2>QR GENERATOR</h2>
    <div class="qr-form">
      <label for="qr-input">Texto o URL</label>
      <input id="qr-input" v-model="text" placeholder="Escribe texto o pega una URL" />
      <label for="size">Tamaño</label>
      <select id="size" v-model.number="size">
        <option :value="128">128</option>
        <option :value="256">256</option>
        <option :value="512">512</option>
      </select>
      <button @click="generate">Generar QR</button>
      <button @click="download" :disabled="!qrDataUrl">Descargar PNG</button>
    </div>

    <div class="qr-preview" v-if="qrDataUrl">
      <h3>Previsualización</h3>
      <img :src="qrDataUrl" alt="QR" />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
// We will use a tiny inline QR generator to avoid adding dependencies.
// Implementation based on a minimal QR encoder that renders to a canvas using an external CDN at runtime.

const text = ref('')
const size = ref(256)
const qrDataUrl = ref('')

function generate() {
  if (!text.value) return

  // Use a public lightweight script: kjua (small and widely used). We'll create a script tag if not present.
  if (!window.kjua) {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/kjua@0.1.1/dist/kjua.min.js'
    s.onload = () => renderQr()
    document.body.appendChild(s)
  } else {
    renderQr()
  }
}

function renderQr() {
  const el = window.kjua({
    text: text.value,
    size: size.value,
    render: 'image',
    crisp: true,
  })
  // el is an <img> element with a data URL
  qrDataUrl.value = el.src
}

function download() {
  if (!qrDataUrl.value) return
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = 'qr.png'
  document.body.appendChild(a)
  a.click()
  a.remove()
}
</script>

<style scoped>
.qr-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 480px;
}
.qr-preview img {
  max-width: 100%;
  height: auto;
  border: 1px solid #ccc;
}
</style>
