<template>
    <div class="reports-page">
        <div class="page-header">
            <h1>Project Reports</h1>
            <p class="page-subtitle">Generate AI-powered insights for your projects</p>
        </div>

        <div class="reports-container">
            <!-- Report Configuration -->
            <div class="report-config">
                <h2>Report Configuration</h2>

                <form @submit.prevent="generateReport" class="config-form">
                    <!-- Project Selection -->
                    <div class="form-group">
                        <label for="project">Select Project</label>
                        <select v-model="selectedProject" id="project" required>
                            <option value="">Choose a project...</option>
                            <option v-for="project in projects" :key="project.id" :value="project.id">
                                {{ project.name }}
                            </option>
                        </select>
                    </div>

                    <!-- Tasks Selection -->
                    <div class="form-group">
                        <label>Select Tasks</label>
                        <div class="checkbox-group">
                            <label class="checkbox-item">
                                <input type="checkbox" v-model="selectAllTasks" @change="toggleAllTasks">
                                <span class="checkmark"></span>
                                Select All Tasks
                            </label>
                            <div v-if="availableTasks.length > 0" class="task-list">
                                <label v-for="task in availableTasks" :key="task.id" class="checkbox-item">
                                    <input type="checkbox" :value="task.id" v-model="selectedTasks">
                                    <span class="checkmark"></span>
                                    {{ task.title }}
                                </label>
                            </div>
                            <p v-else class="no-tasks">Select a project to see available tasks</p>
                        </div>
                    </div>

                    <!-- Tags Selection -->
                    <div class="form-group">
                        <label>Select Tags</label>
                        <div class="checkbox-group">
                            <label class="checkbox-item">
                                <input type="checkbox" v-model="selectAllTags" @change="toggleAllTags">
                                <span class="checkmark"></span>
                                Select All Tags
                            </label>
                            <div class="tag-list">
                                <label v-for="tag in availableTags" :key="tag.value" class="checkbox-item">
                                    <input type="checkbox" :value="tag.value" v-model="selectedTags_">
                                    <span class="checkmark"></span>
                                    {{ tag.label }}
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Target Reader Role -->
                    <div class="form-group">
                        <label for="targetRole">Target Reader Role</label>
                        <select v-model="targetRole" id="targetRole" required>
                            <option value="">Choose target audience...</option>
                            <option value="developer">Developer</option>
                            <option value="manager">Manager</option>
                            <option value="hr">HR</option>
                            <option value="marketing">Marketing</option>
                        </select>
                    </div>

                    <!-- Generate Button -->
                    <button type="submit" class="generate-btn" :disabled="isGenerating || !canGenerate">
                        <svg v-if="isGenerating" class="loading-icon" width="20" height="20" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                                opacity=".25" />
                            <path fill="currentColor"
                                d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" />
                        </svg>
                        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ isGenerating ? 'Generating Report...' : 'Generate Report' }}
                    </button>
                </form>
            </div>

            <!-- Generated Report -->
            <div v-if="generatedReport" class="report-output">
                <div class="report-header">
                    <h2>Generated Report</h2>
                    <div class="report-actions">
                        <button @click="copyReport" class="action-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                            </svg>
                            Copy
                        </button>
                        <button @click="downloadReport" class="action-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M5 20h14v-2H5v2zm7-18L5.5 8.5l1.41 1.41L11 4.83V16h2V4.83l4.09 5.08L18.5 8.5L12 2z" />
                            </svg>
                            Download
                        </button>
                    </div>
                </div>
                <div class="report-content">
                    <div class="report-meta">
                        <span class="report-date">Generated: {{ formatDate(reportGeneratedAt) }}</span>
                        <span class="report-role">For: {{ targetRole?.charAt(0).toUpperCase() + targetRole?.slice(1)
                        }}</span>
                    </div>
                    <div class="report-text" v-html="formattedReport"></div>
                </div>
            </div>

            <!-- Error State -->
            <div v-if="error" class="error-message">
                <h3>Error Generating Report</h3>
                <p>{{ error }}</p>
                <button @click="error = null" class="dismiss-btn">Dismiss</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ReportService } from '../services/reportService.js'

