<template>
  <div class="kanban-board">

    <tool name="create_task" description="Create a new task in the current project" @call="handleCreateTaskVoix">
      <prop name="title" type="string" required description="Task title"></prop>
      <prop name="description" type="string" description="Task description (optional)"></prop>
      <prop name="status" type="string" description="Task status: todo, in-progress, or done (default: todo)"></prop>
      <prop name="priority" type="string" description="Task priority: low, medium, or high (default: medium)"></prop>
      <prop name="tag" type="string" description="Task tag: bug-fix, feature, or organisational (default: feature)">
      </prop>
      <prop name="estimatedHours" type="number" description="Estimated hours to complete the task (default: 0)"></prop>
      <prop name="comments" type="string" description="Additional comments or notes for the task (optional)"></prop>
    </tool>

    <!-- Context for current project state -->
    <context name="kanban_project_state">
      Current project: {{ currentProject?.name || 'No project selected' }}
      Project ID: {{ currentProject?.id || 'N/A' }}
      Total tasks: {{ currentProject?.tasks?.length || 0 }}
      Todo tasks: {{ todoTasks.length }}
      In Progress tasks: {{ inProgressTasks.length }}
      Done tasks: {{ doneTasks.length }}
      Available statuses: todo, in-progress, done
      Available priorities: low, medium, high
      Available tags: bug-fix, feature, organisational
      Recent tasks: {{recentTasks.map(t => `${t.id}: ${t.title} (${t.status})`).join(', ')}}
    </context>

    <div class="board-header">
      <div class="header-content">
        <h1>{{ currentProject?.name || 'Project Management' }}</h1>
        <p class="header-subtitle">{{ currentProject?.description || 'Organize your workflow efficiently' }}</p>
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
            @delete-task="handleDeleteTask" @log-work="logWork" @view-task="viewTask" />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TaskModal :show="showTaskModal" :editing-task="editingTask" :task-form="taskForm" @close="closeModal"
      @save="saveTask" />

    <TaskDetailModal :show="showTaskDetailModal" :task="viewingTask" @close="closeTaskDetailModal" @edit-task="editTask"
      @delete-task="handleDeleteTask" @log-work="logWork" />

    <WorkLogModal :show="showWorkLogModal" :task="workLogTask" :work-log-form="workLogForm" @close="closeWorkLogModal"
      @save="saveWorkLog" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import TaskCard from './TaskCard.vue'
import TaskModal from '@/modals/TaskModal.vue'
import TaskDetailModal from '@/modals/TaskDetailModal.vue'
import WorkLogModal from '@/modals/WorkLogModal.vue'
import {
  projects,
  currentProject,
  setCurrentProject,
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  findTask,
  addWorkLog
} from '../stores/projectStore.js'

const route = useRoute()

// Watch for route changes and update current project
watch(() => route.params.projectId, (newProjectId) => {
  if (newProjectId) {
    setCurrentProject(parseInt(newProjectId))
  }
}, { immediate: true })

// Create columns based on the current project's tasks
const columns = computed(() => {
  if (!currentProject.value) return []

  return [
    {
      id: 'todo',
      name: 'To Do',
      tasks: currentProject.value.tasks.filter(task => task.status === 'todo')
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      tasks: currentProject.value.tasks.filter(task => task.status === 'in-progress')
    },
    {
      id: 'done',
      name: 'Done',
      tasks: currentProject.value.tasks.filter(task => task.status === 'done')
    }
  ]
})

// Modal states
const showTaskModal = ref(false)
const showTaskDetailModal = ref(false)
const showWorkLogModal = ref(false)
const editingTask = ref(null)
const viewingTask = ref(null)
const workLogTask = ref(null)

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
  developer: 'Pritesh Soni',
  hours: 0,
  description: ''
})

// Task Modal Methods
const resetForm = () => {
  Object.assign(taskForm, {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    tag: 'feature',
    estimatedHours: 0,
    comments: ''
  })
}

const closeModal = () => {
  showTaskModal.value = false
  editingTask.value = null
  resetForm()
}

