<template>
  <div class="calendar-view">
    <div class="subjects-container">
      <h2>Materias</h2>
      <div class="subject-list">
        <div v-for="subject in subjects" :key="subject.id" class="subject-item" :style="{ backgroundColor: subject.color }" :data-event='JSON.stringify(subject)'>
          {{ subject.title }}
        </div>
      </div>
      <div class="add-subject">
        <input type="text" v-model="newSubjectTitle" placeholder="Nueva materia">
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
const newSubjectColor = ref('#0077b6');
const fullCalendar = ref(null);

const calendarOptions = ref({
  plugins: [timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: false,
  allDaySlot: false,
  slotMinTime: '07:30:00',
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
    info.event.setEnd(new Date(info.event.start.getTime() + 60 * 60 * 1000));
  },
  height: 'auto',
});

onMounted(() => {
  new Draggable(document.querySelector('.subject-list'), {
    itemSelector: '.subject-item',
  });
  loadSchedule();
});

watch(() => authStore.user, (newUser) => {
  if (newUser) {
    loadSchedule();
  } else {
    calendarOptions.value.events = [];
  }
});

function addSubject() {
  if (newSubjectTitle.value) {
    subjects.value.push({ 
      id: Date.now().toString(), 
      title: newSubjectTitle.value,
      color: newSubjectColor.value
    });
    newSubjectTitle.value = '';
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
      calendarOptions.value.events = data.schedule.map(event => ({
        ...event,
        backgroundColor: event.color,
        borderColor: event.color
      }));
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
  const schedule = calendarApi.getEvents().map(event => ({
    title: event.title,
    start: event.start,
    end: event.end,
    color: event.backgroundColor
  }));

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
  width: 250px;
  min-width: 250px;
  background-color: #f1f1f1;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.subjects-container h2 {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
  text-align: center;
}

.subject-list {
  margin-top: 20px;
  height: calc(100% - 120px);
  overflow-y: auto;
}

.subject-item {
  color: white;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: grab;
  font-weight: 500;
  text-align: center;
}

.add-subject {
  margin-top: 20px;
  display: flex;
}

.add-subject input[type="text"] {
  flex-grow: 1;
  padding: 8px;
  border-radius: 8px 0 0 8px;
  border: 1px solid #ced4da;
}

.add-subject input[type="color"] {
  height: 38px;
  width: 40px;
  border: 1px solid #ced4da;
  padding: 2px;
  border-left: none;
}

.add-subject button {
  padding: 8px 12px;
  border: none;
  background-color: #0077b6;
  color: white;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  font-weight: 500;
}

.calendar-container {
  flex-grow: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:global(.fc) {
  flex-grow: 1;
}

.save-button {
  margin-top: 20px;
  padding: 12px 24px;
  border: none;
  background-color: #2a9d8f;
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
  background-color: #248a7f;
}
</style>
