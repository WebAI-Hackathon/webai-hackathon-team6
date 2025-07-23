<template>
  <div 
    class="ta    <div class="task-hours" v-if="task.estimatedHours > 0 || totalLoggedHours > 0">
      <div class="hours-item">
        <span class="hours-label">Estimated:</span>
        <span class="hours-value">{{ task.estimatedHours }}h</span>
      </div>
      <div class="hours-item">
        <span class="hours-label">Total Logged:</span>
        <span class="hours-value">{{ totalLoggedHours }}h</span>
      </div>
      <div v-if="task.estimatedHours > 0" class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: Math.min((totalLoggedHours / task.estimatedHours) * 100, 100) + '%' }"
          :class="{ 'over-estimate': totalLoggedHours > task.estimatedHours }"
        ></div>
      </div>
    </div>ss="[`priority-${task.priority}`, { dragging: isDragging }]"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="task-header">
      <div class="task-priority" :class="`priority-${task.priority}`">
        {{ task.priority.toUpperCase() }}
      </div>
      <div class="task-actions">
        <button @click="logWork" class="action-btn log-btn" title="Log work">
          ⏰
        </button>
        <button @click="editTask" class="action-btn edit-btn" title="Edit task">
          ✏️
        </button>
        <button @click="deleteTask" class="action-btn delete-btn" title="Delete task">
          🗑️
        </button>
      </div>
    </div>

    <div class="task-content">
      <h4 class="task-title">{{ task.title }}</h4>
      <p v-if="task.description" class="task-description">
        {{ task.description }}
      </p>
    </div>

    <div class="task-hours" v-if="task.estimatedHours > 0 || task.actualHours > 0">
      <div class="hours-item">
        <span class="hours-label">Estimated:</span>
        <span class="hours-value">{{ task.estimatedHours }}h</span>
      </div>
      <div class="hours-item">
        <span class="hours-label">Total Logged:</span>
        <span class="hours-value">{{ totalLoggedHours }}h</span>
      </div>
      <div v-if="task.estimatedHours > 0" class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: Math.min((totalLoggedHours / task.estimatedHours) * 100, 100) + '%' }"
          :class="{ 'over-estimate': totalLoggedHours > task.estimatedHours }"
        ></div>
      </div>
    </div>

    <div v-if="task.workLogs && task.workLogs.length > 0" class="work-logs">
      <div class="work-logs-header">📝 Work History:</div>
      <div class="work-log-list">
        <div v-for="log in task.workLogs" :key="log.id" class="work-log-item">
          <div class="work-log-meta">
            <span class="work-log-developer">{{ log.developer }}</span>
            <span class="work-log-hours">{{ log.hours }}h</span>
            <span class="work-log-date">{{ formatDate(log.timestamp) }}</span>
          </div>
          <div class="work-log-description">{{ log.description }}</div>
        </div>
      </div>
    </div>

    <div v-if="task.comments" class="task-comments">
      <div class="comments-header">💬 Comments:</div>
      <div class="comments-text">{{ task.comments }}</div>
    </div>

    <div class="task-footer">
      <div class="task-date">
        Created: {{ formatDate(task.createdAt) }}
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

const emit = defineEmits(['edit-task', 'delete-task', 'log-work'])

const isDragging = ref(false)

const totalLoggedHours = computed(() => {
  if (!props.task.workLogs) return 0
  return props.task.workLogs.reduce((total, log) => total + log.hours, 0)
})

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

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: grab;
  transition: all 0.2s ease;
  border-left: 4px solid #dee2e6;
}

.task-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.task-card.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
  cursor: grabbing;
}

.task-card.priority-high {
  border-left-color: #dc3545;
}

.task-card.priority-medium {
  border-left-color: #ffc107;
}

.task-card.priority-low {
  border-left-color: #28a745;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-priority {
  font-size: 10px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  color: white;
}

.task-priority.priority-high {
  background: #dc3545;
}

.task-priority.priority-medium {
  background: #ffc107;
  color: #212529;
}

.task-priority.priority-low {
  background: #28a745;
}

.task-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: #f8f9fa;
}

.task-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.3;
}

.task-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #6c757d;
  line-height: 1.4;
}

.task-hours {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.hours-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
}

.hours-label {
  color: #6c757d;
  font-weight: 500;
}

.hours-value {
  color: #495057;
  font-weight: 600;
}

.progress-bar {
  margin-top: 8px;
  background: #e9ecef;
  border-radius: 3px;
  height: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
  border-radius: 3px;
}

.progress-fill.over-estimate {
  background: #dc3545;
}

.task-comments {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.comments-header {
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 6px;
}

.comments-text {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;
  white-space: pre-wrap;
}

.work-logs {
  background: #f0f8ff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #e3f2fd;
}

.work-logs-header {
  font-size: 12px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 8px;
}

.work-log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.work-log-item {
  background: white;
  border-radius: 4px;
  padding: 8px;
  border-left: 3px solid #2196f3;
}

.work-log-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 11px;
}

.work-log-developer {
  font-weight: 600;
  color: #1976d2;
}

.work-log-hours {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.work-log-date {
  color: #9e9e9e;
}

.work-log-description {
  font-size: 12px;
  color: #424242;
  line-height: 1.3;
}

.task-footer {
  border-top: 1px solid #e9ecef;
  padding-top: 8px;
  margin-top: 12px;
}

.task-date {
  font-size: 11px;
  color: #adb5bd;
  text-align: right;
}
</style>
