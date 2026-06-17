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
    <!-- [Logo] FA icon / PNG 圖片 / 文字 fallback 三種格式自動判斷 -->
    <div class="skill-logo">
      <i v-if="skill.logo.startsWith('fa-')" :class="skill.logo"></i>
      <img v-else-if="skill.logo.startsWith('/')" :src="skill.logo" :alt="skill.name" />
      <span v-else>{{ skill.logo }}</span>
    </div>
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
  background: var(--surface-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}
.skill-card:hover {
  background: var(--tag-bg);
  /* [Shadow] 與 project-card 一致：高層陰影 + 上移 3px */
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
}
.skill-card.active {
  background: var(--card-bg);
  border-color: var(--accent-color);
  /* [Shadow] active 狀態使用 md 層級 */
  box-shadow: var(--shadow-md);
}
.skill-logo {
  width: 60px;
  height: 60px;
  background: var(--skill-logo-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  /* [Logo] FA icon 大小 */
  font-size: 1.8rem;
  color: var(--text-muted);
}
/* [Logo] PNG 圖片置中填滿圓形容器 */
.skill-logo img {
  width: 60%;
  height: 60%;
  object-fit: contain;
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
  color: var(--border-color);
  font-size: 1.2rem;
}
.star.filled {
  color: #ffd43b;
}
</style>
