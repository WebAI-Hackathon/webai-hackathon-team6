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
      <prop name="comments" type="string" description="New comments for the task"></prop>
    </tool>

    <tool
      name="addworkhistory"
      description="Log work hours to the task history with a work description and hours worked"
      @call="handleLogWork"
    >
      <prop name="taskId" type="number" required description="ID of the task to log work for"></prop>
      <prop name="hours" type="number" required description="Number of hours worked"></prop>
      <prop name="description" type="string" required description="Description of work performed (required)"></prop>
      <prop name="developer" type="string" required description="Name of the developer who did the work"></prop>
      <prop name="date" type="string" description="Date of work in YYYY-MM-DD format (default: today)"></prop>
    </tool>

    <tool
      name="voice_log_work"
      description="Process voice commands to log work for tasks"
      @call="handleVoiceLogWork"
    >
      <prop name="voiceCommand" type="string" required description="Voice command transcription"></prop>
      <prop name="language" type="string" description="Language code (default: de-DE)"></prop>
    </tool>

    <tool
      name="voix_add_work_log"
      description="VOIX tool to add work log entries to task work history via voice commands"
      @call="handleVoixAddWorkLog"
    >
      <prop name="taskId" type="number" required description="ID of the task to add work log to"></prop>
      <prop name="hours" type="number" required description="Number of hours worked"></prop>
      <prop name="description" type="string" required description="Description of work performed"></prop>
      <prop name="developer" type="string" description="Name of the developer who did the work (defaults to current user: Magnus)"></prop>
      <prop name="source" type="string" description="Source of the log entry (default: 'voix')"></prop>
      <prop name="date" type="string" description="Date of work in YYYY-MM-DD format (default: today)"></prop>
    </tool>

    <!-- Context for AI awareness -->
    <context name="kanban_board_state">
      Total tasks: {{ totalTasks }}
      Todo: {{ todoTasks.length }} tasks
      In Progress: {{ inProgressTasks.length }} tasks  
      Done: {{ doneTasks.length }} tasks
      Recent tasks: {{ recentTasks.map(t => `${t.id}: ${t.title}`).join(', ') }}
      Total logged hours: {{ totalLoggedHours }}
      Voice Recognition: {{ isListening ? 'Active' : 'Inactive' }}
      Work History Entries: {{ workHistoryCount }}
      Recent Work Logs: {{ recentWorkLogs.map(w => `${w.developer}: ${w.hours}h on Task ${w.taskId}`).join(', ') }}
    </context>

    <context name="voix_user_context">
      Current User: {{ currentUser.name }}
      User Role: {{ currentUser.role }}
      Default Developer Name: {{ currentUser.name }}
      VOIX Status: {{ currentUser.voixActive ? 'Active' : 'Inactive' }}
      User Preferences: {{ currentUser.language }} language for voice commands
      
      Available Tasks:
      Todo Tasks: {{ todoTasks.map(t => `ID ${t.id}: "${t.title}" - ${t.description ? t.description.substring(0, 100) + (t.description.length > 100 ? '...' : '') : 'No description'} (${t.estimatedHours}h estimated, Priority: ${t.priority})`).join(' | ') || 'None' }}
      In Progress Tasks: {{ inProgressTasks.map(t => `ID ${t.id}: "${t.title}" - ${t.description ? t.description.substring(0, 100) + (t.description.length > 100 ? '...' : '') : 'No description'} (${t.estimatedHours}h estimated, Priority: ${t.priority}, ${(t.workLogs || []).reduce((sum, log) => sum + log.hours, 0)}h logged)`).join(' | ') || 'None' }}
      Done Tasks: {{ doneTasks.map(t => `ID ${t.id}: "${t.title}" - ${t.description ? t.description.substring(0, 100) + (t.description.length > 100 ? '...' : '') : 'No description'} (${(t.workLogs || []).reduce((sum, log) => sum + log.hours, 0)}h total logged)`).join(' | ') || 'None' }}
      
      Recent Activity:
      Last 3 Tasks: {{ recentTasks.map(t => `ID ${t.id}: "${t.title}" (${t.status})`).join(', ') || 'None' }}
      Recent Work Logs: {{ recentWorkLogs.map(w => `${w.developer}: ${w.hours}h on Task ${w.taskId} "${w.taskTitle}"`).join(', ') || 'None' }}
      
      Task Statistics:
      Total Tasks: {{ totalTasks }}
      Total Hours Logged: {{ totalLoggedHours }}h
      Work History Entries: {{ workHistoryCount }}
    </context>

    <div class="board-header">
      <div class="header-content">
        <h1>Project Management</h1>
        <p class="header-subtitle">Organize your workflow efficiently</p>
      </div>
      <div class="header-actions">
        <button @click="showTaskModal = true" class="add-task-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Task
        </button>
      </div>
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
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

