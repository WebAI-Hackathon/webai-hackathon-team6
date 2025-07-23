<template>
  <div class="kanban-board">
    <div class="board-header">
      <h1>Project Management Tool</h1>
      <button @click="showTaskModal = true" class="add-task-btn">
        + Add New Task
      </button>
    </div>

    <div class="board-columns">
      <div 
        v-for="column in columns" 
        :key="column.id"
        class="column"
        @drop="onDrop($event, column.id)"
        @dragover.prevent
        @dragenter.prevent
      >
        <div class="column-header">
          <h3>{{ column.name }}</h3>
          <span class="task-count">{{ column.tasks.length }}</span>
        </div>
        
        <div class="tasks-container">
          <TaskCard
            v-for="task in column.tasks"
            :key="task.id"
            :task="task"
            @edit-task="editTask"
            @delete-task="deleteTask"
            @log-work="logWork"
          />
        </div>
      </div>
    </div>

    <!-- Task Modal -->
    <div v-if="showTaskModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingTask ? 'Edit Task' : 'Create New Task' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="saveTask" class="task-form">
          <div class="form-group">
            <label>Task Title</label>
            <input 
              v-model="taskForm.title" 
              type="text" 
              required 
              placeholder="Enter task title"
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea 
              v-model="taskForm.description" 
              placeholder="Enter task description"
              rows="3"
            ></textarea>
          </div>

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

          <div class="form-group">
            <label>Estimated Hours</label>
            <input 
              v-model.number="taskForm.estimatedHours" 
              type="number" 
              min="0" 
              step="0.5"
              placeholder="0"
            />
          </div>

          <div class="form-group">
            <label>Comments</label>
            <textarea 
              v-model="taskForm.comments" 
              placeholder="Add any comments or notes"
              rows="3"
            ></textarea>
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

    <!-- Work Log Modal -->
    <div v-if="showWorkLogModal" class="modal-overlay" @click="closeWorkLogModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Log Work - {{ workLogTask?.title }}</h3>
          <button @click="closeWorkLogModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="saveWorkLog" class="task-form">
          <div class="form-group">
            <label>Developer Name</label>
            <input 
              v-model="workLogForm.developer" 
              type="text" 
              required 
              placeholder="Enter your name"
            />
          </div>

          <div class="form-group">
            <label>Hours Worked</label>
            <input 
              v-model.number="workLogForm.hours" 
              type="number" 
              min="0.25" 
              step="0.25"
              required
              placeholder="0.5"
            />
          </div>

          <div class="form-group">
            <label>Work Description</label>
            <textarea 
              v-model="workLogForm.description" 
              placeholder="Describe what you worked on..."
              rows="4"
              required
            ></textarea>
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
const showWorkLogModal = ref(false)
const editingTask = ref(null)
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
            timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          },
          {
            id: 2,
            developer: 'Jane Smith',
            hours: 3,
            description: 'Developed the frontend login page with responsive design',
            timestamp: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
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
    id: Date.now(), // Simple ID generation
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
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.board-header h1 {
  color: #2c3e50;
  margin: 0;
}

.add-task-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-task-btn:hover {
  background: #2980b9;
}

.board-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.column {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  min-height: 500px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.column-header h3 {
  margin: 0;
  color: #495057;
  font-size: 18px;
}

.task-count {
  background: #6c757d;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #495057;
}

.task-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn,
.save-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

.save-btn {
  background: #28a745;
  color: white;
}

.save-btn:hover {
  background: #218838;
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
