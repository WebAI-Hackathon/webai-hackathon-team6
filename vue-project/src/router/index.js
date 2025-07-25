// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import KanbanBoard from '../components/KanbanBoard.vue'
import Projects from '../views/Projects.vue'
import Reports from '../views/Reports.vue'

const routes = [
    {
        path: '/',
        // redirect: '/projects'
        name: 'Home',
        component: Projects
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
    history: createWebHashHistory(), // Remove the base path from here
    routes
})

export default router