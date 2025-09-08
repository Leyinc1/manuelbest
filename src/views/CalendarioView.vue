<template>
  <div class="calendar-view">
    <div class="subjects-container">
      <h2>Materias</h2>
      <div class="subject-list">
        <div v-for="subject in subjects" :key="subject.id" class="subject-item" :style="{ backgroundColor: subject.color }" :data-event='JSON.stringify(subject)'>
          {{ subject.title }} ({{ subject.duration }}h)
        </div>
      </div>
      <div class="add-subject">
        <input type="text" v-model="newSubjectTitle" placeholder="Nueva materia">
        <input type="number" v-model="newSubjectDuration" placeholder="Horas" min="1">
        <input type="color" v-model="newSubjectColor">
        <button @click="addSubject">Agregar</button>
      </div>
    </div>
    <div class="calendar-container">
      <FullCalendar :options="calendarOptions" ref="fullCalendar" />
      <button class="save-button" @click="saveSchedule">Guardar Calendario</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { useAuthStore } from '@/stores/authStore';
import netlifyIdentity from 'netlify-identity-widget';

const authStore = useAuthStore();
const subjects = ref([]);
const newSubjectTitle = ref('');
const newSubjectColor = ref('#3498db');
const newSubjectDuration = ref(1);
const fullCalendar = ref(null);

const calendarOptions = ref({
  plugins: [timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: false,
  allDaySlot: false,
  slotMinTime: '07:00:00',
  slotMaxTime: '23:00:00',
  slotDuration: '01:00:00',
  droppable: true,
  editable: true,
  eventDurationEditable: true,
  locale: esLocale,
  dayHeaderFormat: { weekday: 'long' },
  events: [],
  eventReceive: function(info) {
    const subject = JSON.parse(info.draggedEl.dataset.event);
    info.event.setProp('backgroundColor', subject.color);
    info.event.setProp('borderColor', subject.color);
    info.event.setEnd(new Date(info.event.start.getTime() + subject.duration * 60 * 60 * 1000));
    localStorage.setItem(subject.title, subject.color);
  },
  height: 'auto',
  aspectRatio: 1.5,
});

onMounted(() => {
  new Draggable(document.querySelector('.subject-list'), {
    itemSelector: '.subject-item',
  });
  loadSchedule();
  loadSubjects();
});

watch(() => authStore.user, (newUser) => {
  if (newUser) {
    loadSchedule();
    loadSubjects();
  } else {
    calendarOptions.value.events = [];
    subjects.value = [];
  }
});

function addSubject() {
  if (newSubjectTitle.value && newSubjectDuration.value > 0) {
    const newSubject = {
      id: Date.now().toString(),
      title: newSubjectTitle.value,
      color: newSubjectColor.value,
      duration: newSubjectDuration.value
    };
    subjects.value.push(newSubject);
    localStorage.setItem('subjects', JSON.stringify(subjects.value));
    newSubjectTitle.value = '';
    newSubjectDuration.value = 1;
  }
}

function loadSubjects() {
  const storedSubjects = localStorage.getItem('subjects');
  if (storedSubjects) {
    subjects.value = JSON.parse(storedSubjects);
  }
}

async function loadSchedule() {
  if (!authStore.user) return;
  const user = netlifyIdentity.currentUser();
  const token = user.token.access_token;

  try {
    const response = await fetch('/.netlify/functions/load-schedule', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      calendarOptions.value.events = data.schedule.map(event => {
        const color = localStorage.getItem(event.title);
        return {
          ...event,
          backgroundColor: color || '#3498db',
          borderColor: color || '#2980b9',
        };
      });
    }
  } catch (error) {
    console.error('Error loading schedule:', error);
  }
}

async function saveSchedule() {
  if (!authStore.user) return;
  const user = netlifyIdentity.currentUser();
  const token = user.token.access_token;
  const calendarApi = fullCalendar.value.getApi();
  const schedule = calendarApi.getEvents().map(event => {
    localStorage.setItem(event.title, event.backgroundColor);
    return {
      title: event.title,
      start: event.start,
      end: event.end,
    };
  });

  console.log('Saving schedule:', schedule);

  try {
    await fetch('/.netlify/functions/save-schedule', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ schedule }),
    });
  } catch (error) {
    console.error('Error saving schedule:', error);
  }
}

</script>

<style scoped>
.calendar-view {
  display: flex;
  padding: 40px;
  gap: 40px;
  flex-grow: 1;
  overflow: hidden;
}

.subjects-container {
  width: 280px;
  min-width: 280px;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.subjects-container h2 {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
  text-align: center;
  color: #2c3e50;
}

.subject-list {
  margin-top: 20px;
  height: calc(100% - 140px);
  overflow-y: auto;
}

.subject-item {
  color: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: grab;
  font-weight: 500;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.subject-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.add-subject {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.add-subject input[type="text"] {
  flex-grow: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  width: 100%;
}

.add-subject input[type="number"] {
  width: 80px;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 8px;
}

.add-subject input[type="color"] {
  height: 42px;
  width: 50px;
  border: 1px solid #ced4da;
  padding: 2px;
  border-radius: 8px;
}

.add-subject button {
  padding: 10px 15px;
  border: none;
  background-color: #3498db;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  width: 100%;
}

.calendar-container {
  flex-grow: 1;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

:global(.fc) {
  flex-grow: 1;
}

.save-button {
  margin-top: 20px;
  padding: 12px 24px;
  border: none;
  background-color: #2ecc71;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  border-radius: 8px;
  transition: background-color 0.2s, color 0.2s;
  align-self: center;
}

.save-button:hover {
  background-color: #27ae60;
}
</style>