// Voice Recognition State
const isListening = ref(false)
const speechRecognitionSupported = ref(false)
const voiceFeedback = ref(null)
let recognition = null

// VOIX User Context
const currentUser = reactive({
  name: 'Magnus',
  role: 'Developer/Project Manager',
  language: 'en-US',
  voixActive: true
})

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

// Voice Recognition Setup
onMounted(() => {
  initSpeechRecognition()
})

onUnmounted(() => {
  if (recognition) {
    recognition.stop()
  }
})

const initSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  
  if (!SpeechRecognition) {
    speechRecognitionSupported.value = false
    return
  }

  speechRecognitionSupported.value = true
  recognition = new SpeechRecognition()
  
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'en-US'
  
  recognition.onstart = () => {
    isListening.value = true
    showVoiceFeedback('🎤 Listening... Say "Log work for task [number]" or "Add [X] hours to work history task [Y]"', 'info')
  }
  
  recognition.onend = () => {
    isListening.value = false
  }
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase()
    // Call the main function that handles both regular logging and history addition
    processVoiceLogWork(transcript)
  }
  
  recognition.onerror = (event) => {
    isListening.value = false
    showVoiceFeedback(`Speech error: ${event.error}`, 'error')
  }
}

const toggleVoiceRecognition = () => {
  if (!speechRecognitionSupported.value) return
  
  if (isListening.value) {
    recognition.stop()
  } else {
    recognition.start()
  }
}

const processVoiceLogWork = (transcript) => {
  try {
    // Match different patterns for work logging
    // Pattern: "Log [X] hours for task [ID] by [Developer] for [Description]"
    // Pattern: "Work time [X] hours task [ID] [Developer] [Description]"
    // Pattern: "Add [X] hours to work history task [ID] [Developer] [Description]"
    
    const patterns = [
      /log\s+(\d+(?:[.,]\d+)?)\s+hours?\s+for\s+task\s+(\d+)\s+by\s+([^,]+?)(?:\s+for\s+(.+))?$/i,
      /work\s+time\s+(\d+(?:[.,]\d+)?)\s+hours?\s+task\s+(\d+)\s+([^,]+?)(?:\s+(.+))?$/i,
      /add\s+(\d+(?:[.,]\d+)?)\s+hours?\s+to\s+work\s+history\s+task\s+(\d+)\s+([^,]+?)(?:\s+(.+))?$/i,
      /(\d+(?:[.,]\d+)?)\s+hours?\s+task\s+(\d+)\s+([^,]+?)(?:\s+(.+))?$/i,
      /work\s+log\s+(\d+(?:[.,]\d+)?)\s+hours?\s+task\s+(\d+)\s+([^,]+?)(?:\s+(.+))?$/i
    ]
    
    let match = null
    for (const pattern of patterns) {
      match = transcript.match(pattern)
      if (match) break
    }
    
    if (match) {
      const hours = parseFloat(match[1].replace(',', '.'))
      const taskId = parseInt(match[2])
      const developer = match[3].trim()
      const description = match[4] ? match[4].trim() : 'Work added to history via voice'
      
      addWorkLogToHistory(taskId, hours, description, developer)
    } else {
      showVoiceFeedback('Format not recognized. Say: "Log 3 hours for task 1 by Max for bugfixing" or "Add 2 hours to work history task 2 Anna testing"', 'error')
    }
  } catch (error) {
    showVoiceFeedback('Error processing work time command', 'error')
  }
}

const logWorkViaVoice = (taskId, hours, description, developer) => {
  const task = findTaskById(taskId)
  if (!task) {
    showVoiceFeedback(`Task with ID ${taskId} not found`, 'error')
    return
  }

  if (hours <= 0) {
    showVoiceFeedback('Hours must be greater than 0', 'error')
    return
  }

  if (!developer || developer.trim().length === 0) {
    showVoiceFeedback('Developer name is required', 'error')
    return
  }

  const newWorkLog = {
    id: Date.now(),
    hours: hours,
    description: description || 'Work logged via voice',
    developer: developer,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }

  if (!task.workLogs) {
    task.workLogs = []
  }

  task.workLogs.push(newWorkLog)
  
  const totalTaskHours = task.workLogs.reduce((sum, log) => sum + log.hours, 0)
  showVoiceFeedback(`${hours} hours logged for "${task.title}" by ${developer}. Total: ${totalTaskHours}h`, 'success')
}

