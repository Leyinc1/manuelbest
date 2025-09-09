<template>
  <div class="pomodoro-view">
    <div class="pomodoro-container">
      <h1>Pomodoro Timer</h1>
      <div class="timers">
        <div class="timer-wrapper">
          <h2>Work</h2>
          <div class="timer">{{ formatTime(workTime) }}</div>
          <div class="inputs">
            <label for="workMinutes">Minutes:</label>
            <input type="number" id="workMinutes" v-model.number="customWorkMinutes" min="1" />
          </div>
        </div>
        <div class="timer-wrapper">
          <h2>Break</h2>
          <div class="timer">{{ formatTime(breakTime) }}</div>
          <div class="inputs">
            <label for="breakMinutes">Minutes:</label>
            <input type="number" id="breakMinutes" v-model.number="customBreakMinutes" min="1" />
          </div>
        </div>
      </div>
      <div class="controls">
        <button @click="startWorkTimer" :disabled="isWorkRunning">Start Work</button>
        <button @click="stopWorkTimer" :disabled="!isWorkRunning">Stop Work</button>
        <button @click="startBreakTimer" :disabled="isBreakRunning">Start Break</button>
        <button @click="stopBreakTimer" :disabled="!isBreakRunning">Stop Break</button>
        <button @click="resetTimers">Reset</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const defaultWorkMinutes = 25
const defaultBreakMinutes = 5

const customWorkMinutes = ref(defaultWorkMinutes)
const customBreakMinutes = ref(defaultBreakMinutes)

const workTime = ref(customWorkMinutes.value * 60)
const breakTime = ref(customBreakMinutes.value * 60)

const isWorkRunning = ref(false)
const isBreakRunning = ref(false)

let workIntervalId = null
let breakIntervalId = null

const formatTime = (timeInSeconds) => {
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = timeInSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const startWorkTimer = () => {
  if (isBreakRunning.value) {
    stopBreakTimer()
  }
  isWorkRunning.value = true
  workIntervalId = setInterval(() => {
    if (workTime.value > 0) {
      workTime.value--
    } else {
      stopWorkTimer()
      startBreakTimer()
    }
  }, 1000)
}

const stopWorkTimer = () => {
  isWorkRunning.value = false
  clearInterval(workIntervalId)
}

const startBreakTimer = () => {
  if (isWorkRunning.value) {
    stopWorkTimer()
  }
  isBreakRunning.value = true
  breakIntervalId = setInterval(() => {
    if (breakTime.value > 0) {
      breakTime.value--
    } else {
      stopBreakTimer()
    }
  }, 1000)
}

const stopBreakTimer = () => {
  isBreakRunning.value = false
  clearInterval(breakIntervalId)
}

const resetTimers = () => {
  stopWorkTimer()
  stopBreakTimer()
  workTime.value = customWorkMinutes.value * 60
  breakTime.value = customBreakMinutes.value * 60
}

watch(customWorkMinutes, (newMinutes) => {
  workTime.value = newMinutes * 60
})

watch(customBreakMinutes, (newMinutes) => {
  breakTime.value = newMinutes * 60
})
</script>

<style scoped>
.pomodoro-view {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  padding: 40px;
}

.pomodoro-container {
  background-color: #f1f1f1;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 2rem;
}

.timers {
  display: flex;
  gap: 4rem;
  margin-bottom: 2rem;
}

.timer-wrapper {
  text-align: center;
}

.timer-wrapper h2 {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.timer {
  font-size: 6rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.inputs {
  margin-bottom: 1rem;
}

.inputs label {
  margin-right: 0.5rem;
}

.inputs input {
  width: 60px;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ced4da;
}

.controls button {
  margin: 0 0.5rem;
  padding: 12px 24px;
  border: none;
  background-color: #e9ecef;
  color: #495057;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  border-radius: 8px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.controls button:hover {
  background-color: #ced4da;
  color: #212529;
}

.controls button:disabled {
  background-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
}
</style>
