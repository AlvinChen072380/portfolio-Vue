<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useLikes } from '../composables/useLikes.js'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['navigate-back'])

const goBack = () => {
  emit('navigate-back')
}

const { isLiked, toggleLike } = useLikes()

const isProjectLiked = computed(() => isLiked(props.project.id))

const handleToggleLike = () => {
  toggleLike(props.project.id)
}

// [Feat] 偵測 window 捲動狀態，控制 scroll-hint-fixed 的顯示
const isPageScrolled = ref(false)
const handlePageScroll = () => {
  isPageScrolled.value = window.scrollY > 0
}
onMounted(() => window.addEventListener('scroll', handlePageScroll))
onUnmounted(() => window.removeEventListener('scroll', handlePageScroll))
</script>

<template>
  <div class="project-detail-page">
    <button class="back-btn" @click="goBack">← Back to Works</button>
    
    <div class="detail-container">
      <div class="hero-section">
        <div class="title-row">
          <h1 class="project-title">{{ project.title }}</h1>
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
          <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <div class="content-section">
        <div class="main-content">
          <!-- [Part2] 替換為真實大圖 -->
          <div class="project-image-large">
            <img :src="project.image" :alt="project.title" />
          </div>

          <h2>Overview</h2>
          <p>{{ project.overview }}</p>

          <h2>Architecture</h2>
          <p>{{ project.architecture }}</p>
        </div>

        <div class="sidebar">
          <div class="info-card">
            <h3>Role</h3>
            <p>{{ project.role }}</p>

            <h3>Timeline</h3>
            <p>{{ project.timeline }}</p>

            <h3>Links</h3>
            <a :href="project.demoUrl" target="_blank" rel="noopener noreferrer" class="link-btn">Live Demo ↗</a>
            <a :href="project.githubUrl" target="_blank" rel="noopener noreferrer" class="link-btn">GitHub Repo ↗</a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 全域向下滑動提示 [Feat] is-hidden 在使用者滾動後淡出 -->
    <div class="scroll-hint-fixed" :class="{ 'is-hidden': isPageScrolled }">
      <span class="bounce-icon">↓</span> Scroll for more
    </div>
  </div>
</template>

<style scoped>
.project-detail-page {
  padding: var(--space-4) 0;
  /* [UX] 在元件層補強 scrollbar 隱藏
     全域已在 style.css 對 body 設定，此處針對 Windows 環境下
     頁面切換時可能短暫閃現的原生滾動條加上第二層防護 */
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.project-detail-page::-webkit-scrollbar {
  display: none;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: var(--space-4);
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
  padding: var(--space-6);
}

.hero-section {
  margin-bottom: var(--space-6);
  border-bottom: 1px solid #eee;
  padding-bottom: var(--space-4);
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.project-title {
  font-size: 3rem;
  margin: 0;
}

.like-btn {
  background: none;
  border: none;
  font-size: 2.5rem;
  color: #ccc;
  cursor: pointer;
  padding: var(--space-1);
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
  gap: var(--space-1);
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
  gap: var(--space-6);
}

.project-image-large {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 1rem;
  overflow: hidden; /* [Part2] 確保圖片不超出圓角 */
  margin-bottom: var(--space-4);
  background-color: #d5cfc6; /* 圖片載入前的佔位背景色 */
}
/* [Part2] 大圖填滿容器，object-fit: cover 裁切多餘部分保持比例 */
.project-image-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* [Layout] 上方留較大間距區隔段落，下方縮小讓標題與內文視覺貼近 */
.main-content h2 {
  font-size: 1.5rem;
  margin-top: var(--space-3);   /* 32px → 24px，縮減與上段落的距離 */
  margin-bottom: var(--space-1); /* 16px → 8px，標題與內文更緊密 */
  color: var(--accent-color);
}
.main-content p {
  line-height: 1.8;
  color: var(--text-muted);
}

.info-card {
  background: #f8f9fa;
  padding: var(--space-4);
  border-radius: 1rem;
  margin-top: 2rem;
}
.info-card h3 {
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
}
.info-card p {
  color: var(--text-muted);
  margin: 0 0 var(--space-3) 0;
  font-size: 0.95rem;
}

.link-btn {
  display: block;
  padding: var(--space-2);
  background: white;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: var(--space-1);
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
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: var(--space-2) var(--space-3);
  border-radius: 2rem;
  font-size: 0.9rem;
  color: var(--accent-color);
  font-weight: bold;
  pointer-events: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  z-index: 100;
  border: 1px solid rgba(0,0,0,0.05);
  transition: opacity 0.3s ease; /* [Feat] 淡入淡出過渡 */
}
.scroll-hint-fixed.is-hidden {
  opacity: 0; /* [Feat] 使用者開始滾動後淡出，回頂後淡回 */
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
    padding: var(--space-3);
  }
  .project-title {
    font-size: 2rem;
  }
  .content-section {
    gap: var(--space-3);
  }
  .info-card {
    padding: var(--space-3);
  }
}
</style>
