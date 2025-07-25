<template>
    <div class="projects-page">
        <div class="page-header">
            <h1>Projects</h1>
            <button class="add-project-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                New Project
            </button>
        </div>

        <div class="projects-grid">
            <div v-for="project in projects" :key="project.id" class="project-card">
                <h3>{{ project.name }}</h3>
                <p>{{ project.description }}</p>
                <div class="project-meta">
                    <span class="project-status">{{ calculateProgress(project) }}% Complete</span>
                    <span class="project-date">{{ project.tasks?.length || 0 }} tasks</span>
                </div>
                <div class="project-actions">
                    <button @click="viewKanban(project.id)" class="kanban-btn">View Board</button>
                    <button class="details-btn">Details</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import projectsData from '../data/projects.json'
import { ref } from 'vue'

const router = useRouter()
const projects = ref(projectsData)

const viewKanban = (projectId) => {
    router.push(`/kanban/${projectId}`)
}

const calculateProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0
    const completed = project.tasks.filter(t => t.status === 'done').length
    return Math.round((completed / project.tasks.length) * 100)
}
</script>

<style scoped>
.projects-page {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
}

.page-header h1 {
    margin: 0;
    color: #1f2937;
    font-size: 32px;
    font-weight: 700;
}

.add-project-btn {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.add-project-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
}

.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}

.project-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
}

.project-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.project-card h3 {
    margin: 0 0 8px 0;
    color: #1f2937;
    font-size: 18px;
    font-weight: 600;
}

.project-card p {
    margin: 0 0 16px 0;
    color: #6b7280;
    line-height: 1.5;
}

.project-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
}

.project-status {
    background: #dbeafe;
    color: #1d4ed8;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.project-date {
    color: #9ca3af;
    font-size: 12px;
}

.project-actions {
    display: flex;
    gap: 8px;
}

.kanban-btn,
.details-btn {
    flex: 1;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.kanban-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
}

.kanban-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.details-btn {
    background: #f3f4f6;
    color: #6b7280;
}

.details-btn:hover {
    background: #e5e7eb;
}
</style>