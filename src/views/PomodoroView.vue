<template>
  <div class="pomodoro-container">
    <h1>Pomodoro Timer</h1>
    <div class="timers">
      <div class="timer-wrapper">
        <h2>Work</h2>
        <div class="timer">{{ formatTime(workTime) }}</div>
        <div class="inputs">
          <label for="workMinutes">Minutes:</label>
          <input type="number" id="workMinutes" v-model.number="customWorkMinutes" min="1">
        </div>
      </div>
      <div class="timer-wrapper">
        <h2>Break</h2>
        <div class="timer">{{ formatTime(breakTime) }}</div>
        <div class="inputs">
          <label for="breakMinutes">Minutes:</label>
          <input type="number" id="breakMinutes" v-model.number="customBreakMinutes" min="1">
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
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const defaultWorkMinutes = 25;
const defaultBreakMinutes = 5;

const customWorkMinutes = ref(defaultWorkMinutes);
const customBreakMinutes = ref(defaultBreakMinutes);

const workTime = ref(customWorkMinutes.value * 60);
const breakTime = ref(customBreakMinutes.value * 60);

const isWorkRunning = ref(false);
const isBreakRunning = ref(false);

let workIntervalId = null;
let breakIntervalId = null;

const formatTime = (timeInSeconds) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const startWorkTimer = () => {
  isWorkRunning.value = true;
  workIntervalId = setInterval(() => {
    if (workTime.value > 0) {
      workTime.value--;
    } else {
      stopWorkTimer();
      startBreakTimer();
    }
  }, 1000);
};

const stopWorkTimer = () => {
  isWorkRunning.value = false;
  clearInterval(workIntervalId);
};

const startBreakTimer = () => {
  isBreakRunning.value = true;
  breakIntervalId = setInterval(() => {
    if (breakTime.value > 0) {
      breakTime.value--;
    } else {
      stopBreakTimer();
    }
  }, 1000);
};

const stopBreakTimer = () => {
  isBreakRunning.value = false;
  clearInterval(breakIntervalId);
};

const resetTimers = () => {
  stopWorkTimer();
  stopBreakTimer();
  workTime.value = customWorkMinutes.value * 60;
  breakTime.value = customBreakMinutes.value * 60;
};

watch(customWorkMinutes, (newMinutes) => {
  workTime.value = newMinutes * 60;
});

watch(customBreakMinutes, (newMinutes) => {
  breakTime.value = newMinutes * 60;
});

</script>

<style scoped>
.pomodoro-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.timers {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.timer-wrapper {
  text-align: center;
}

.timer {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.inputs {
  margin-bottom: 1rem;
}

.controls button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
}
</style>
