<script setup>
import { ref } from "vue";
import SkillsSection from "../components/SkillsSection.vue";

const skillCategories = ref([
  {
    id: "frontend",
    title: "Frontend Development",
    skills: [
      {
        id: 1,
        name: "Vue.js",
        logo: "fa-brands fa-vuejs",
        rating: 5,
        description:
          "Proficient in Vue 3 Composition API, Vue Router, Pinia, and ecosystem tools.",
      },
      {
        id: 2,
        name: "React",
        logo: "fa-brands fa-react",
        rating: 4,
        description:
          "Experienced in functional components, Hooks, Next.js, and Redux state management.",
      },
      {
        id: 3,
        name: "CSS/SASS",
        logo: "fa-brands fa-css3-alt",
        rating: 5,
        description:
          "Advanced responsive design, flexbox/grid layouts, animations, and maintainable styles.",
      },
      {
        id: 4,
        name: "JavaScript",
        logo: "fa-brands fa-js",
        rating: 4,
        description:
          "Proficient in modern ES6+ features, asynchronous programming, DOM manipulation, and browser APIs.",
      },
      {
        id: 5,
        name: "Git",
        logo: "fa-brands fa-git-alt",
        rating: 4,
        description:
          "Version control with Git — branching, merging, and collaborative workflow management.",
      },
    ],
  },
  {
    id: "design",
    title: "Design & Tools",
    skills: [
      {
        id: 9,
        name: "Figma",
        logo: "fa-brands fa-figma",
        rating: 4,
        description:
          "UI/UX design, prototyping, component systems, and design-to-code handoff with auto-layout and design tokens.",
      },
      {
        id: 10,
        name: "Photoshop",
        logo: "Ps",
        rating: 4,
        description:
          "Photo retouching, compositing, digital painting, and asset preparation for web and print.",
      },
      {
        id: 11,
        name: "Illustrator",
        logo: "Ai",
        rating: 3,
        description:
          "Vector illustration, icon design, typography layout, and scalable graphic assets for UI.",
      },
    ],
  },
]);
</script>

<template>
  <div class="skill-page">
    <SkillsSection :categories="skillCategories" />
  </div>
</template>

<style scoped>
.skill-page {
  /* [Fix #8c] 移除 padding: 0rem 0rem（等同 padding: 0，為多餘寫法） */
  max-width: 1200px;
  margin: 0;
}
</style>
