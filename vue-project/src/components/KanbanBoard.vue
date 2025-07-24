<template>
  <div class="kanban-board">
    <!-- AI Tools for task creation -->
    <tool
      name="create_task"
      description="Create a new task on the kanban board"
      @call="handleCreateTask"
    >
      <prop name="title" type="string" required description="Task title"></prop>
      <prop name="description" type="string" description="Task description (optional)"></prop>
      <prop name="priority" type="string" description="high, medium, or low (default: medium)"></prop>
      <prop name="status" type="string" description="todo, in-progress, or done (default: todo)"></prop>
      <prop name="tag" type="string" description="feature, bug, enhancement, etc. (default: feature)"></prop>
      <prop name="estimatedHours" type="number" description="Estimated hours to complete (default: 0)"></prop>
      <prop name="assignee" type="string" description="Person assigned to the task (optional)"></prop>
    </tool>

    <tool
      name="move_task"
      description="Move a task to a different column"
      @call="handleMoveTask"
    >
      <prop name="taskId" type="number" required description="ID of the task to move"></prop>
      <prop name="newStatus" type="string" required description="New status: todo, in-progress, or done"></prop>
    </tool>

    <tool
      name="update_task"
      description="Update task details"
      @call="handleUpdateTask"
    >
      <prop name="taskId" type="number" required description="ID of the task to update"></prop>
      <prop name="title" type="string" description="New task title"></prop>
      <prop name="description" type="string" description="New task description"></prop>
      <prop name="priority" type="string" description="New priority: high, medium, or low"></prop>
      <prop name="estimatedHours" type="number" description="New estimated hours"></prop>
    </tool>

    <!-- Context for AI awareness -->
    <context name="kanban_board_state">
      Total tasks: {{ totalTasks }}
      Todo: {{ todoTasks.length }} tasks
      In Progress: {{ inProgressTasks.length }} tasks  
      Done: {{ doneTasks.length }} tasks
      Recent tasks: {{ recentTasks.map(t => `${t.id}: ${t.title}`).join(', ') }}
    </context>

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

    <!-- AI Response Feedback -->
    <div v-if="aiResponse" class="ai-response" :class="aiResponse.type">
      <div class="response-content">
        <span class="response-icon">
          <svg v-if="aiResponse.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </span>
        {{ aiResponse.message }}
      </div>
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

    <!-- Modals -->
    <TaskModal :show="showTaskModal" :editing-task="editingTask" :task-form="taskForm" @close="closeModal"
      @save="saveTask" />

    <TaskDetailModal :show="showTaskDetailModal" :task="viewingTask" @close="closeTaskDetailModal" @edit-task="editTask"
      @delete-task="deleteTask" @log-work="logWork" />

    <WorkLogModal :show="showWorkLogModal" :task="workLogTask" :work-log-form="workLogForm" @close="closeWorkLogModal"
      @save="saveWorkLog" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import TaskCard from './TaskCard.vue'
import initialData from '../data/initialData.json'
import TaskModal from '@/modals/TaskModal.vue'
import TaskDetailModal from '@/modals/TaskDetailModal.vue'
import WorkLogModal from '@/modals/WorkLogModal.vue'

// Modal states
const showTaskModal = ref(false)
const showTaskDetailModal = ref(false)
const showWorkLogModal = ref(false)
const editingTask = ref(null)
const viewingTask = ref(null)
const workLogTask = ref(null)
const aiResponse = ref(null)

// Form data
const taskForm = reactive({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  tag: 'feature',
  estimatedHours: 0,
  comments: ''
})

const workLogForm = reactive({
  developer: '',
  hours: 0,
  description: ''
})

// Data
const columns = ref(initialData.columns)
let nextTaskId = Math.max(...initialData.columns.flatMap(col => col.tasks.map(t => t.id))) + 1

// Computed properties for context
const totalTasks = computed(() => 
  columns.value.reduce((sum, col) => sum + col.tasks.length, 0)
)

const todoTasks = computed(() => 
  columns.value.find(col => col.id === 'todo')?.tasks || []
)

const inProgressTasks = computed(() => 
  columns.value.find(col => col.id === 'in-progress')?.tasks || []
)

const doneTasks = computed(() => 
  columns.value.find(col => col.id === 'done')?.tasks || []
)

const recentTasks = computed(() => {
  const allTasks = columns.value.flatMap(col => col.tasks)
  return allTasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
})

