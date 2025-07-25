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
                <div class="report-actions">
                    <button @click="copyReport" class="action-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                        </svg>
                        Copy
                    </button>

                    <!-- Dropdown for download options -->
                    <div class="download-dropdown">
                        <button @click="downloadReport('html')" class="action-btn primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M5 20h14v-2H5v2zm7-18L5.5 8.5l1.41 1.41L11 4.83V16h2V4.83l4.09 5.08L18.5 8.5L12 2z" />
                            </svg>
                            Download HTML
                        </button>
                        <button @click="downloadReport('text')" class="action-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M5 20h14v-2H5v2zm7-18L5.5 8.5l1.41 1.41L11 4.83V16h2V4.83l4.09 5.08L18.5 8.5L12 2z" />
                            </svg>
                            Download TXT
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
import projectsData from '../data/projects.json'

const projects = ref(projectsData)

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
    if (!generatedReport.value) return ''

    // Clean up the report and ensure proper HTML formatting
    let formatted = generatedReport.value
        // Remove any markdown-style headers that might slip through
        .replace(/^#{1,6}\s+/gm, '')
        // Ensure proper paragraph spacing
        .replace(/\n\n+/g, '</p><p>')
        // Handle line breaks within paragraphs
        .replace(/\n/g, '<br>')
    // Wrap in paragraphs if not already wrapped

    // If the content doesn't start with HTML tags, wrap it
    if (!formatted.trim().startsWith('<')) {
        formatted = `<p>${formatted}</p>`
    }

    return formatted
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

const downloadReport = (format = 'html') => {
    const project = projects.value.find(p => p.id == selectedProject.value)
    const projectName = project?.name.replace(/\s+/g, '-').toLowerCase() || 'report'
    const timestamp = Date.now()

    if (format === 'html') {
        // Create a complete HTML document
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Report - ${project?.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.7;
            color: #374151;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #ffffff;
        }
        
        h1 {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin: 32px 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 3px solid #8b5cf6;
        }
        
        h2 {
            font-size: 22px;
            font-weight: 600;
            color: #1f2937;
            margin: 28px 0 14px 0;
            padding: 12px 16px;
            border-left: 4px solid #8b5cf6;
            background: linear-gradient(90deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%);
            border-radius: 0 8px 8px 0;
        }
        
        h3 {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin: 20px 0 10px 0;
            padding-bottom: 4px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        p {
            margin: 16px 0;
            text-align: justify;
        }
        
        strong {
            font-weight: 600;
            color: #1f2937;
            background: rgba(139, 92, 246, 0.1);
            padding: 2px 4px;
            border-radius: 3px;
        }
        
        ul {
            margin: 16px 0;
            padding-left: 0;
            list-style: none;
        }
        
        ul li {
            position: relative;
            margin: 8px 0;
            padding-left: 24px;
            line-height: 1.6;
        }
        
        ul li::before {
            content: '•';
            color: #8b5cf6;
            font-weight: bold;
            position: absolute;
            left: 8px;
            font-size: 16px;
        }
        
        .report-header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f3f4f6;
        }
        
        .report-meta {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 30px;
        }
        
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>Project Report: ${project?.name}</h1>
        <div class="report-meta">
            Generated: ${formatDate(reportGeneratedAt.value)}<br>
            Target Audience: ${targetRole.value?.charAt(0).toUpperCase() + targetRole.value?.slice(1)}
        </div>
    </div>
    
    ${formattedReport.value}
</body>
</html>`

        const blob = new Blob([htmlContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${projectName}-report-${timestamp}.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    } else {
        // Plain text version (strip HTML tags)
        const textContent = generatedReport.value
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
            .replace(/&amp;/g, '&') // Replace HTML entities
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\n\s*\n/g, '\n\n') // Clean up extra whitespace

        const blob = new Blob([textContent], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${projectName}-report-${timestamp}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
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
    margin: 8px;
}

.download-dropdown {
    display: flex;
    gap: 4px;
}

.action-btn.primary {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
}

.action-btn.primary:hover {
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    transform: translateY(-1px);
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 15px;
}

/* Enhanced report styling */
.report-text :deep(h1) {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin: 32px 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 3px solid #8b5cf6;
}

.report-text :deep(h2) {
    font-size: 22px;
    font-weight: 600;
    color: #1f2937;
    margin: 28px 0 14px 0;
    padding-left: 12px;
    border-left: 4px solid #8b5cf6;
    background: linear-gradient(90deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%);
    padding: 12px 16px;
    border-radius: 0 8px 8px 0;
}

.report-text :deep(h3) {
    font-size: 18px;
    font-weight: 600;
    color: #374151;
    margin: 20px 0 10px 0;
    padding-bottom: 4px;
    border-bottom: 1px solid #e5e7eb;
}

.report-text :deep(h4) {
    font-size: 16px;
    font-weight: 600;
    color: #4b5563;
    margin: 16px 0 8px 0;
}

.report-text :deep(p) {
    margin: 16px 0;
    line-height: 1.7;
    text-align: justify;
}

.report-text :deep(strong) {
    font-weight: 600;
    color: #1f2937;
    background: rgba(139, 92, 246, 0.1);
    padding: 2px 4px;
    border-radius: 3px;
}

.report-text :deep(em) {
    font-style: italic;
    color: #6b7280;
    background: rgba(107, 114, 128, 0.1);
    padding: 1px 3px;
    border-radius: 2px;
}

.report-text :deep(ul) {
    margin: 16px 0;
    padding-left: 0;
    list-style: none;
}

.report-text :deep(ul li) {
    position: relative;
    margin: 8px 0;
    padding-left: 24px;
    line-height: 1.6;
}

.report-text :deep(ul li::before) {
    content: '•';
    color: #8b5cf6;
    font-weight: bold;
    position: absolute;
    left: 8px;
    font-size: 16px;
}

.report-text :deep(ol) {
    margin: 16px 0;
    padding-left: 20px;
    counter-reset: custom-counter;
}

.report-text :deep(ol li) {
    margin: 8px 0;
    padding-left: 8px;
    line-height: 1.6;
    position: relative;
    counter-increment: custom-counter;
}

.report-text :deep(ol li::before) {
    content: counter(custom-counter) '.';
    color: #8b5cf6;
    font-weight: 600;
    margin-right: 8px;
}

/* Highlight important metrics and numbers */
.report-text :deep(:is(p, li):has(span:contains('%'))) {
    background: rgba(16, 185, 129, 0.05);
    padding: 8px 12px;
    border-radius: 6px;
    border-left: 3px solid #10b981;
    margin: 12px 0;
}

/* Style for code-like content */
.report-text :deep(code) {
    background: #f3f4f6;
    color: #1f2937;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
}

/* Blockquote styling for important callouts */
.report-text :deep(blockquote) {
    margin: 20px 0;
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%);
    border-left: 4px solid #8b5cf6;
    border-radius: 0 8px 8px 0;
    font-style: italic;
    color: #4b5563;
}

/* Table styling if tables are generated */
.report-text :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.report-text :deep(th) {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
}

.report-text :deep(td) {
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
}

.report-text :deep(tr:nth-child(even)) {
    background: #fafafa;
}

/* Special styling for metrics and statistics */
.report-text :deep(.metric) {
    display: inline-block;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
    margin: 2px 4px;
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

@media (max-width: 768px) {
    .report-text {
        font-size: 14px;
    }

    .report-text :deep(h1) {
        font-size: 24px;
    }

    .report-text :deep(h2) {
        font-size: 20px;
        padding: 8px 12px;
    }

    .report-text :deep(h3) {
        font-size: 16px;
    }
}

/* Loading animation improvements */
.loading-icon {
    animation: spin 1.5s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>