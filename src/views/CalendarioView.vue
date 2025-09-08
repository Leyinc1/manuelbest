<template>
  <div class="calendar-view">
    <div class="subjects-container">
      <h2>Materias</h2>
      <div class="subject-list">
        <div v-for="subject in subjects" :key="subject.id" class="subject-item" :data-event='JSON.stringify(subject)'>
          {{ subject.title }}
        </div>
      </div>
      <div class="add-subject">
        <input type="text" v-model="newSubjectTitle" placeholder="Nueva materia">
        <button @click="addSubject">Agregar</button>
      </div>
    </div>
    <div class="calendar-container">
      <FullCalendar :options="calendarOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

const subjects = ref([
  { id: '1', title: 'Matemáticas' },
  { id: '2', title: 'Historia' },
  { id: '3', title: 'Ciencias' },
]);
const newSubjectTitle = ref('');

const calendarOptions = ref({
  plugins: [timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: false,
  allDaySlot: false,
  slotMinTime: '07:30:00',
  slotMaxTime: '11:00:00',
  droppable: true,
  events: [],
  eventReceive: handleEventReceive,
});

onMounted(() => {
  new Draggable(document.querySelector('.subject-list'), {
    itemSelector: '.subject-item',
  });
  loadSchedule();
});

function addSubject() {
  if (newSubjectTitle.value) {
    subjects.value.push({ id: Date.now().toString(), title: newSubjectTitle.value });
    newSubjectTitle.value = '';
  }
}

async function loadSchedule() {
  if (!authStore.user) return;
  try {
    const response = await fetch('/.netlify/functions/load-schedule');
    const data = await response.json();
    if (response.ok) {
      calendarOptions.value.events = data.schedule;
    }
  } catch (error) {
    console.error('Error loading schedule:', error);
  }
}

async function saveSchedule(schedule) {
  if (!authStore.user) return;
  try {
    await fetch('/.netlify/functions/save-schedule', {
      method: 'POST',
      body: JSON.stringify({ schedule }),
    });
  } catch (error) {
    console.error('Error saving schedule:', error);
  }
}

function handleEventReceive(info) {
  const newEvents = [...calendarOptions.value.events, info.event];
  calendarOptions.value.events = newEvents;
  saveSchedule(newEvents);
}

</script>

<style scoped>
.calendar-view {
  display: flex;
  padding: 40px;
  gap: 40px;
  flex-grow: 1;
}

.subjects-container {
  width: 250px;
  background-color: #f1f1f1;
  border-radius: 12px;
  padding: 20px;
}

.subject-list {
  margin-top: 20px;
}

.subject-item {
  background-color: #0077b6;
  color: white;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: grab;
}

.add-subject {
  margin-top: 20px;
  display: flex;
}

.add-subject input {
  flex-grow: 1;
  padding: 8px;
  border-radius: 8px 0 0 8px;
  border: 1px solid #ced4da;
}

.add-subject button {
  padding: 8px 12px;
  border: none;
  background-color: #0077b6;
  color: white;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
}

.calendar-container {
  flex-grow: 1;
}
</style>
