<template>
  <div id="app">
    <!-- Global VOIX Tools for Navigation -->
    <tool
      name="open_reports"
      description="Navigate to the Reports page to generate AI-powered project insights"
      @call="handleOpenReports"
    >
      <prop name="reason" type="string" description="Optional reason for opening reports (e.g., 'monthly review', 'project summary')"></prop>
    </tool>

    <tool
      name="open_project_board"
      description="Navigate to a specific project's kanban board view"
      @call="handleOpenProjectBoard"
    >
      <prop name="projectId" type="number" required description="ID of the project to open (1, 2, 3, etc.)"></prop>
      <prop name="projectName" type="string" description="Optional project name for better context"></prop>
    </tool>

    <nav class="main-nav">
      <div class="nav-brand">
        <h2>Project Manager</h2>
      </div>
      <div class="nav-links">
        <router-link to="/projects" class="nav-link">Projects</router-link>
        <router-link to="/reports" class="nav-link">Reports</router-link>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <KanbanBoard />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import KanbanBoard from './components/KanbanBoard.vue'

const router = useRouter()

// Global VOIX tool handler for opening reports
const handleOpenReports = (event) => {
  const { reason } = event.detail

  try {
    router.push('/reports')
    
    event.detail.success = true
    event.detail.message = `Navigated to Reports page${reason ? ` for ${reason}` : ''}`
    
    // Optional: Show a brief feedback message
    console.log(`VOIX: Opened Reports page${reason ? ` - ${reason}` : ''}`)
  } catch (error) {
    event.detail.success = false
    event.detail.error = 'Failed to navigate to Reports page'
    console.error('Navigation error:', error)
  }
}

// Global VOIX tool handler for opening project boards
const handleOpenProjectBoard = (event) => {
  const { projectId, projectName } = event.detail

  try {
    // Validate projectId
    if (!projectId || isNaN(projectId) || projectId < 1) {
      event.detail.success = false
      event.detail.error = 'Invalid project ID. Please provide a valid project number (1, 2, 3, etc.)'
      return
    }

    // Navigate to the project board
    router.push(`/project/${projectId}`)
    
    event.detail.success = true
    event.detail.message = `Navigated to ${projectName ? `${projectName} project` : `Project ${projectId}`} board`
    
    // Optional: Show a brief feedback message
    console.log(`VOIX: Opened Project ${projectId} board${projectName ? ` (${projectName})` : ''}`)
  } catch (error) {
    event.detail.success = false
    event.detail.error = `Failed to navigate to Project ${projectId} board`
    console.error('Navigation error:', error)
  }
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
</style>