// Import or fetch actual project data (replace with your data source)
// For now, using the same mock data but in a real app, this would come from your API
const projects = ref([
    {
        id: 1,
        name: 'Cloud Migration Project',
        description: 'Migrate Dynamics CRM to Dynamics 365',
        tasks: [
            {
                id: 1,
                title: 'System Assessment',
                description: 'Analyze current on-premise infrastructure and dependencies',
                tag: 'organisational',
                status: 'done',
                estimatedHours: 16,
                workLogs: [
                    {
                        id: 1,
                        developer: 'Michael Ritter',
                        hours: 8,
                        description: 'Completed infrastructure analysis and dependency mapping',
                        timestamp: '2024-07-20T10:00:00.000Z'
                    },
                    {
                        id: 2,
                        developer: 'Julia Schmidt',
                        hours: 6,
                        description: 'Documented current system architecture and integration points',
                        timestamp: '2024-07-21T14:00:00.000Z'
                    }
                ]
            },
            {
                id: 2,
                title: 'Data Migration Planning',
                description: 'Plan data cleansing and migration strategy',
                tag: 'feature',
                status: 'in-progress',
                estimatedHours: 24,
                workLogs: [
                    {
                        id: 3,
                        developer: 'Julia Schmidt',
                        hours: 12,
                        description: 'Created data mapping documentation and identified duplicate records',
                        timestamp: '2024-07-22T09:00:00.000Z'
                    }
                ]
            },
            {
                id: 3,
                title: 'Security Configuration',
                description: 'Configure Azure AD and security roles',
                tag: 'bug-fix',
                status: 'todo',
                estimatedHours: 20,
                workLogs: []
            },
            {
                id: 4,
                title: 'User Training',
                description: 'Conduct training sessions for end users',
                tag: 'organisational',
                status: 'todo',
                estimatedHours: 32,
                workLogs: []
            }
        ]
    },
    {
        id: 2,
        name: 'Website Redesign',
        description: 'Modern responsive website with improved UX',
        tasks: [
            {
                id: 5,
                title: 'UI Design',
                description: 'Create modern user interface designs',
                tag: 'feature',
                status: 'done',
                estimatedHours: 40,
                workLogs: [
                    {
                        id: 4,
                        developer: 'Sofia Weber',
                        hours: 35,
                        description: 'Completed all UI mockups and prototypes',
                        timestamp: '2024-07-15T16:00:00.000Z'
                    }
                ]
            },
            {
                id: 6,
                title: 'Frontend Development',
                description: 'Implement responsive frontend code',
                tag: 'feature',
                status: 'in-progress',
                estimatedHours: 60,
                workLogs: [
                    {
                        id: 5,
                        developer: 'Pritesh Soni',
                        hours: 25,
                        description: 'Implemented responsive layout and component structure',
                        timestamp: '2024-07-23T11:00:00.000Z'
                    }
                ]
            }
        ]
    }
])

const availableTags = ref([
    { value: 'bug-fix', label: 'Bug Fix' },
    { value: 'feature', label: 'Feature' },
    { value: 'organisational', label: 'Organisational' }
])

// Form state
const selectedProject = ref('')
const selectedTasks = ref([])
const selectedTags_ = ref([])
const targetRole = ref('')
const selectAllTasks = ref(false)
const selectAllTags = ref(false)

// Report state
const isGenerating = ref(false)
const generatedReport = ref('')
const reportGeneratedAt = ref(null)
const error = ref(null)

// Computed properties
const availableTasks = computed(() => {
    const project = projects.value.find(p => p.id == selectedProject.value)
    return project ? project.tasks : []
})

const canGenerate = computed(() => {
    return selectedProject.value &&
        (selectedTasks.value.length > 0 || selectAllTasks.value) &&
        (selectedTags_.value.length > 0 || selectAllTags.value) &&
        targetRole.value
})

const formattedReport = computed(() => {
    return generatedReport.value.replace(/\n/g, '<br>')
})

// Watchers
watch(selectedProject, () => {
    selectedTasks.value = []
    selectAllTasks.value = false
})

watch(selectedTasks, () => {
    selectAllTasks.value = selectedTasks.value.length === availableTasks.value.length && availableTasks.value.length > 0
})

watch(selectedTags_, () => {
    selectAllTags.value = selectedTags_.value.length === availableTags.value.length
})

// Methods
const toggleAllTasks = () => {
    if (selectAllTasks.value) {
        selectedTasks.value = availableTasks.value.map(task => task.id)
    } else {
        selectedTasks.value = []
    }
}

const toggleAllTags = () => {
    if (selectAllTags.value) {
        selectedTags_.value = availableTags.value.map(tag => tag.value)
    } else {
        selectedTags_.value = []
    }
}

