<script setup>
import { computed } from 'vue'
import { useLikes } from '../composables/useLikes.js'

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['navigate-back'])

const goBack = () => {
  emit('navigate-back')
}

// 收藏與愛心功能邏輯使用全域狀態
const { isLiked, toggleLike } = useLikes()

const isProjectLiked = computed(() => isLiked(props.projectId))

const handleToggleLike = () => {
  toggleLike(props.projectId)
}
</script>

<template>
  <div class="project-detail-page">
    <button class="back-btn" @click="goBack">← Back to Works</button>
    
    <div class="detail-container">
      <div class="hero-section">
        <div class="title-row">
          <h1 class="project-title">Project: {{ props.projectId }}</h1>
          <button 
            class="like-btn" 
            :class="{ 'is-liked': isProjectLiked }" 
            @click="handleToggleLike"
            title="Favorite this project"
          >
            <span class="heart-icon">{{ isProjectLiked ? '♥' : '♡' }}</span>
          </button>
        </div>
        <div class="tags">
          <span class="tag">FinTech</span>
          <span class="tag">Web App</span>
        </div>
      </div>
      
      <div class="content-section">
        <div class="main-content">
          <div class="project-image-large">
            <div class="placeholder-image">Project Image Area</div>
          </div>
          
          <h2>Overview</h2>
          <p>
            This is a detailed overview of the Nexus Analytics Dashboard. It describes the problem statement,
            the proposed solution, and the final execution. The project focuses on processing real-time data
            and presenting it in an intuitive manner for financial analysts.
          </p>
          
          <h2>Architecture</h2>
          <p>
            Built with Vue 3, utilizing Composition API and Pinia for state management. The backend is powered
            by Node.js and MongoDB. High-performance charts are rendered using D3.js.
          </p>
        </div>
        
        <div class="sidebar">
          <div class="info-card">
            <h3>Role</h3>
            <p>Lead Frontend Developer</p>
            
            <h3>Timeline</h3>
            <p>3 Months (Q1 2026)</p>
            
            <h3>Links</h3>
            <a href="https://example.com" target="_blank" class="link-btn">Live Demo ↗</a>
            <a href="https://github.com" target="_blank" class="link-btn">GitHub Repo ↗</a>
          </div>
      </div>
    </div>
    </div>
    
    <!-- 全域向下滑動提示 -->
    <div class="scroll-hint-fixed">
      <span class="bounce-icon">↓</span> Scroll for more
    </div>
  </div>
</template>

<style scoped>
.project-detail-page {
  padding: 2rem 0;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 2rem;
  padding: 0;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s;
}
.back-btn:hover {
  color: var(--accent-color);
}

.detail-container {
  background: var(--card-bg);
  border-radius: 1.5rem;
  padding: 3rem;
}

.hero-section {
  margin-bottom: 3rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 2rem;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.project-title {
  font-size: 3rem;
  margin: 0;
  text-transform: capitalize;
}

.like-btn {
  background: none;
  border: none;
  font-size: 2.5rem;
  color: #ccc;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s ease;
  line-height: 1;
}
.like-btn:hover {
  transform: scale(1.1);
}
.like-btn:active {
  transform: scale(0.9);
}
.like-btn.is-liked {
  color: #ff4757; /* 愛心主題色 */
}
.heart-icon {
  margin-top: -0.2rem; /* 微調字體垂直置中 */
}

.tags {
  display: flex;
  gap: 0.5rem;
}
.tag {
  background: #F0F0F0;
  color: #555;
  padding: 0.3rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.content-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
}

.project-image-large {
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #d5cfc6;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  margin-bottom: 2rem;
}

.main-content h2 {
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--accent-color);
}
.main-content p {
  line-height: 1.8;
  color: var(--text-muted);
}

.info-card {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 1rem;
}
.info-card h3 {
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}
.info-card p {
  color: var(--text-muted);
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
}

.link-btn {
  display: block;
  padding: 0.8rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
  text-align: center;
}
.link-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

/* Scroll Hint 動畫與樣式 */
.scroll-hint-fixed {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 0.8rem 1.5rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  color: var(--accent-color);
  font-weight: bold;
  pointer-events: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 100;
  border: 1px solid rgba(0,0,0,0.05);
}

.bounce-icon {
  display: inline-block;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

@media (max-width: 1024px) {
  .content-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .detail-container {
    padding: 1.5rem;
  }
  .project-title {
    font-size: 2rem;
  }
  .content-section {
    gap: 1.5rem;
  }
  .info-card {
    padding: 1.5rem;
  }
}
</style>
