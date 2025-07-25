<template>
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
        <div class="modal modal-large" @click.stop>
            <div class="modal-header">
                <div class="project-detail-header">
                    <div class="project-detail-title">
                        <h3>{{ project?.name }}</h3>
                        <div class="project-badges">
                            <div class="project-progress-badge">
                                {{ calculateProgress(project) }}% Complete
                            </div>
                            <div class="project-tasks-badge">
                                {{ project?.tasks?.length || 0 }} Tasks
                            </div>
                        </div>
                    </div>
                    <div class="project-detail-date">
                        Created: {{ formatDate(project?.createdAt) }}
                    </div>
                </div>
                <button @click="$emit('close')" class="close-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                </button>
            </div>

            <div class="project-detail-content">
                <div class="project-detail-section">
                    <h4>Description</h4>
                    <p class="project-detail-description">
                        {{ project?.description || 'No description provided' }}
                    </p>
                </div>

                <div class="project-detail-section">
                    <h4>Project Overview</h4>
                    <div class="project-stats">
                        <div class="stat-item">
                            <div class="stat-value">{{ project?.tasks?.length || 0 }}</div>
                            <div class="stat-label">Total Tasks</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{{ getTasksByStatus('todo').length }}</div>
                            <div class="stat-label">To Do</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{{ getTasksByStatus('in-progress').length }}</div>
                            <div class="stat-label">In Progress</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{{ getTasksByStatus('done').length }}</div>
                            <div class="stat-label">Completed</div>
                        </div>
                    </div>
                </div>

                <div class="project-detail-section">
                    <h4>Time Tracking</h4>
                    <div class="time-tracking">
                        <div class="time-item">
                            <span class="time-label">Total Estimated:</span>
                            <span class="time-value">{{ getTotalEstimatedHours() }}h</span>
                        </div>
                        <div class="time-item">
                            <span class="time-label">Total Logged:</span>
                            <span class="time-value">{{ getTotalLoggedHours() }}h</span>
                        </div>
                        <div v-if="getTotalEstimatedHours() > 0" class="progress-section">
                            <div class="progress-bar-large">
                                <div class="progress-fill-large"
                                    :style="{ width: Math.min((getTotalLoggedHours() / getTotalEstimatedHours()) * 100, 100) + '%' }"
                                    :class="{ 'over-estimate': getTotalLoggedHours() > getTotalEstimatedHours() }">
                                </div>
                            </div>
                            <span class="progress-text">
                                {{ Math.round((getTotalLoggedHours() / getTotalEstimatedHours()) * 100) }}% of estimated
                                time
                            </span>
                        </div>
                    </div>
                </div>

                <div v-if="project?.tasks && project.tasks.length > 0" class="project-detail-section">
                    <div class="section-header">
                        <h4>Recent Tasks</h4>
                        <button @click="$emit('view-kanban', project.id)" class="view-kanban-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                            </svg>
                            View Kanban Board
                        </button>
                    </div>
                    <div class="tasks-preview">
                        <div v-for="task in getRecentTasks()" :key="task.id" class="task-preview-item">
                            <div class="task-preview-header">
                                <div class="task-preview-title">{{ task.title }}</div>
                                <div class="task-preview-badges">
                                    <span class="task-status-badge" :class="`status-${task.status}`">
                                        {{ getStatusDisplayName(task.status) }}
                                    </span>
                                    <span class="task-priority-badge" :class="`priority-${task.priority}`">
                                        {{ task.priority }}
                                    </span>
                                </div>
                            </div>
                            <div v-if="task.description" class="task-preview-description">
                                {{ task.description.substring(0, 100) }}{{ task.description.length > 100 ? '...' : '' }}
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="project-detail-section">
                    <h4>Tasks</h4>
                    <p class="no-tasks">No tasks have been created for this project yet.</p>
                    <button @click="$emit('view-kanban', project.id)" class="create-task-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        Create First Task
                    </button>
                </div>

                <div class="project-detail-section">
                    <h4>Project Info</h4>
                    <div class="project-info-grid">
                        <div class="info-item">
                            <span class="info-label">Project ID:</span>
                            <span class="info-value">#{{ project?.id }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Created:</span>
                            <span class="info-value">{{ formatDetailedDate(project?.createdAt) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Status:</span>
                            <span class="info-value">{{ getProjectStatus() }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Completion:</span>
                            <span class="info-value">{{ calculateProgress(project) }}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="project-detail-actions">
                <button @click="$emit('edit-project', project.id)" class="edit-project-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                    Edit Project
                </button>
                <button @click="$emit('view-kanban', project.id)" class="kanban-project-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                    </svg>
                    View Kanban Board
                </button>
                <button @click="$emit('delete-project', project.id)" class="delete-project-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                    Delete Project
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    show: Boolean,
    project: Object
})

defineEmits(['close', 'edit-project', 'delete-project', 'view-kanban'])

const calculateProgress = (project) => {
    if (!project?.tasks || project.tasks.length === 0) return 0
    const completed = project.tasks.filter(t => t.status === 'done').length
    return Math.round((completed / project.tasks.length) * 100)
}

const getTasksByStatus = (status) => {
    return props.project?.tasks?.filter(task => task.status === status) || []
}

const getTotalEstimatedHours = () => {
    if (!props.project?.tasks) return 0
    return props.project.tasks.reduce((total, task) => total + (task.estimatedHours || 0), 0)
}

const getTotalLoggedHours = () => {
    if (!props.project?.tasks) return 0
    return props.project.tasks.reduce((total, task) => {
        const taskHours = task.workLogs?.reduce((taskTotal, log) => taskTotal + (log.hours || 0), 0) || 0
        return total + taskHours
    }, 0)
}

const getRecentTasks = () => {
    if (!props.project?.tasks) return []
    return props.project.tasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
}

const getStatusDisplayName = (status) => {
    const statusMap = {
        'todo': 'To Do',
        'in-progress': 'In Progress',
        'done': 'Done'
    }
    return statusMap[status] || status
}

const getProjectStatus = () => {
    const progress = calculateProgress(props.project)
    if (progress === 100) return 'Completed'
    if (progress > 0) return 'In Progress'
    return 'Not Started'
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const formatDetailedDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}
</script>

<style scoped>
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
    max-width: 800px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #f3f4f6;
}

