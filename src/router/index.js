import { createRouter, createWebHashHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import WorksView from '../views/WorksView.vue'
import SkillsView from '../views/SkillsView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/about'
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    },
    {
      path: '/work/:id?',
      name: 'work',
      component: WorksView
    },
    {
      path: '/skill',
      name: 'skill',
      component: SkillsView
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
