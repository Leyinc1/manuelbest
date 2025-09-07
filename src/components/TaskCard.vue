<template>
  <div class="card">
    <div v-if="task.tags && task.tags.length > 0" class="tags-container">
      <span v-for="tag in task.tags" :key="tag" :class="`tag tag-${tag.toLowerCase()}`">
        {{ tag }}
      </span>
    </div>
    <span>{{ task.content }}</span>
    <div v-if="task.assigned_to" class="assigned-person">
      {{ task.assigned_to }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  task: {
    type: Object,
    required: true,
  },
})
</script>
