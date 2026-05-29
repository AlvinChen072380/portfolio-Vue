<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WorksSection from '../components/WorksSection.vue'
import ProjectCardDetail from '../components/ProjectCardDetail.vue'

const route = useRoute()
const router = useRouter()

// 取代原本在 WorksSection 的假資料
const projects = ref([
  {
    id: 'nexus-analytics',
    title: 'Nexus Analytics Dashboard',
    tags: ['FinTech', 'Web App'],
    demoUrl: 'https://example.com'
  },
  {
    id: 'eco-tracker',
    title: 'Eco Tracker App',
    tags: ['GreenTech', 'Mobile UI'],
    demoUrl: 'https://example.com/eco'
  }
])

// 利用 route params 來判斷是否顯示詳細頁
const currentProjectId = computed(() => route.params.id)
const isDetailView = computed(() => !!currentProjectId.value)

const goToProjectDetail = (projectId) => {
  router.push(`/work/${projectId}`)
}

const handleGoBack = () => {
  router.push('/work')
}
</script>

<template>
  <div class="works-page">
    <!-- 如果有 ID 則渲染詳細頁組件，否則渲染列表 -->
    <ProjectCardDetail 
      v-if="isDetailView" 
      :projectId="currentProjectId"
      @navigate-back="handleGoBack"
    />
    <WorksSection 
      v-else
      :projects="projects"
      @navigate-to-detail="goToProjectDetail"
    />
  </div>
</template>

<style scoped>
.works-page {
  /* Page specific styles */
}
</style>
