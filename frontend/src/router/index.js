import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CreateView from '../views/CreateNewTicketView.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView,
    },
    {
        path: '/create-new-ticket',
        name: 'Create',
        component: CreateView,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
