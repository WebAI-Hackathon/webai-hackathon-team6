import { createRouter, createWebHistory } from 'vue-router'
import KanbanBoard from '../components/KanbanBoard.vue'
import Projects from '../views/Projects.vue'
import Reports from '../views/Reports.vue'

const routes = [
    {
        path: '/',
        redirect: '/projects'
    },
    {
        path: '/projects',
        name: 'Projects',
        component: Projects
    },
    {
        path: '/kanban/:projectId?',
        name: 'KanbanBoard',
        component: KanbanBoard,
        props: true
    },
    {
        path: '/reports',
        name: 'Reports',
        component: Reports
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router