const addWorkLogToHistory = (taskId, hours, description, developer) => {
  const task = findTaskById(taskId)
  if (!task) {
    showVoiceFeedback(`Task with ID ${taskId} not found`, 'error')
    return
  }

  if (hours <= 0) {
    showVoiceFeedback('Hours must be greater than 0', 'error')
    return
  }

  if (!developer || developer.trim().length === 0) {
    showVoiceFeedback('Developer name is required for work history', 'error')
    return
  }

  // Create comprehensive work log entry for history
  const workLogEntry = {
    id: Date.now(),
    hours: hours,
    description: description || 'Work time added to history via voice',
    developer: developer.trim(),
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    source: 'voice', // Mark as voice-created
    taskTitle: task.title,
    taskId: taskId,
    sessionId: `voice-${Date.now()}` // Unique session identifier
  }

  // Initialize workLogs array if it doesn't exist
  if (!task.workLogs) {
    task.workLogs = []
  }

  // Add to task's work history
  task.workLogs.push(workLogEntry)
  
  // Calculate totals
  const totalTaskHours = task.workLogs.reduce((sum, log) => sum + log.hours, 0)
  const developerHours = task.workLogs
    .filter(log => log.developer === developer)
    .reduce((sum, log) => sum + log.hours, 0)
  
  // Enhanced feedback with history context
  showVoiceFeedback(
    `✓ ${hours}h added to work history: "${task.title}" by ${developer}. Task Total: ${totalTaskHours}h, ${developer}: ${developerHours}h`, 
    'success'
  )

  // Also show AI response for consistency
  showAIResponse(`Work log added to history: ${hours}h by ${developer} on "${task.title}"`, 'success')
}

const showVoiceFeedback = (message, type = 'info') => {
  voiceFeedback.value = { message, type }
  
  setTimeout(() => {
    voiceFeedback.value = null
  }, 5000)
}

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

const totalLoggedHours = computed(() => {
  const allTasks = columns.value.flatMap(col => col.tasks)
  return allTasks.reduce((total, task) => {
    if (task.workLogs && task.workLogs.length > 0) {
      return total + task.workLogs.reduce((taskTotal, log) => taskTotal + (log.hours || 0), 0)
    }
    return total
  }, 0)
})

const workHistoryCount = computed(() => {
  const allTasks = columns.value.flatMap(col => col.tasks)
  return allTasks.reduce((total, task) => {
    return total + (task.workLogs ? task.workLogs.length : 0)
  }, 0)
})

const recentWorkLogs = computed(() => {
  const allTasks = columns.value.flatMap(col => col.tasks)
  const allWorkLogs = allTasks.flatMap(task => 
    (task.workLogs || []).map(log => ({
      ...log,
      taskId: task.id,
      taskTitle: task.title
    }))
  )
  return allWorkLogs
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
  const { taskId, title, description, priority, estimatedHours, comments } = event.detail

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
  if (comments !== undefined) task.comments = comments.trim()

  event.detail.success = true
  event.detail.message = `Task "${task.title}" updated successfully`
  showAIResponse(`Task "${task.title}" updated successfully`, 'success')
}

const handleLogWork = (event) => {
  const { taskId, hours, description, developer, date } = event.detail

  // Validation
  if (!hours || hours <= 0) {
    event.detail.success = false
    event.detail.error = 'Hours must be a positive number'
    showAIResponse('Hours must be a positive number', 'error')
    return
  }

  if (!description || description.trim().length === 0) {
    event.detail.success = false
    event.detail.error = 'Work description is required'
    showAIResponse('Work description is required', 'error')
    return
  }

  if (!developer || developer.trim().length === 0) {
    event.detail.success = false
    event.detail.error = 'Developer name is required'
    showAIResponse('Developer name is required', 'error')
    return
  }

  const task = findTaskById(taskId)
  if (!task) {
    event.detail.success = false
    event.detail.error = `Task with ID ${taskId} not found`
    showAIResponse(`Task with ID ${taskId} not found`, 'error')
    return
  }

  // Validate date format if provided
  let workDate = new Date().toISOString()
  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      event.detail.success = false
      event.detail.error = 'Date must be in YYYY-MM-DD format'
      showAIResponse('Date must be in YYYY-MM-DD format', 'error')
      return
    }
    workDate = new Date(date + 'T00:00:00').toISOString()
  }

  // Create work log entry
  const newWorkLog = {
    id: Date.now(),
    hours: Number(hours),
    description: description.trim(),
    developer: developer.trim(),
    timestamp: workDate,
    createdAt: new Date().toISOString()
  }

  // Initialize workLogs array if it doesn't exist
  if (!task.workLogs) {
    task.workLogs = []
  }

  // Add work log to task
  task.workLogs.push(newWorkLog)

  // Calculate total logged hours for this task
  const totalTaskHours = task.workLogs.reduce((sum, log) => sum + log.hours, 0)

  event.detail.success = true
  event.detail.message = `Logged ${hours} hours to task "${task.title}" by ${developer}. Total logged: ${totalTaskHours} hours`
  event.detail.workLogId = newWorkLog.id
  event.detail.totalTaskHours = totalTaskHours

  showAIResponse(`Logged ${hours} hours to "${task.title}" by ${developer}`, 'success')
}

