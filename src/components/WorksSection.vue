<script setup>
import { ref, computed } from 'vue'
import { useLikes } from '../composables/useLikes.js'

const props = defineProps({
  projects: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['navigate-to-detail'])

const activeProjectIndex = ref(0)
const activeProject = computed(() => props.projects[activeProjectIndex.value])

const { isLiked, toggleLike: globalToggleLike } = useLikes()

const handleDetailClick = () => {
  emit('navigate-to-detail', activeProject.value.id)
}

const handleToggleLike = () => {
  globalToggleLike(activeProject.value.id)
}

const systemFeeds = ref([
  { time: '09:42', text: 'Syncing repository assets...' },
  { time: '09:20', text: 'Optimizing runtime performance' },
  { time: '10:05', text: 'Lighthouse scan initiated: 100%' },
  { time: '11:30', text: 'Nexus Analytics v2.0 Deployed' }
])
</script>

<template>
  <section class="works-section">
    <h2 class="section-title">Selected Works & Capabilities</h2>
    
    <div class="works-layout">
      <!-- 左側：專案展示卡片 -->
      <div class="project-card">
        <div class="project-image">
          <div class="placeholder-image">Project Image Area</div>
        </div>
        <div class="project-info">
          <div class="tags">
            <span v-for="tag in activeProject.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <h3 class="project-name">{{ activeProject.title }}</h3>
          <div class="project-actions">
            <button @click="handleDetailClick" class="btn btn-details">詳細介紹</button>
            <a :href="activeProject.demoUrl" target="_blank" class="btn btn-demo">Demo</a>
            <button 
              class="btn-like" 
              :class="{ 'is-liked': isLiked(activeProject.id) }" 
              @click="handleToggleLike"
              aria-label="Like project"
            >
              <svg viewBox="0 0 24 24" class="heart-icon">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 右側：系統資訊與分數卡片 -->
      <div class="side-cards">
        <!-- 系統狀態卡片 -->
        <div class="system-feed-card">
          <div class="feed-header">
            <span class="red-dot"></span>
            <span>SYSTEM FEED</span>
          </div>
          <div class="feed-list">
            <div v-for="(feed, index) in systemFeeds" :key="index" class="feed-item">
              <span class="arrow">></span>
              <span class="time">[{{ feed.time }}]</span>
              <span class="text">{{ feed.text }}</span>
            </div>
            <div class="feed-item active">
              <span class="cursor">_</span>
            </div>
          </div>
        </div>

        <!-- 效能分數卡片 -->
        <div class="performance-card">
          <div class="score-icon">💯</div>
          <div class="score-value">100</div>
          <div class="score-label">LIGHTHOUSE PERFORMANCE</div>
        </div>
      </div>

      <!-- 右側邊緣的輪播圓點 -->
      <div class="pagination">
        <span 
          v-for="(project, index) in projects" 
          :key="project.id"
          class="dot" 
          :class="{ active: activeProjectIndex === index }"
          @click="activeProjectIndex = index"
        ></span>
      </div>
    </div>
  </section>
</template>

<style scoped>
* {
   -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.section-title {
  font-size: 2.5rem;
  font-weight: 500;
  margin-bottom: 3rem;
}
.feed-list {
  overflow-y: auto;
  max-height: 150px; /* Adjust as needed */
}
.feed-list::-webkit-scrollbar {
  display: none;
}

.works-layout {
  width: 100%;
  display: grid;
  grid-template-columns: 7fr 3fr auto;
  gap: 2rem;
  align-items: stretch;
  min-height: 600px;
}

/* 左側專案卡片 */
.project-card {
  background: var(--card-bg);
  border-radius: 1.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.project-image {
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #d5cfc6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
}

.project-info {
  align-items: flex-start;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background: #F0F0F0;
  color: #555;
  padding: 0.3rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.project-name {
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.project-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-details {
  background: var(--text-primary);
  color: white;
}
.btn-details:hover {
  background: var(--accent-color);
}
.btn-demo {
  background: #f1f3f5;
  color: var(--text-primary);
  text-decoration: none;
}
.btn-demo:hover {
  background: #e9ecef;
}

/* 愛心按鈕樣式 */
.btn-like {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.btn-like:hover {
  background: rgba(181, 58, 38, 0.1);
}
.btn-like:active {
  transform: scale(0.8);
}
.heart-icon {
  width: 28px;
  height: 28px;
  fill: transparent;
  stroke: var(--text-muted);
  stroke-width: 2;
  transition: all 0.3s ease;
}
.btn-like.is-liked .heart-icon {
  fill: var(--accent-color);
  stroke: var(--accent-color);
  animation: heartPulse 0.4s ease;
}
@keyframes heartPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* 右側卡片容器 */
.side-cards {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.side-cards > div {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
}

/* 系統狀態卡片 */
.system-feed-card {
  background: var(--card-bg);
  border-radius: 1.5rem;
  padding: 2rem;
  flex: 1;
}

.feed-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-color);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
}

.red-dot {
  width: 8px;
  height: 8px;
  background-color: var(--accent-color);
  border-radius: 50%;
}

.feed-item {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.8rem;
  line-height: 1.4;
}

.feed-item .arrow {
  color: #ccc;
  margin-right: 0.5rem;
}

.feed-item .time {
  margin-right: 0.5rem;
}

/* 效能分數卡片 */
.performance-card {
  background-color: var(--accent-color);
  border-radius: 1.5rem;
  padding: 2rem;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.score-value {
  font-size: 3rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.score-label {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  opacity: 0.9;
}

/* 輪播圓點 */
.pagination {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  padding-left: 1rem;
}

.pagination .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid var(--text-muted);
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
}

/* 利用偽元素擴大點擊範圍 (Touch Target) */
.pagination .dot::before {
  content: '';
  position: absolute;
  top: -10px;
  right: -10px;
  bottom: -10px;
  left: -10px;
}

.pagination .dot:hover {
  border-color: var(--accent-color);
}

.pagination .dot.active {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

@media (max-width: 1024px) {
  .works-layout {
    grid-template-columns: 1fr;
  }
  .side-cards {
    flex-direction: row;
  }
  .pagination {
    flex-direction: row;
    padding-left: 0;
    padding-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .side-cards {
    flex-direction: column;
  }
  .side-cards > div {
    flex: none; /* 關鍵：取消均分，讓高度由內容決定 */
    height: auto;
  }
  .project-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  .pagination {
    padding-bottom: 20px;
  }
}
</style>