// AI Tool Handlers
const handleCreateTask = (event) => {
  const { 
    title, 
    description = '', 
    priority = 'medium', 
    status = 'todo', 
    tag = 'feature', 
    estimatedHours = 0,
    assignee = ''
  } = event.detail

  // Validation
  if (!title || title.trim().length === 0) {
    event.detail.success = false
    event.detail.error = 'Task title is required'
    showAIResponse('Task title is required', 'error')
    return
  }

  // Validate status
  const validStatuses = ['todo', 'in-progress', 'done']
  const taskStatus = validStatuses.includes(status) ? status : 'todo'

  // Validate priority
  const validPriorities = ['high', 'medium', 'low']
  const taskPriority = validPriorities.includes(priority) ? priority : 'medium'

  // Create new task
  const newTask = {
    id: nextTaskId++,
    title: title.trim(),
    description: description.trim(),
    status: taskStatus,
    priority: taskPriority,
    tag: tag || 'feature',
    estimatedHours: Number(estimatedHours) || 0,
    comments: '',
    assignee: assignee.trim(),
    createdAt: new Date().toISOString(),
    workLogs: []
  }

  // Add to appropriate column
  const targetColumn = columns.value.find(col => col.id === taskStatus)
  if (targetColumn) {
    targetColumn.tasks.push(newTask)
    
    event.detail.success = true
    event.detail.message = `Task "${title}" created successfully`
    event.detail.taskId = newTask.id
    
    showAIResponse(`Task "${title}" created in ${taskStatus} column`, 'success')
  } else {
    event.detail.success = false
    event.detail.error = `Invalid status: ${taskStatus}`
    showAIResponse(`Invalid status: ${taskStatus}`, 'error')
  }
}

const handleMoveTask = (event) => {
  const { taskId, newStatus } = event.detail

  const task = findTaskById(taskId)
  if (!task) {
    event.detail.success = false
    event.detail.error = `Task with ID ${taskId} not found`
    showAIResponse(`Task with ID ${taskId} not found`, 'error')
    return
  }

  const validStatuses = ['todo', 'in-progress', 'done']
  if (!validStatuses.includes(newStatus)) {
    event.detail.success = false
    event.detail.error = `Invalid status: ${newStatus}`
    showAIResponse(`Invalid status: ${newStatus}`, 'error')
    return
  }

  if (task.status === newStatus) {
    event.detail.success = true
    event.detail.message = `Task is already in ${newStatus} column`
    showAIResponse(`Task is already in ${newStatus} column`, 'success')
    return
  }

  moveTaskToColumn(task, newStatus)
  
  event.detail.success = true
  event.detail.message = `Task "${task.title}" moved to ${newStatus}`
  showAIResponse(`Task "${task.title}" moved to ${newStatus}`, 'success')
}

const handleUpdateTask = (event) => {
  const { taskId, title, description, priority, estimatedHours } = event.detail

  const task = findTaskById(taskId)
  if (!task) {
    event.detail.success = false
    event.detail.error = `Task with ID ${taskId} not found`
    showAIResponse(`Task with ID ${taskId} not found`, 'error')
    return
  }

  // Update provided fields
  if (title !== undefined) task.title = title.trim()
  if (description !== undefined) task.description = description.trim()
  if (priority !== undefined && ['high', 'medium', 'low'].includes(priority)) {
    task.priority = priority
  }
  if (estimatedHours !== undefined) task.estimatedHours = Number(estimatedHours) || 0

  event.detail.success = true
  event.detail.message = `Task "${task.title}" updated successfully`
  showAIResponse(`Task "${task.title}" updated successfully`, 'success')
}

const showAIResponse = (message, type = 'success') => {
  aiResponse.value = { message, type }
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    aiResponse.value = null
  }, 5000)
}

// Task Modal Methods
const resetForm = () => {
  taskForm.title = ''
  taskForm.description = ''
  taskForm.status = 'todo'
  taskForm.priority = 'medium'
  taskForm.tag = 'feature'
  taskForm.estimatedHours = 0
  taskForm.comments = ''
}

const closeModal = () => {
  showTaskModal.value = false
  editingTask.value = null
  resetForm()
}

const saveTask = (formData) => {
  if (editingTask.value) {
    // Update existing task
    const task = findTaskById(editingTask.value)
    if (task) {
      Object.assign(task, formData)
      moveTaskToColumn(task, formData.status)
    }
  } else {
    // Create new task
    const newTask = {
      id: nextTaskId++,
      ...formData,
      createdAt: new Date().toISOString(),
      workLogs: []
    }

    const column = columns.value.find(col => col.id === formData.status)
    column.tasks.push(newTask)
  }

  closeModal()
}

// Task Detail Modal Methods
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

// Work Log Modal Methods
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

const saveWorkLog = (formData) => {
  if (!workLogTask.value) return

  const newWorkLog = {
    id: Date.now(),
    ...formData,
    timestamp: new Date().toISOString()
  }

  if (!workLogTask.value.workLogs) {
    workLogTask.value.workLogs = []
  }

  workLogTask.value.workLogs.push(newWorkLog)
  closeWorkLogModal()
}

// Utility Methods
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
      tag: task.tag || 'feature',
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

.ai-response {
  margin-bottom: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.ai-response.success {
  background-color: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.ai-response.error {
  background-color: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.response-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
}

</style>