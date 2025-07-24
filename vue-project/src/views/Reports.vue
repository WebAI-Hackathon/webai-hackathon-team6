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

// Mock project data (replace with actual data source)
const projects = ref([
    {
        id: 1,
        name: 'Cloud Migration Project',
        tasks: [
            { id: 1, title: 'System Assessment', tag: 'organisational', status: 'done' },
            { id: 2, title: 'Data Migration Planning', tag: 'feature', status: 'in-progress' },
            { id: 3, title: 'Security Configuration', tag: 'bug-fix', status: 'todo' },
            { id: 4, title: 'User Training', tag: 'organisational', status: 'todo' }
        ]
    },
    {
        id: 2,
        name: 'Website Redesign',
        tasks: [
            { id: 5, title: 'UI Design', tag: 'feature', status: 'done' },
            { id: 6, title: 'Frontend Development', tag: 'feature', status: 'in-progress' }
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

        const reportData = {
            project: project.name,
            tasks: tasksToInclude,
            tags: tagsToInclude,
            targetRole: targetRole.value
        }

        // Simulate API call (replace with actual OpenAI API call)
        const report = await mockGenerateReport(reportData)

        generatedReport.value = report
        reportGeneratedAt.value = new Date()
    } catch (err) {
        error.value = err.message || 'Failed to generate report'
    } finally {
        isGenerating.value = false
    }
}

// Mock API function (replace with actual OpenAI integration)
const mockGenerateReport = async (data) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const reports = {
                developer: `# Technical Project Report: ${data.project}

## Project Overview
${data.project} is currently in progress with ${data.tasks.length} tasks being tracked across ${data.tags.length} different categories.

## Technical Status
### Completed Tasks
${data.tasks.filter(t => t.status === 'done').map(t => `- ${t.title}`).join('\n')}

### In Progress
${data.tasks.filter(t => t.status === 'in-progress').map(t => `- ${t.title}`).join('\n')}

### Pending Tasks
${data.tasks.filter(t => t.status === 'todo').map(t => `- ${t.title}`).join('\n')}

## Technical Recommendations
- Focus on completing in-progress tasks before starting new ones
- Ensure proper testing coverage for all completed features
- Consider code review process for critical components

## Risk Assessment
- Medium risk: Dependencies between tasks may cause delays
- Low risk: Current team capacity appears adequate`,

                manager: `# Executive Project Summary: ${data.project}

## Project Status
The ${data.project} is progressing as planned with ${data.tasks.filter(t => t.status === 'done').length} of ${data.tasks.length} tasks completed.

## Key Metrics
- Completion Rate: ${Math.round((data.tasks.filter(t => t.status === 'done').length / data.tasks.length) * 100)}%
- Tasks in Progress: ${data.tasks.filter(t => t.status === 'in-progress').length}
- Remaining Tasks: ${data.tasks.filter(t => t.status === 'todo').length}

## Business Impact
The project is on track to deliver significant value through improved efficiency and reduced operational costs.

## Resource Requirements
Current team allocation appears sufficient for project completion within timeline.

## Next Steps
1. Monitor progress on current in-progress tasks
2. Prepare for user acceptance testing phase
3. Plan change management activities`,

                hr: `# HR Project Impact Report: ${data.project}

## Team Development Opportunities
The ${data.project} presents excellent learning opportunities for team members across multiple skill areas.

## Training Requirements
Based on project tasks, the following training may be beneficial:
- Technical skills development for feature implementation
- Process improvement methodologies
- Change management techniques

## Team Engagement
Project involves ${data.tasks.length} distinct tasks, providing variety and growth opportunities for team members.

## Resource Planning
- Current team capacity: Adequate
- Skill development: In progress
- Knowledge transfer: Required for organizational tasks

## Recommendations
1. Implement peer learning sessions
2. Document best practices for future projects
3. Plan recognition activities for project milestones`,

                marketing: `# Marketing Project Insights: ${data.project}

## Project Communication Strategy
${data.project} offers multiple touchpoints for stakeholder engagement and success story development.

## Key Messages
- Innovation: Leveraging cutting-edge technology solutions
- Efficiency: Streamlining processes for better outcomes
- Growth: Building foundation for future expansion

## Success Metrics for Communication
- Project completion milestones: ${data.tasks.filter(t => t.status === 'done').length} achieved
- Team achievements: Multiple deliverables completed
- Process improvements: Ongoing optimization

## Content Opportunities
1. Technical achievement spotlights
2. Team success stories
3. Process improvement case studies
4. Innovation highlights

## Stakeholder Engagement
Regular updates and milestone celebrations will maintain momentum and visibility.`
            }

            resolve(reports[data.targetRole] || reports.manager)
        }, 2000)
    })
}

const copyReport = async () => {
    try {
        await navigator.clipboard.writeText(generatedReport.value)
        // You could add a toast notification here
    } catch (err) {
        console.error('Failed to copy report:', err)
    }
}

const downloadReport = () => {
    const blob = new Blob([generatedReport.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${selectedProject.value}-${Date.now()}.txt`
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