const handleVoiceLogWork = (event) => {
  const { voiceCommand, language = 'en-US' } = event.detail
  
  if (recognition) {
    recognition.lang = language
  }
  
  processVoiceLogWork(voiceCommand.toLowerCase())
  
  event.detail.success = true
  event.detail.message = 'Voice work log command processed'
}

const handleVoixAddWorkLog = (event) => {
  const { taskId, hours, description, developer, source = 'voix', date } = event.detail

  // Use current user as default developer if none specified
  const workDeveloper = developer || currentUser.name

  // Validation
  if (!hours || hours <= 0) {
    event.detail.success = false
    event.detail.error = 'Hours must be a positive number'
    showAIResponse('Hours must be a positive number', 'error')
    return
  }

  if (!description || description.trim().length === 0) {
    event.detail.success = false
    event.detail.error = 'Work description is required'
    showAIResponse('Work description is required', 'error')
    return
  }

  const task = findTaskById(taskId)
  if (!task) {
    event.detail.success = false
    event.detail.error = `Task with ID ${taskId} not found`
    showAIResponse(`Task with ID ${taskId} not found`, 'error')
    return
  }

  // Validate date format if provided
  let workDate = new Date().toISOString()
  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      event.detail.success = false
      event.detail.error = 'Date must be in YYYY-MM-DD format'
      showAIResponse('Date must be in YYYY-MM-DD format', 'error')
      return
    }
    workDate = new Date(date + 'T00:00:00').toISOString()
  }

  // Update workLogForm with the provided information
  workLogForm.developer = workDeveloper.trim()
  workLogForm.hours = Number(hours)
  workLogForm.description = description.trim()

  // Create comprehensive work log entry for VOIX
  const voixWorkLogEntry = {
    id: Date.now(),
    hours: Number(hours),
    description: description.trim(),
    developer: workDeveloper.trim(),
    timestamp: workDate,
    createdAt: new Date().toISOString(),
    source: source, // Mark source (voix, voice, manual, etc.)
    taskTitle: task.title,
    taskId: taskId,
    sessionId: `voix-${Date.now()}`, // Unique session identifier
    loggedByUser: currentUser.name // Track who logged this entry
  }

  // Initialize workLogs array if it doesn't exist
  if (!task.workLogs) {
    task.workLogs = []
  }

  // Add work log entry to task's work history
  task.workLogs.push(voixWorkLogEntry)

  // Calculate totals for feedback
  const totalTaskHours = task.workLogs.reduce((sum, log) => sum + log.hours, 0)
  const developerHours = task.workLogs
    .filter(log => log.developer === workDeveloper)
    .reduce((sum, log) => sum + log.hours, 0)

  event.detail.success = true
  event.detail.message = `VOIX: Added ${hours}h work log to "${task.title}" by ${workDeveloper}. Task total: ${totalTaskHours}h, Developer total: ${developerHours}h`
  event.detail.workLogId = voixWorkLogEntry.id
  event.detail.totalTaskHours = totalTaskHours
  event.detail.developerHours = developerHours

  showAIResponse(`VOIX: ${hours}h work log added to "${task.title}" by ${workDeveloper}`, 'success')
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
  workLogForm.developer = 'Pritesh Soni'
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

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
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