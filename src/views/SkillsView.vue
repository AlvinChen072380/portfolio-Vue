<script setup>
import { ref } from 'vue'
import SkillsSection from '../components/SkillsSection.vue'

const skillCategories = ref([
  {
    id: 'frontend',
    title: 'Frontend Development',
    skills: [
      { id: 1, name: 'Vue.js', logo: 'V', rating: 5, description: 'Proficient in Vue 3 Composition API, Vue Router, Pinia, and ecosystem tools.' },
      { id: 2, name: 'React', logo: 'R', rating: 4, description: 'Experienced in functional components, Hooks, Next.js, and Redux state management.' },
      { id: 3, name: 'CSS/SASS', logo: 'C', rating: 5, description: 'Advanced responsive design, flexbox/grid layouts, animations, and maintainable styles.' },
      { id: 4, name: 'TypeScript', logo: 'TS', rating: 4, description: 'Strong static typing, interface definitions, and improved developer experience.' }
    ]
  },
  {
    id: 'backend',
    title: 'Backend & DevOps',
    skills: [
      { id: 5, name: 'Node.js', logo: 'N', rating: 4, description: 'Backend development using Express/NestJS, RESTful API design, and database integration.' },
      { id: 6, name: 'Python', logo: 'P', rating: 3, description: 'Data processing, scripting, and backend development using Django/FastAPI.' },
      { id: 7, name: 'Docker', logo: 'D', rating: 3, description: 'Containerization, creating Dockerfiles, and basic docker-compose orchestration.' }
    ]
  }
])
</script>

<template>
  <div class="skill-page">
    <SkillsSection :categories="skillCategories" />
  </div>
</template>

<style scoped>
.skill-page {
  padding: 0rem 0rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
