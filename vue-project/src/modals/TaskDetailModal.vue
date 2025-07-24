<template>
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
        <div class="modal modal-large" @click.stop>
            <div class="modal-header">
                <div class="task-detail-header">
                    <div class="task-detail-title">
                        <h3>{{ task?.title }}</h3>
                        <div class="task-badges">
                            <div class="task-priority-badge" :class="`priority-${task?.priority}`">
                                {{ task?.priority?.toUpperCase() }}
                            </div>
                            <div v-if="task?.tag" class="task-tag-badge" :class="`tag-${task?.tag}`">
                                {{ getTagDisplayName(task?.tag) }}
                            </div>
                        </div>
                    </div>
                    <div class="task-detail-status">
                        Status: <span class="status-badge" :class="`status-${task?.status}`">
                            {{ getStatusDisplayName(task?.status) }}
                        </span>
                    </div>
                </div>
                <button @click="$emit('close')" class="close-btn">
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
                        {{ task?.description || 'No description provided' }}
                    </p>
                </div>

                <div class="task-detail-section">
                    <h4>Time Tracking</h4>
                    <div class="time-tracking">
                        <div class="time-item">
                            <span class="time-label">Estimated:</span>
                            <span class="time-value">{{ task?.estimatedHours || 0 }}h</span>
                        </div>
                        <div class="time-item">
                            <span class="time-label">Logged:</span>
                            <span class="time-value">{{ getTotalLoggedHours(task) }}h</span>
                        </div>
                        <div v-if="task?.estimatedHours > 0" class="progress-section">
                            <div class="progress-bar-large">
                                <div class="progress-fill-large"
                                    :style="{ width: Math.min((getTotalLoggedHours(task) / task.estimatedHours) * 100, 100) + '%' }"
                                    :class="{ 'over-estimate': getTotalLoggedHours(task) > task.estimatedHours }"></div>
                            </div>
                            <span class="progress-text">
                                {{ Math.round((getTotalLoggedHours(task) / task.estimatedHours) * 100) }}% Complete
                            </span>
                        </div>
                    </div>
                </div>

                <!-- ...existing work history section... -->
                <div v-if="task?.workLogs && task.workLogs.length > 0" class="task-detail-section">
                    <div class="section-header">
                        <h4>Work History</h4>
                        <button @click="$emit('log-work', task.id)" class="log-work-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                            Log Work
                        </button>
                    </div>
                    <div class="work-logs-detailed">
                        <div v-for="log in task.workLogs" :key="log.id" class="work-log-detailed">
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
                        <button @click="$emit('log-work', task.id)" class="log-work-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                            Log Work
                        </button>
                    </div>
                    <p class="no-work-logs">No work has been logged for this task yet.</p>
                </div>

                <div v-if="task?.comments" class="task-detail-section">
                    <h4>Comments</h4>
                    <p class="task-comments-text">{{ task.comments }}</p>
                </div>

                <div class="task-detail-section">
                    <h4>Task Info</h4>
                    <div class="task-info-grid">
                        <div class="info-item">
                            <span class="info-label">Created:</span>
                            <span class="info-value">{{ formatDetailedDate(task?.createdAt) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Task ID:</span>
                            <span class="info-value">#{{ task?.id }}</span>
                        </div>
                        <div v-if="task?.tag" class="info-item">
                            <span class="info-label">Tag:</span>
                            <span class="info-value">{{ getTagDisplayName(task?.tag) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="task-detail-actions">
                <button @click="$emit('edit-task', task.id)" class="edit-task-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                    Edit Task
                </button>
                <button @click="$emit('delete-task', task.id)" class="delete-task-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                    Delete Task
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    show: Boolean,
    task: Object
})

defineEmits(['close', 'edit-task', 'delete-task', 'log-work'])

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

const getTagDisplayName = (tag) => {
    const tagMap = {
        'bug-fix': 'Bug Fix',
        'feature': 'Feature',
        'organisational': 'Organisational'
    }
    return tagMap[tag] || tag
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
    max-width: 700px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #f3f4f6;
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

.task-detail-title h3 {
    margin: 0;
    color: #1f2937;
    font-size: 18px;
    font-weight: 600;
}

.task-badges {
    display: flex;
    gap: 8px;
    align-items: center;
}

.task-priority-badge,
.task-tag-badge {
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

.task-tag-badge.tag-bug-fix {
    background: #dc2626;
}

.task-tag-badge.tag-feature {
    background: #2563eb;
}

.task-tag-badge.tag-organisational {
    background: #0891b2;
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
    .task-info-grid {
        grid-template-columns: 1fr;
    }

    .task-detail-actions {
        flex-direction: column;
    }
}
</style>