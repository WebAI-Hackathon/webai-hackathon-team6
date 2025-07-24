<template>
  <div class="kanban-board">
    <div class="board-header">
      <div class="header-content">
        <h1>Project Management</h1>
        <p class="header-subtitle">Organize your workflow efficiently</p>
      </div>
      <button @click="showTaskModal = true" class="add-task-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        Add Task
      </button>
    </div>

    <div class="board-columns">
      <div v-for="column in columns" :key="column.id" class="column" @drop="onDrop($event, column.id)" @dragover.prevent
        @dragenter.prevent>
        <div class="column-header">
          <div class="column-title">
            <h3>{{ column.name }}</h3>
            <span class="task-count">{{ column.tasks.length }}</span>
          </div>
        </div>

        <div class="tasks-container">
          <TaskCard v-for="task in column.tasks" :key="task.id" :task="task" @edit-task="editTask"
            @delete-task="deleteTask" @log-work="logWork" @view-task="viewTask" />
        </div>
      </div>
    </div>

    <!-- Task Modal -->
    <div v-if="showTaskModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingTask ? 'Edit Task' : 'Create New Task' }}</h3>
          <button @click="closeModal" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveTask" class="task-form">
          <!-- ...existing form fields... -->
          <div class="form-group">
            <label>Task Title</label>
            <input v-model="taskForm.title" type="text" required placeholder="Enter task title" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="taskForm.description" placeholder="Enter task description" rows="3"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Status</label>
              <select v-model="taskForm.status" required>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div class="form-group">
              <label>Priority</label>
              <select v-model="taskForm.priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Estimated Hours</label>
            <input v-model.number="taskForm.estimatedHours" type="number" min="0" step="0.5" placeholder="0" />
          </div>

          <div class="form-group">
            <label>Comments</label>
            <textarea v-model="taskForm.comments" placeholder="Add any comments or notes" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">
              {{ editingTask ? 'Update Task' : 'Create Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Task Detail Modal -->
    <div v-if="showTaskDetailModal" class="modal-overlay" @click="closeTaskDetailModal">
      <div class="modal modal-large" @click.stop>
        <div class="modal-header">
          <div class="task-detail-header">
            <div class="task-detail-title">
              <h3>{{ viewingTask?.title }}</h3>
              <div class="task-priority-badge" :class="`priority-${viewingTask?.priority}`">
                {{ viewingTask?.priority?.toUpperCase() }}
              </div>
            </div>
            <div class="task-detail-status">
              Status: <span class="status-badge" :class="`status-${viewingTask?.status}`">
                {{ getStatusDisplayName(viewingTask?.status) }}
              </span>
            </div>
          </div>
          <button @click="closeTaskDetailModal" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div class="task-detail-content">
          <div class="task-detail-section">
            <h4>Description</h4>
            <p class="task-detail-description">
              {{ viewingTask?.description || 'No description provided' }}
            </p>
          </div>

          <div class="task-detail-section">
            <h4>Time Tracking</h4>
            <div class="time-tracking">
              <div class="time-item">
                <span class="time-label">Estimated:</span>
                <span class="time-value">{{ viewingTask?.estimatedHours || 0 }}h</span>
              </div>
              <div class="time-item">
                <span class="time-label">Logged:</span>
                <span class="time-value">{{ getTotalLoggedHours(viewingTask) }}h</span>
              </div>
              <div v-if="viewingTask?.estimatedHours > 0" class="progress-section">
                <div class="progress-bar-large">
                  <div class="progress-fill-large"
                    :style="{ width: Math.min((getTotalLoggedHours(viewingTask) / viewingTask.estimatedHours) * 100, 100) + '%' }"
                    :class="{ 'over-estimate': getTotalLoggedHours(viewingTask) > viewingTask.estimatedHours }"></div>
                </div>
                <span class="progress-text">
                  {{ Math.round((getTotalLoggedHours(viewingTask) / viewingTask.estimatedHours) * 100) }}% Complete
                </span>
              </div>
            </div>
          </div>

          <div v-if="viewingTask?.workLogs && viewingTask.workLogs.length > 0" class="task-detail-section">
            <div class="section-header">
              <h4>Work History</h4>
              <button @click="logWork(viewingTask.id)" class="log-work-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Log Work
              </button>
            </div>
            <div class="work-logs-detailed">
              <div v-for="log in viewingTask.workLogs" :key="log.id" class="work-log-detailed">
                <div class="work-log-header">
                  <div class="work-log-developer">{{ log.developer }}</div>
                  <div class="work-log-meta">
                    <span class="work-log-hours">{{ log.hours }}h</span>
                    <span class="work-log-date">{{ formatDetailedDate(log.timestamp) }}</span>
                  </div>
                </div>
                <div class="work-log-description">{{ log.description }}</div>
              </div>
            </div>
          </div>
          <div v-else class="task-detail-section">
            <div class="section-header">
              <h4>Work History</h4>
              <button @click="logWork(viewingTask.id)" class="log-work-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Log Work
              </button>
            </div>
            <p class="no-work-logs">No work has been logged for this task yet.</p>
          </div>

          <div v-if="viewingTask?.comments" class="task-detail-section">
            <h4>Comments</h4>
            <p class="task-comments-text">{{ viewingTask.comments }}</p>
          </div>

          <div class="task-detail-section">
            <h4>Task Info</h4>
            <div class="task-info-grid">
              <div class="info-item">
                <span class="info-label">Created:</span>
                <span class="info-value">{{ formatDetailedDate(viewingTask?.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Task ID:</span>
                <span class="info-value">#{{ viewingTask?.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="task-detail-actions">
          <button @click="editTask(viewingTask.id)" class="edit-task-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            Edit Task
          </button>
          <button @click="deleteTask(viewingTask.id)" class="delete-task-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
            Delete Task
          </button>
        </div>
      </div>
    </div>

    <!-- Work Log Modal -->
    <div v-if="showWorkLogModal" class="modal-overlay" @click="closeWorkLogModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Log Work - {{ workLogTask?.title }}</h3>
          <button @click="closeWorkLogModal" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveWorkLog" class="task-form">
          <div class="form-group">
            <label>Developer Name</label>
            <input v-model="workLogForm.developer" type="text" required placeholder="Enter your name" />
          </div>

          <div class="form-group">
            <label>Hours Worked</label>
            <input v-model.number="workLogForm.hours" type="number" min="0.25" step="0.25" required placeholder="0.5" />
          </div>

          <div class="form-group">
            <label>Work Description</label>
            <textarea v-model="workLogForm.description" placeholder="Describe what you worked on..." rows="4"
              required></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeWorkLogModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Log Work</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import TaskCard from './TaskCard.vue'

const showTaskModal = ref(false)
const showTaskDetailModal = ref(false)
const showWorkLogModal = ref(false)
const editingTask = ref(null)
const viewingTask = ref(null)
const workLogTask = ref(null)

const taskForm = reactive({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  estimatedHours: 0,
  comments: ''
})

const workLogForm = reactive({
  developer: '',
  hours: 0,
  description: ''
})

const columns = ref([
  {
    id: 'todo',
    name: 'To Do',
    tasks: [
      {
        id: 1,
        title: 'Setup Project Structure',
        description: 'Initialize the Vue project and setup basic components',
        status: 'todo',
        priority: 'high',
        estimatedHours: 4,
        comments: 'This is the first task to get started',
        createdAt: new Date().toISOString(),
        workLogs: []
      }
    ]
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    tasks: [
      {
        id: 2,
        title: 'Implement Login Function',
        description: 'Create OAuth integration and frontend login page',
        status: 'in-progress',
        priority: 'medium',
        estimatedHours: 8,
        comments: 'Need to implement both OAuth and frontend',
        createdAt: new Date().toISOString(),
        workLogs: [
          {
            id: 1,
            developer: 'John Doe',
            hours: 2,
            description: 'Implemented OAuth integration with Google and GitHub providers',
            timestamp: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 2,
            developer: 'Jane Smith',
            hours: 3,
            description: 'Developed the frontend login page with responsive design',
            timestamp: new Date(Date.now() - 43200000).toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'done',
    name: 'Done',
    tasks: []
  }
])

let nextTaskId = 3


const viewTask = (taskId) => {
  const task = findTaskById(taskId)
  if (task) {
    viewingTask.value = task
    showTaskDetailModal.value = true
  }
}

const closeTaskDetailModal = () => {
  showTaskDetailModal.value = false
  viewingTask.value = null
}

const getTotalLoggedHours = (task) => {
  if (!task?.workLogs) return 0
  return task.workLogs.reduce((total, log) => total + log.hours, 0)
}

const getStatusDisplayName = (status) => {
  const statusMap = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done'
  }
  return statusMap[status] || status
}

const formatDetailedDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ...existing code...
const resetForm = () => {
  taskForm.title = ''
  taskForm.description = ''
  taskForm.status = 'todo'
  taskForm.priority = 'medium'
  taskForm.estimatedHours = 0
  taskForm.comments = ''
}

const closeModal = () => {
  showTaskModal.value = false
  editingTask.value = null
  resetForm()
}

const saveTask = () => {
  if (editingTask.value) {
    // Update existing task
    const task = findTaskById(editingTask.value)
    if (task) {
      Object.assign(task, {
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        priority: taskForm.priority,
        estimatedHours: taskForm.estimatedHours,
        comments: taskForm.comments
      })

      // Move task to correct column if status changed
      moveTaskToColumn(task, taskForm.status)
    }
  } else {
    // Create new task
    const newTask = {
      id: nextTaskId++,
      title: taskForm.title,
      description: taskForm.description,
      status: taskForm.status,
      priority: taskForm.priority,
      estimatedHours: taskForm.estimatedHours,
      comments: taskForm.comments,
      createdAt: new Date().toISOString(),
      workLogs: []
    }

    const column = columns.value.find(col => col.id === taskForm.status)
    column.tasks.push(newTask)
  }

  closeModal()
}

const findTaskById = (taskId) => {
  for (const column of columns.value) {
    const task = column.tasks.find(t => t.id === taskId)
    if (task) return task
  }
  return null
}

const moveTaskToColumn = (task, newStatus) => {
  // Remove from current column
  for (const column of columns.value) {
    const index = column.tasks.findIndex(t => t.id === task.id)
    if (index !== -1) {
      column.tasks.splice(index, 1)
      break
    }
  }

  // Add to new column
  const targetColumn = columns.value.find(col => col.id === newStatus)
  task.status = newStatus
  targetColumn.tasks.push(task)
}

const editTask = (taskId) => {
  closeTaskDetailModal() // Close detail modal if open
  const task = findTaskById(taskId)
  if (task) {
    editingTask.value = taskId
    Object.assign(taskForm, {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      estimatedHours: task.estimatedHours,
      comments: task.comments
    })
    showTaskModal.value = true
  }
}

const deleteTask = (taskId) => {
  if (confirm('Are you sure you want to delete this task?')) {
    closeTaskDetailModal() // Close detail modal if open
    for (const column of columns.value) {
      const index = column.tasks.findIndex(t => t.id === taskId)
      if (index !== -1) {
        column.tasks.splice(index, 1)
        break
      }
    }
  }
}

const onDrop = (event, columnId) => {
  const taskId = parseInt(event.dataTransfer.getData('taskId'))
  const task = findTaskById(taskId)

  if (task && task.status !== columnId) {
    moveTaskToColumn(task, columnId)
  }
}

const logWork = (taskId) => {
  const task = findTaskById(taskId)
  if (task) {
    workLogTask.value = task
    showWorkLogModal.value = true
  }
}

const resetWorkLogForm = () => {
  workLogForm.developer = ''
  workLogForm.hours = 0
  workLogForm.description = ''
}

const closeWorkLogModal = () => {
  showWorkLogModal.value = false
  workLogTask.value = null
  resetWorkLogForm()
}

const saveWorkLog = () => {
  if (!workLogTask.value) return

  const newWorkLog = {
    id: Date.now(),
    developer: workLogForm.developer,
    hours: workLogForm.hours,
    description: workLogForm.description,
    timestamp: new Date().toISOString()
  }

  if (!workLogTask.value.workLogs) {
    workLogTask.value.workLogs = []
  }

  workLogTask.value.workLogs.push(newWorkLog)

  closeWorkLogModal()
}
</script>

<style scoped>
.kanban-board {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  color: #1f2937;
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 700;
}

.header-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

.add-task-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.add-task-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.board-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.column {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  min-height: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.column-header {
  margin-bottom: 20px;
}

.column-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
}

.column-title h3 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.task-count {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.task-detail-header {
  flex: 1;
}

.task-detail-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.task-priority-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.task-priority-badge.priority-high {
  background: #ef4444;
}

.task-priority-badge.priority-medium {
  background: #f59e0b;
}

.task-priority-badge.priority-low {
  background: #10b981;
}

.task-detail-status {
  font-size: 14px;
  color: #6b7280;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.status-todo {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.status-in-progress {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge.status-done {
  background: #d1fae5;
  color: #065f46;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.task-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #f3f4f6;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #8b5cf6;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn,
.save-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.save-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

/* Task Detail Modal Styles */
.task-detail-content {
  padding: 24px;
}

.task-detail-section {
  margin-bottom: 24px;
}

.task-detail-section h4 {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.log-work-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.log-work-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.task-detail-description {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.time-tracking {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
}

.time-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.time-label {
  color: #6b7280;
  font-weight: 500;
}

.time-value {
  color: #1f2937;
  font-weight: 600;
}

.progress-section {
  margin-top: 12px;
}

.progress-bar-large {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill-large {
  height: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-fill-large.over-estimate {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.progress-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.work-logs-detailed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.work-log-detailed {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #3b82f6;
}

.work-log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.work-log-developer {
  font-weight: 600;
  color: #1f2937;
}

.work-log-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.work-log-hours {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.work-log-date {
  color: #9ca3af;
}

.work-log-description {
  color: #6b7280;
  line-height: 1.5;
}

.no-work-logs {
  color: #9ca3af;
  font-style: italic;
  margin: 0;
}

.task-comments-text {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.task-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  color: #1f2937;
  font-weight: 500;
}

.task-detail-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #f3f4f6;
  justify-content: flex-end;
}

.edit-task-btn,
.delete-task-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.edit-task-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.edit-task-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.delete-task-btn {
  background: #f3f4f6;
  color: #ef4444;
}

.delete-task-btn:hover {
  background: #fef2f2;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .board-columns {
    grid-template-columns: 1fr;
  }

  .board-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .task-info-grid {
    grid-template-columns: 1fr;
  }

  .task-detail-actions {
    flex-direction: column;
  }
}
</style>