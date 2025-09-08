<template>
  <div class="pomodoro-container">
    <h1>Pomodoro Timer</h1>
    <div class="timer">{{ formatTime }}</div>
    <div class="controls">
      <button @click="startTimer" :disabled="isRunning">Start</button>
      <button @click="stopTimer" :disabled="!isRunning">Stop</button>
      <button @click="resetTimer">Reset</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const workTime = 25 * 60;
const breakTime = 5 * 60;

const time = ref(workTime);
const isRunning = ref(false);
const isWorkTime = ref(true);
let intervalId = null;

const formatTime = computed(() => {
  const minutes = Math.floor(time.value / 60);
  const seconds = time.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const startTimer = () => {
  isRunning.value = true;
  intervalId = setInterval(() => {
    if (time.value > 0) {
      time.value--;
    } else {
      isWorkTime.value = !isWorkTime.value;
      time.value = isWorkTime.value ? workTime : breakTime;
    }
  }, 1000);
};

const stopTimer = () => {
  isRunning.value = false;
  clearInterval(intervalId);
};

const resetTimer = () => {
  stopTimer();
  isWorkTime.value = true;
  time.value = workTime;
};
</script>

<style scoped>
.pomodoro-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.timer {
  font-size: 6rem;
  margin-bottom: 1rem;
}

.controls button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
}
</style>