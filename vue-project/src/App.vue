<template>
  <div id="app">
    <!-- Global App Context for AI awareness -->
    <context name="app_state">
      Total projects: {{ projects.length }}
      Active projects: {{ activeProjects.length }}
      Completed projects: {{ completedProjects.length }}
      Total tasks across all projects: {{ totalTasksAcrossProjects }}
      Current route: {{ currentRoute }}
      Available projects: {{projects.map(p => `${p.id}: ${p.name} (${p.tasks?.length || 0} tasks)`).join(', ')}}
      Recent activity: {{ recentActivity }}
      Projects summary: {{ projectsSummary }}
    </context>

    <nav class="main-nav">
      <div class="nav-brand">
        <h2>Projectly</h2>
      </div>
      <div class="nav-links">
        <router-link to="/projects" class="nav-link">Projects</router-link>
        <router-link to="/reports" class="nav-link">Reports</router-link>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { projects } from './stores/projectStore.js'

const route = useRoute()

// Computed properties for context
const currentRoute = computed(() => route.path)

const activeProjects = computed(() => {
  return projects.value.filter(project => {
    const progress = calculateProjectProgress(project)
    return progress > 0 && progress < 100
  })
})

const completedProjects = computed(() => {
  return projects.value.filter(project => {
    const progress = calculateProjectProgress(project)
    return progress === 100
  })
})

const totalTasksAcrossProjects = computed(() => {
  return projects.value.reduce((total, project) => {
    return total + (project.tasks?.length || 0)
  }, 0)
})

const recentActivity = computed(() => {
  // Get recent tasks from all projects
  const allTasks = projects.value.flatMap(project =>
    (project.tasks || []).map(task => ({
      ...task,
      projectName: project.name,
      projectId: project.id
    }))
  )

  // Sort by creation date and take the 3 most recent
  const recentTasks = allTasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)

  if (recentTasks.length === 0) return 'No recent activity'

  return recentTasks.map(task =>
    `${task.title} in ${task.projectName}`
  ).join(', ')
})

const projectsSummary = computed(() => {
  if (projects.value.length === 0) return 'No projects created'

  return projects.value.map(project => {
    const progress = calculateProjectProgress(project)
    const taskCount = project.tasks?.length || 0
    let status = 'Not started'

    if (progress === 100) status = 'Complete'
    else if (progress > 0) status = 'In progress'

    return `${project.name}: ${status} (${taskCount} tasks, ${progress}% done)`
  }).join(' | ')
})

// Helper function to calculate project progress
const calculateProjectProgress = (project) => {
  if (!project.tasks || project.tasks.length === 0) return 0
  const completed = project.tasks.filter(t => t.status === 'done').length
  return Math.round((completed / project.tasks.length) * 100)
}
</script>

<style scoped>
#app {
  max-width: none;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

.main-nav {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand h2 {
  margin: 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.main-content {
  min-height: calc(100vh - 80px);
  background: #f9fafb;
}

tool,
prop,
context,
array,
dict {
  display: none;
}
</style>