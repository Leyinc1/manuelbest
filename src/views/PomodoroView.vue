<template>
  <section class="view-card content-section active q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5">Pomodoro</div>
        <div class="text-caption text-grey-5">Enfoque con intervalos</div>
      </div>
      <div class="col-auto">
        <q-btn flat round dense icon="settings" @click="settingsOpen = true" />
      </div>
    </div>

    <q-card flat bordered class="pom-card">
      <q-card-section>
        <div class="row items-center justify-center">
          <div class="col-auto">
            <q-circular-progress
              :value="progress * 100"
              size="220px"
              :thickness="0.2"
              :color="sessionColor"
              track-color="grey-8"
              show-value
            >
              <div class="text-h2 text-weight-medium">{{ timeText }}</div>
              <div class="text-caption text-grey-5">{{ sessionLabel }}</div>
            </q-circular-progress>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="center" class="q-gutter-sm q-py-md">
        <q-btn color="primary" :label="running ? 'Pausar' : 'Iniciar'" :icon="running ? 'pause' : 'play_arrow'" @click="toggle()" />
        <q-btn color="secondary" label="Reiniciar" icon="restart_alt" @click="reset()" />
        <q-btn flat :color="isWork ? 'primary' : 'cyan'" :label="isWork ? 'Trabajo' : 'Descanso'" icon="swap_horiz" @click="switchSession()" />
      </q-card-actions>
    </q-card>

    <q-dialog v-model="settingsOpen">
      <q-card style="min-width:320px;max-width:460px">
        <q-card-section class="text-subtitle1">Ajustes</q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col">
              <q-input type="number" v-model.number="workMinutes" label="Trabajo (min)" dense outlined min="1" />
            </div>
            <div class="col">
              <q-input type="number" v-model.number="breakMinutes" label="Descanso (min)" dense outlined min="1" />
            </div>
          </div>
          <q-toggle v-model="autoSwitch" label="Cambiar a descanso/trabajo automáticamente" color="primary" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" @click="saveSettings" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Settings
const settingsOpen = ref(false)
const workMinutes = ref(Number(localStorage.getItem('pomodoro.work') || 25))
const breakMinutes = ref(Number(localStorage.getItem('pomodoro.break') || 5))
const autoSwitch = ref(localStorage.getItem('pomodoro.auto') === 'true')

// Session
const isWork = ref(true)
const running = ref(false)
const durationMs = computed(() => (isWork.value ? workMinutes.value : breakMinutes.value) * 60_000)
const remainingMs = ref(durationMs.value)

let rafId = null
let startTs = 0

const sessionColor = computed(() => (isWork.value ? 'primary' : 'cyan'))
const sessionLabel = computed(() => (isWork.value ? 'Trabajo' : 'Descanso'))

const timeText = computed(() => {
  const totalSeconds = Math.max(0, Math.round(remainingMs.value / 1000))
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const progress = computed(() => 1 - remainingMs.value / durationMs.value)

function loop(ts) {
  if (!running.value) return
  if (!startTs) startTs = ts
  const elapsed = ts - startTs
  const nextRemaining = Math.max(0, durationMs.value - elapsed)
  // Avoid excessive reactive churn: only update each 200ms
  if (Math.abs(nextRemaining - remainingMs.value) >= 150) remainingMs.value = nextRemaining
  if (nextRemaining <= 0) {
    running.value = false
    startTs = 0
    remainingMs.value = 0
    $q.notify({ type: 'positive', message: isWork.value ? 'Tiempo de descanso' : 'Volver al trabajo' })
    if (autoSwitch.value) {
      switchSession()
      toggle() // auto start next session
    }
    return
  }
  rafId = requestAnimationFrame(loop)
}

function toggle() {
  if (running.value) {
    // pause
    running.value = false
    cancelAnimationFrame(rafId)
    // preserve remainingMs
  } else {
    // resume
    startTs = performance.now() - (durationMs.value - remainingMs.value)
    running.value = true
    rafId = requestAnimationFrame(loop)
  }
}

function reset() {
  running.value = false
  cancelAnimationFrame(rafId)
  startTs = 0
  remainingMs.value = durationMs.value
}

function switchSession() {
  const wasRunning = running.value
  running.value = false
  cancelAnimationFrame(rafId)
  isWork.value = !isWork.value
  startTs = 0
  remainingMs.value = durationMs.value
  if (wasRunning) toggle()
}

function saveSettings() {
  localStorage.setItem('pomodoro.work', String(workMinutes.value))
  localStorage.setItem('pomodoro.break', String(breakMinutes.value))
  localStorage.setItem('pomodoro.auto', String(autoSwitch.value))
  // Reaplica duración actual respetando la sesión
  remainingMs.value = durationMs.value
  settingsOpen.value = false
}

function onVisibility() {
  if (document.hidden && running.value) {
    // Pause when tab hidden to reduce CPU/GPU usage
    toggle()
  }
}

onMounted(() => {
  remainingMs.value = durationMs.value
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
.pom-card { background: rgba(17,24,39,0.5); border: 1px solid var(--border-color); }
.text-h2 { letter-spacing: 1px; }
</style>