.project-detail-header {
    flex: 1;
}

.project-detail-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

.project-detail-title h3 {
    margin: 0;
    color: #1f2937;
    font-size: 20px;
    font-weight: 600;
}

.project-badges {
    display: flex;
    gap: 8px;
    align-items: center;
}

.project-progress-badge,
.project-tasks-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    color: white;
}

.project-progress-badge {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.project-tasks-badge {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.project-detail-date {
    font-size: 14px;
    color: #6b7280;
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

.project-detail-content {
    padding: 24px;
}

.project-detail-section {
    margin-bottom: 24px;
}

.project-detail-section h4 {
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

.view-kanban-btn,
.create-task-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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

.view-kanban-btn:hover,
.create-task-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.project-detail-description {
    color: #6b7280;
    line-height: 1.6;
    margin: 0;
}

.project-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    background: #f9fafb;
    border-radius: 12px;
    padding: 20px;
}

.stat-item {
    text-align: center;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
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

.tasks-preview {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.task-preview-item {
    background: #f9fafb;
    border-radius: 8px;
    padding: 12px;
    border-left: 4px solid #8b5cf6;
}

.task-preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.task-preview-title {
    font-weight: 600;
    color: #1f2937;
    font-size: 14px;
}

.task-preview-badges {
    display: flex;
    gap: 6px;
}

.task-status-badge,
.task-priority-badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 500;
}

.task-status-badge.status-todo {
    background: #f3f4f6;
    color: #6b7280;
}

.task-status-badge.status-in-progress {
    background: #dbeafe;
    color: #1d4ed8;
}

.task-status-badge.status-done {
    background: #d1fae5;
    color: #065f46;
}

.task-priority-badge.priority-high {
    background: #fef2f2;
    color: #dc2626;
}

.task-priority-badge.priority-medium {
    background: #fffbeb;
    color: #d97706;
}

.task-priority-badge.priority-low {
    background: #f0fdf4;
    color: #16a34a;
}

.task-preview-description {
    color: #6b7280;
    font-size: 13px;
    line-height: 1.4;
}

.no-tasks {
    color: #9ca3af;
    font-style: italic;
    margin: 0 0 16px 0;
}

.project-info-grid {
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

.project-detail-actions {
    display: flex;
    gap: 12px;
    padding: 24px;
    border-top: 1px solid #f3f4f6;
    justify-content: flex-end;
}

.edit-project-btn,
.kanban-project-btn,
.delete-project-btn {
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

.edit-project-btn {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
}

.edit-project-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.kanban-project-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
}

.kanban-project-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.delete-project-btn {
    background: #f3f4f6;
    color: #ef4444;
}

.delete-project-btn:hover {
    background: #fef2f2;
    transform: translateY(-1px);
}

@media (max-width: 768px) {
    .project-info-grid {
        grid-template-columns: 1fr;
    }

    .project-detail-actions {
        flex-direction: column;
    }

    .project-stats {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>