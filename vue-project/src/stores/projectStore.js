// src/stores/projectStore.js
import { ref, computed } from 'vue'
import initialData from '../data/projects.json'

// Global reactive state - this will persist across route changes
export const projects = ref(JSON.parse(JSON.stringify(initialData)))
export const currentProjectId = ref(1)

// Computed properties
export const currentProject = computed(() =>
    projects.value.find(p => p.id === currentProjectId.value)
)

export const getProject = (projectId) => {
    return projects.value.find(p => p.id === projectId)
}

// Actions
export const setCurrentProject = (projectId) => {
    currentProjectId.value = projectId
}

export const addTask = (projectId, taskData) => {
    const project = getProject(projectId)
    if (!project) return null

    const newTask = {
        id: Date.now(),
        ...taskData,
        createdAt: new Date().toISOString(),
        workLogs: []
    }

    project.tasks.push(newTask)
    return newTask
}

export const updateTask = (projectId, taskId, updates) => {
    const project = getProject(projectId)
    if (!project) return

    const taskIndex = project.tasks.findIndex(t => t.id === taskId)
    if (taskIndex !== -1) {
        Object.assign(project.tasks[taskIndex], updates)
    }
}

export const deleteTask = (projectId, taskId) => {
    const project = getProject(projectId)
    if (!project) return

    project.tasks = project.tasks.filter(t => t.id !== taskId)
}

export const moveTask = (projectId, taskId, newStatus) => {
    const project = getProject(projectId)
    if (!project) return

    const task = project.tasks.find(t => t.id === taskId)
    if (task) {
        task.status = newStatus
    }
}

export const findTask = (projectId, taskId) => {
    const project = getProject(projectId)
    if (!project) return null

    return project.tasks.find(t => t.id === taskId)
}

export const addWorkLog = (projectId, taskId, workLogData) => {
    const task = findTask(projectId, taskId)
    if (!task) return

    const newWorkLog = {
        id: Date.now(),
        ...workLogData,
        timestamp: new Date().toISOString()
    }

    if (!task.workLogs) {
        task.workLogs = []
    }

    task.workLogs.push(newWorkLog)
}

// Add these functions to your existing projectStore.js
export const addProject = (projectData) => {
    const newProject = {
        id: Date.now(),
        ...projectData,
        createdAt: new Date().toISOString(),
        tasks: []
    }

    projects.value.push(newProject)
    return newProject
}

export const updateProject = (projectId, updates) => {
    const projectIndex = projects.value.findIndex(p => p.id === projectId)
    if (projectIndex !== -1) {
        Object.assign(projects.value[projectIndex], updates)
    }
}

export const deleteProject = (projectId) => {
    projects.value = projects.value.filter(p => p.id !== projectId)
}

export const getProjectById = (projectId) => {
    return projects.value.find(p => p.id === projectId)
}