const generateReport = async () => {
    isGenerating.value = true
    error.value = null

    try {
        // Prepare data for API
        const project = projects.value.find(p => p.id == selectedProject.value)
        const tasksToInclude = selectAllTasks.value
            ? project.tasks
            : project.tasks.filter(task => selectedTasks.value.includes(task.id))

        const tagsToInclude = selectAllTags.value
            ? availableTags.value.map(tag => tag.value)
            : selectedTags_.value

        // Filter tasks by selected tags if not all tags are selected
        const filteredTasks = selectAllTags.value
            ? tasksToInclude
            : tasksToInclude.filter(task => tagsToInclude.includes(task.tag))

        const reportData = {
            project: project.name,
            tasks: filteredTasks,
            tags: tagsToInclude,
            targetRole: targetRole.value
        }

        console.log('Generating report with data:', reportData)

        // Call the actual API
        const report = await ReportService.generateReport(reportData)

        generatedReport.value = report
        reportGeneratedAt.value = new Date()
    } catch (err) {
        console.error('Report generation error:', err)
        error.value = err.message || 'Failed to generate report'
    } finally {
        isGenerating.value = false
    }
}

// Keep existing utility functions
const copyReport = async () => {
    try {
        await navigator.clipboard.writeText(generatedReport.value)
        // You could add a toast notification here
        console.log('Report copied to clipboard')
    } catch (err) {
        console.error('Failed to copy report:', err)
    }
}

const downloadReport = () => {
    const blob = new Blob([generatedReport.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projects.value.find(p => p.id == selectedProject.value)?.name.replace(/\s+/g, '-').toLowerCase()}-report-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>

<style scoped>
.reports-page {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    background: #f9fafb;
    min-height: 100vh;
}

.page-header {
    margin-bottom: 32px;
}

.page-header h1 {
    margin: 0 0 8px 0;
    color: #1f2937;
    font-size: 32px;
    font-weight: 700;
}

.page-subtitle {
    margin: 0;
    color: #6b7280;
    font-size: 16px;
}

.reports-container {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 32px;
    align-items: start;
}

.report-config {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 24px;
}

.report-config h2 {
    margin: 0 0 24px 0;
    color: #1f2937;
    font-size: 20px;
    font-weight: 600;
}

.config-form .form-group {
    margin-bottom: 24px;
}

.config-form label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #374151;
}

.config-form select {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #f3f4f6;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;
    background: white;
}

.config-form select:focus {
    outline: none;
    border-color: #8b5cf6;
}

.checkbox-group {
    background: #f9fafb;
    border-radius: 8px;
    padding: 16px;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    cursor: pointer;
    font-size: 14px;
    color: #374151;
}

.checkbox-item input[type="checkbox"] {
    display: none;
}

.checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    position: relative;
    transition: all 0.2s ease;
}

.checkbox-item input[type="checkbox"]:checked+.checkmark {
    background: #8b5cf6;
    border-color: #8b5cf6;
}

.checkbox-item input[type="checkbox"]:checked+.checkmark::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 10px;
    border: solid transparent;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.task-list,
.tag-list {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
}

.no-tasks {
    margin: 12px 0 0 0;
    color: #9ca3af;
    font-style: italic;
    font-size: 14px;
}

.generate-btn {
    width: 100%;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    border: none;
    padding: 16px 24px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.generate-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
}

.generate-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.loading-icon {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.report-output {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #f3f4f6;
}

.report-header h2 {
    margin: 0;
    color: #1f2937;
    font-size: 20px;
    font-weight: 600;
}

.report-actions {
    display: flex;
    gap: 8px;
}

.action-btn {
    background: #f3f4f6;
    color: #6b7280;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
}

.action-btn:hover {
    background: #e5e7eb;
    color: #374151;
}

.report-content {
    padding: 24px;
}

.report-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f3f4f6;
    font-size: 14px;
    color: #6b7280;
}

.report-text {
    color: #374151;
    line-height: 1.7;
    white-space: pre-wrap;
    font-family: 'Georgia', serif;
}

.error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
}

.error-message h3 {
    margin: 0 0 8px 0;
    color: #dc2626;
    font-size: 18px;
}

.error-message p {
    margin: 0 0 16px 0;
    color: #7f1d1d;
}

.dismiss-btn {
    background: #dc2626;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
}

@media (max-width: 1024px) {
    .reports-container {
        grid-template-columns: 1fr;
        gap: 24px;
    }

    .report-config {
        position: static;
    }
}
</style>