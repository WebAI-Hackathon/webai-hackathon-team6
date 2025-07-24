<template>
  <div class="task-card" :class="[`priority-${task.priority}`, { dragging: isDragging }]" draggable="true"
    @dragstart="onDragStart" @dragend="onDragEnd" @click="viewTask">
    <div class="task-header">
      <div class="task-priority" :class="`priority-${task.priority}`">
        {{ task.priority.charAt(0).toUpperCase() }}
      </div>
      <div class="task-actions" @click.stop>
        <button @click="logWork" class="action-btn" title="Log work">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </button>
        <button @click="editTask" class="action-btn" title="Edit task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
        </button>
        <button @click="deleteTask" class="action-btn delete-btn" title="Delete task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </div>
    </div>

    <div class="task-content">
      <div class="task-title-row">
        <h4 class="task-title">{{ task.title }}</h4>
        <div v-if="task.tag" class="task-tag" :class="`tag-${task.tag}`">
          {{ getTagDisplayName(task.tag) }}
        </div>
      </div>
      <p v-if="task.description" class="task-description">
        {{ truncateText(task.description, 60) }}
      </p>
    </div>

    <div class="task-meta">
      <div v-if="task.estimatedHours > 0" class="hours-indicator">
        <span class="hours-text">{{ totalLoggedHours }}/{{ task.estimatedHours }}h</span>
        <div class="progress-mini">
          <div class="progress-fill-mini"
            :style="{ width: Math.min((totalLoggedHours / task.estimatedHours) * 100, 100) + '%' }"
            :class="{ 'over-estimate': totalLoggedHours > task.estimatedHours }"></div>
        </div>
      </div>
      <div v-if="task.workLogs && task.workLogs.length > 0" class="work-logs-count">
        {{ task.workLogs.length }} log{{ task.workLogs.length !== 1 ? 's' : '' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit-task', 'delete-task', 'log-work', 'view-task'])

const isDragging = ref(false)

const totalLoggedHours = computed(() => {
  if (!props.task.workLogs) return 0
  return props.task.workLogs.reduce((total, log) => total + log.hours, 0)
})

const getTagDisplayName = (tag) => {
  const tagMap = {
    'bug-fix': 'Bug Fix',
    'feature': 'Feature',
    'organisational': 'Organisational'
  }
  return tagMap[tag] || tag
}

const onDragStart = (event) => {
  isDragging.value = true
  event.dataTransfer.setData('taskId', props.task.id.toString())
  event.dataTransfer.effectAllowed = 'move'
}

const onDragEnd = () => {
  isDragging.value = false
}

const editTask = () => {
  emit('edit-task', props.task.id)
}

const deleteTask = () => {
  emit('delete-task', props.task.id)
}

const logWork = () => {
  emit('log-work', props.task.id)
}

const viewTask = () => {
  emit('view-task', props.task.id)
}

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #f1f3f4;
  position: relative;
  overflow: hidden;
}

.task-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--priority-color);
}

.task-card.priority-high {
  --priority-color: #ef4444;
}

.task-card.priority-medium {
  --priority-color: #f59e0b;
}

.task-card.priority-low {
  --priority-color: #10b981;
}

.task-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
  border-color: #e5e7eb;
}

.task-card.dragging {
  opacity: 0.6;
  transform: rotate(3deg) scale(0.95);
  cursor: grabbing;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-priority {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: var(--priority-color);
}

.task-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.action-btn.delete-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.task-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.task-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
  flex: 1;
}

.task-tag {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.task-tag.tag-bug-fix {
  background: #fef2f2;
  color: #dc2626;
}

.task-tag.tag-feature {
  background: #eff6ff;
  color: #2563eb;
}

.task-tag.tag-organisational {
  background: #f0f9ff;
  color: #0891b2;
}

.task-description {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #9ca3af;
}

.hours-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hours-text {
  font-weight: 500;
  color: #4b5563;
}

.progress-mini {
  width: 40px;
  height: 4px;
  background: #f3f4f6;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.progress-fill-mini.over-estimate {
  background: #ef4444;
}

.work-logs-count {
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  color: #6b7280;
}
</style>