const saveTask = (formData) => {
  if (!currentProject.value) return

  if (editingTask.value) {
    // Update existing task
    updateTask(currentProject.value.id, editingTask.value, formData)
  } else {
    // Create new task
    addTask(currentProject.value.id, formData)
  }
  closeModal()
}

// Task Detail Modal Methods
const viewTask = (taskId) => {
  const task = findTask(currentProject.value?.id, taskId)
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
  const task = findTask(currentProject.value?.id, taskId)
  if (task) {
    workLogTask.value = task
    showWorkLogModal.value = true
  }
}

const resetWorkLogForm = () => {
  Object.assign(workLogForm, {
    developer: 'Pritesh Soni',
    hours: 0,
    description: ''
  })
}

const closeWorkLogModal = () => {
  showWorkLogModal.value = false
  workLogTask.value = null
  resetWorkLogForm()
}

const saveWorkLog = (formData) => {
  if (!workLogTask.value || !currentProject.value) return

  addWorkLog(currentProject.value.id, workLogTask.value.id, formData)
  closeWorkLogModal()
}

// Task Actions
const editTask = (taskId) => {
  closeTaskDetailModal()
  const task = findTask(currentProject.value?.id, taskId)
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

const handleDeleteTask = (taskId) => {
  if (confirm('Are you sure you want to delete this task?')) {
    closeTaskDetailModal()
    if (currentProject.value) {
      deleteTask(currentProject.value.id, taskId)
    }
  }
}

const onDrop = (event, columnId) => {
  const taskId = parseInt(event.dataTransfer.getData('taskId'))
  if (currentProject.value) {
    moveTask(currentProject.value.id, taskId, columnId)
  }
}

const handleCreateTaskVoix = (event) => {
  const {
    title,
    description = '',
    status = 'todo',
    priority = 'medium',
    tag = 'feature',
    estimatedHours = 0,
    comments = ''
  } = event.detail

  // Validation
  if (!title || title.trim() === '') {
    event.detail.success = false
    event.detail.error = 'Task title is required'
    return
  }

  if (!currentProject.value) {
    event.detail.success = false
    event.detail.error = 'No project selected. Please navigate to a project first.'
    return
  }

  // Validate status
  const validStatuses = ['todo', 'in-progress', 'done']
  if (!validStatuses.includes(status)) {
    event.detail.success = false
    event.detail.error = `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    return
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high']
  if (!validPriorities.includes(priority)) {
    event.detail.success = false
    event.detail.error = `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
    return
  }

  // Validate tag
  const validTags = ['bug-fix', 'feature', 'organisational']
  if (!validTags.includes(tag)) {
    event.detail.success = false
    event.detail.error = `Invalid tag. Must be one of: ${validTags.join(', ')}`
    return
  }

  // Validate estimated hours
  if (estimatedHours < 0) {
    event.detail.success = false
    event.detail.error = 'Estimated hours cannot be negative'
    return
  }

  try {
    // Create the task using your existing logic
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      tag,
      estimatedHours: Number(estimatedHours),
      comments: comments.trim()
    }

    // Use your existing addTask function from the store
    const newTask = addTask(currentProject.value.id, taskData)

    // Success response
    event.detail.success = true
    event.detail.message = `Task "${title}" created successfully in ${currentProject.value.name}`
    event.detail.taskId = newTask.id
    event.detail.taskData = newTask

  } catch (error) {
    event.detail.success = false
    event.detail.error = `Failed to create task: ${error.message}`
  }
}


// Computed properties for context
const todoTasks = computed(() =>
  currentProject.value?.tasks?.filter(task => task.status === 'todo') || []
)

const inProgressTasks = computed(() =>
  currentProject.value?.tasks?.filter(task => task.status === 'in-progress') || []
)

const doneTasks = computed(() =>
  currentProject.value?.tasks?.filter(task => task.status === 'done') || []
)

const recentTasks = computed(() => {
  if (!currentProject.value?.tasks) return []
  return currentProject.value.tasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

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