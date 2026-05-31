<script setup>
defineProps({
  skill: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="skill-card" :class="{ active: isActive }">
    <div class="skill-logo">{{ skill.logo }}</div>
    <div class="skill-info">
      <h3 class="skill-name">{{ skill.name }}</h3>
      <div class="skill-stars">
        <span 
          v-for="star in 5" 
          :key="star" 
          class="star"
          :class="{ filled: star <= skill.rating }"
        >★</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: 1rem;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}
.skill-card:hover {
  background: #f1f3f5;
  /* [Shadow] 與 project-card 一致：高層陰影 + 上移 3px */
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
}
.skill-card.active {
  background: #fff;
  border-color: var(--accent-color);
  /* [Shadow] active 狀態使用 md 層級 */
  box-shadow: var(--shadow-md);
}
.skill-logo {
  width: 60px;
  height: 60px;
  background: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #495057;
}
.skill-info {
  flex: 1;
}
.skill-name {
  margin: 0 0 var(--space-1) 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}
.skill-stars {
  display: flex;
  gap: var(--space-0-5);
}
.star {
  color: #dee2e6;
  font-size: 1.2rem;
}
.star.filled {
  color: #ffd43b;
}
</style>
