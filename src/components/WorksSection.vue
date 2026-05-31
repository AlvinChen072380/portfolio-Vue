<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { gsap } from "gsap";
import { useLikes } from "../composables/useLikes.js";

const props = defineProps({
  projects: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["navigate-to-detail"]);

const activeProjectIndex = ref(0);
const activeProject = computed(() => props.projects[activeProjectIndex.value]);

const { isLiked, toggleLike: globalToggleLike } = useLikes();

const handleDetailClick = () => {
  emit("navigate-to-detail", activeProject.value.id);
};

const handleToggleLike = () => {
  globalToggleLike(activeProject.value.id);
};

// [Fix #5] 改為讀取當前 project 的 feeds，切換專案時內容跟著更新
const systemFeeds = computed(() => activeProject.value.feeds);

// [GSAP Step H] template refs — 指向要動畫的 DOM 元素
const titleRef = ref(null);
const cardRef = ref(null);

// [GSAP Fix] gsap.context() 追蹤所有動畫，onUnmounted 時統一清除
let gsapCtx = null;

onMounted(async () => {
  // [GSAP Fix] nextTick 避免與頁面切換 opacity 動畫疊加造成半透明效果
  await nextTick();

  gsapCtx = gsap.context(() => {
    // 標題 x 方向不與頁面 y 過渡衝突，保留
    gsap.from(titleRef.value, {
      opacity: 0, x: -20, duration: 0.45,
      ease: "power2.out", clearProps: "all"
    });
    // [Fix] 移除 y 移動 — 頁面切換已提供 y:15 移動感
    // 保留 y 會與頁面過渡疊加，造成卡片可見的「彈跳」
    gsap.from(cardRef.value, {
      opacity: 0, duration: 0.4, delay: 0.15,
      ease: "power2.out", clearProps: "all"
    });
  });
});

// [GSAP Fix] 元件卸載時清除所有 tween 與 inline style
onUnmounted(() => gsapCtx?.revert());
</script>

<template>
  <section class="works-section">
    <h2 class="section-title" ref="titleRef">My side-Projects</h2>

    <div class="works-layout">
      <!-- 左側：專案展示卡片 -->
      <div class="project-card" ref="cardRef">
        <div class="project-image">
          <img :src="activeProject.image" :alt="activeProject.title" />
        </div>
        <div class="project-info">
          <div class="tags">
            <span v-for="tag in activeProject.tags" :key="tag" class="tag">{{
              tag
            }}</span>
          </div>
          <h3 class="project-name">{{ activeProject.title }}</h3>
          <div class="project-actions">
            <button @click="handleDetailClick" class="btn btn-details">
              詳細介紹
            </button>
            <a
              :href="activeProject.demoUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-demo"
              >Demo</a
            >
            <button
              class="btn-like"
              :class="{ 'is-liked': isLiked(activeProject.id) }"
              @click="handleToggleLike"
              aria-label="Like project"
            >
              <svg viewBox="0 0 24 24" class="heart-icon">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
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
            <div
              v-for="(feed, index) in systemFeeds"
              :key="index"
              class="feed-item"
            >
              <span class="arrow">></span>
              <span class="time">[{{ feed.time }}]</span>
              <span class="text">{{ feed.text }}</span>
            </div>
            <div class="feed-item active">
              <span class="cursor">_</span>
            </div>
          </div>
        </div>

        <!-- 效能分數卡片 [Part2] 動態顯示各專案 Lighthouse 分數，null 時顯示錯誤狀態 -->
        <div class="performance-card" :class="{ 'is-error': !activeProject.performance.score }">
          <div class="score-icon">{{ activeProject.performance.score ? 'Score' : '⚠️' }}</div>
          <div class="score-value">{{ activeProject.performance.score ?? '—' }}</div>
          <div class="score-label">{{ activeProject.performance.label }}</div>
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
.section-title {
  font-size: 2.5rem;
  font-weight: 500;
  margin-bottom: var(--space-4); /* [Layout] 48px → 32px，縮減標題與版面的間距 */
}

/* [Fix #4] 滾動條隱藏改為精確選擇器，避免 * 影響所有子元素 */
.feed-list {
  overflow-y: auto;
  max-height: 150px;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.feed-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.works-layout {
  width: 100%;
  display: grid;
  grid-template-columns: 7fr 3fr auto;
  /* [Layout] gap 從 32px 增至 40px：補足欄間視覺呼吸感（測試 6rem 有效但過大，取折衷值）*/
  gap: var(--space-5);
  align-items: stretch;
  /* [Layout] clamp：最小 380px，視口 55%，上限 480px — 自適應螢幕高度 */
  min-height: clamp(380px, 55dvh, 480px);
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
  /* [Layout] 圖片高度上限：防止 7fr 寬欄讓 16/9 圖片超過 260px 高度驅動整體版面 */
  max-height: 460px;
  background-color: #d5cfc6;
  overflow: hidden;
}
/* [Part2] 圖片填滿容器並維持比例，不變形 */
.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.project-info {
  align-items: flex-start;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
}

.tags {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-2);
}

.tag {
  background: #f0f0f0;
  color: #555;
  padding: 0.3rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.project-name {
  font-size: 1.5rem;
  margin: 0 0 var(--space-2) 0;
  font-weight: 500;
}

.project-actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}
.btn {
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none; /* [Fix #6] <a> 標籤在部分瀏覽器預設有底線，需明確覆蓋 */
}
.btn-details {
  background: var(--text-primary);
  color: white;
  width: 300px;
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
  padding: var(--space-1);
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
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

/* 右側卡片容器 */
.side-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
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
  padding: var(--space-4);
  flex: 1;
}

.feed-header {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--accent-color);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
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
  margin-bottom: var(--space-1);
  line-height: 1.4;
}

.feed-item .arrow {
  color: #ccc;
  margin-right: var(--space-1);
}

.feed-item .time {
  margin-right: var(--space-1);
}

/* 效能分數卡片 */
.performance-card {
  background-color: var(--accent-color);
  border-radius: 1.5rem;
  padding: var(--space-4);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease; /* [Part2] 錯誤狀態切換時平滑過渡 */
}
/* [Part2] 分數為 null（如 NO_LCP）時顯示灰色警告狀態 */
.performance-card.is-error {
  background-color: #6c757d;
  flex: 1;
}

.score-value {
  font-size: 3rem;
  font-weight: 700;
  margin: var(--space-1) 0;
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
  gap: var(--space-2);
  padding-left: var(--space-2);
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
  content: "";
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
    min-height: auto; /* [Fix #7] 移除固定最小高度，讓手機版內容決定高度 */
  }
  .side-cards {
    flex-direction: row;
  }
  .pagination {
    flex-direction: row;
    padding-left: 0;
    padding-bottom: var(--space-3);
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
  /* [Fix #7] padding 縮減，手機版卡片更緊湊 */
  .project-info {
    padding: var(--space-3);
  }
  /* [Fix #7] 改回 row 排列：btn 均分寬度，.btn-like 維持緊湊尺寸 */
  .project-actions {
    flex-direction: row;
    gap: var(--space-1);
    width: 100%;
  }
  .project-actions .btn {
    flex: 1;
    text-align: center;
  }
  .pagination {
    padding-bottom: var(--space-3);
  }
}
</style>
