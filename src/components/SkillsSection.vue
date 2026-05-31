<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import SkillCard from './SkillCard.vue'

const props = defineProps({
  categories: {
    type: Array,
    required: true
  }
})

const activeCategoryIndex = ref(0)
const currentCategory = computed(() => props.categories[activeCategoryIndex.value])

const activeSkill = ref(currentCategory.value.skills[0])

watch(activeCategoryIndex, () => {
  activeSkill.value = currentCategory.value.skills[0]
})

const selectSkill = (skill) => {
  activeSkill.value = skill
}

// [Feat] 偵測 skills-container 是否已滾動，控制 scroll-hint 的顯示
const isScrolled = ref(false)
const handleScroll = (e) => {
  isScrolled.value = e.target.scrollTop > 0
}

// [GSAP Step I] template refs — 標題與技能卡片容器
const titleRef = ref(null)
const skillListRef = ref(null)

// [GSAP Fix] gsap.context() 追蹤所有動畫，onUnmounted 時統一清除
let gsapCtx = null

onMounted(async () => {
  // [GSAP Fix] nextTick 避免與頁面切換 opacity 動畫疊加造成半透明效果
  await nextTick()

  gsapCtx = gsap.context(() => {
    gsap.from(titleRef.value, {
      opacity: 0, x: -20, duration: 0.45,
      ease: 'power2.out', clearProps: 'all'
    })
    gsap.from(skillListRef.value.children, {
      opacity: 0, y: 10, duration: 0.35,
      stagger: 0.06, delay: 0.1,
      ease: 'power2.out', clearProps: 'all'
    })
  })
})

// [GSAP Fix] 元件卸載時清除所有 tween 與 inline style
onUnmounted(() => gsapCtx?.revert())

const targetSize = computed(() => {
  return 40 + (activeSkill.value.rating * 12) + 'px'
})

const targetColor = computed(() => {
  const colors = {
    1: '#ff6b6b',
    2: '#fca311',
    3: '#ffd166',
    4: '#06d6a0',
    5: '#118ab2'
  }
  return colors[activeSkill.value.rating] || '#ccc'
})
</script>

<template>
  <section class="works-section">
    <h2 class="section-title" ref="titleRef">Skills & Expertise</h2>
    
    <div class="works-layout">
      <!-- 左側：技能列表 -->
      <div class="project-card skills-wrapper">
        <div class="skills-container" @scroll="handleScroll">
          <div class="skills-list" ref="skillListRef">
            <SkillCard
              v-for="skill in currentCategory.skills" 
              :key="skill.id" 
              :skill="skill"
              :isActive="activeSkill.id === skill.id"
              @click="selectSkill(skill)"
            />
          </div> <!-- /skills-list -->
      </div> <!-- /skills-container -->
        
        <!-- 向下滑動提示 -->
        <!-- [Feat] is-hidden class 在使用者滾動後淡出提示 -->
        <div class="scroll-hint" :class="{ 'is-hidden': isScrolled }">
          <span class="bounce-icon">↓</span> Scroll for more
        </div>
      </div>

      <!-- 右側：系統資訊與分數卡片 -->
      <div class="side-cards">
        <!-- 系統狀態卡片 -->
        <div class="system-feed-card">
          <div class="feed-header">
            <span class="red-dot"></span>
            <span>SKILL DETAILS</span>
          </div>
          <div class="feed-list">
            <div class="feed-item active">
              <span class="arrow">></span>
              <span class="text highlight">Target: {{ activeSkill.name }}</span>
            </div>
            <div class="feed-item">
              <span class="arrow">></span>
              <span class="text">{{ activeSkill.description }}</span>
            </div>
            <div class="feed-item active">
              <span class="cursor">_</span>
            </div>
          </div>
        </div>

        <!-- 效能分數卡片 (原型/標靶) -->
        <div class="performance-card">
          <div class="target-container">
            <div class="target-circle" :style="{ width: targetSize, height: targetSize, backgroundColor: targetColor, boxShadow: `0 0 20px ${targetColor}80` }"></div>
            <div class="target-ring ring-1"></div>
            <div class="target-ring ring-2"></div>
            <div class="target-ring ring-3"></div>
          </div>
          <div class="score-value">{{ activeSkill.rating }}/5</div>
          <div class="score-label">PROFICIENCY LEVEL</div>
        </div>
      </div>

      <!-- 右側邊緣的輪播圓點 -->
      <div class="pagination">
        <span 
          v-for="(cat, index) in categories" 
          :key="cat.id"
          class="dot" 
          :class="{ active: activeCategoryIndex === index }"
          @click="activeCategoryIndex = index"
        ></span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 佈局共用 */
.works-section {
  width: 100%;
}
.section-title {
  font-size: 2.5rem;
  font-weight: 500;
  margin-bottom: var(--space-4); /* [Layout] 48px → 32px，與 WorksSection 一致 */
}
.works-layout {
  display: grid;
  grid-template-columns: 7fr 3fr auto;
  gap: var(--space-4);
  align-items: stretch;
  /* [Layout] clamp：最小 380px，視口 55%，上限 480px — 與 WorksSection 一致 */
  min-height: clamp(380px, 55dvh, 480px);
  margin-bottom: var(--space-4);
}

/* 左側：技能容器 Wrapper */
.project-card.skills-wrapper {
  background: var(--card-bg);
  border-radius: 1.5rem;
  overflow: hidden;
  display: flex;
  /* [Shadow] 技能列表卡片 */
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.3s ease;
  flex-direction: column;
  position: relative;
      max-height: 650px;
    height: 100%;
}

.skills-container {
  flex: 1;
  padding: var(--space-3);
  overflow-y: auto; /* 允許向下捲動 */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
  min-height: 0;
}

/* Scroll Hint 動畫與樣式 */
.scroll-hint {
  position: absolute;
  bottom: var(--space-2);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: var(--space-1) var(--space-2);
  border-radius: 2rem;
  font-size: 0.8rem;
  color: var(--accent-color);
  font-weight: bold;
  pointer-events: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  z-index: 10;
  transition: opacity 0.3s ease; /* [Feat] 淡入淡出過渡 */
}
.scroll-hint.is-hidden {
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

/* 自訂捲軸 */
.skills-container::-webkit-scrollbar,
.feed-list::-webkit-scrollbar {
  display: none;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* 右側卡片容器 */
.side-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.side-cards > div {
  flex: 1 1 0; /* 關鍵：讓兩個子元素強迫平分剩餘空間 */
  min-height: 0; /* 關鍵：打破 Flexbox 預設以內容高度為底線的限制 */
  
  /* 如果內容真的太多超過卡片高度，就讓卡片內部自己產生捲軸 */
  overflow-y: auto; 
}

/* 系統狀態卡片 */
.system-feed-card {
  background: var(--card-bg);
  border-radius: 1.5rem;
  padding: var(--space-4);
  flex: 1;
  /* [Shadow] 右側資訊卡 */
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
  flex-shrink: 0;
}
.feed-list {
  flex: 1;
  overflow-y: auto;
  padding-right: var(--space-1);
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
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
  line-height: 1.6;
}
.feed-item .arrow {
  color: #ccc;
  margin-right: var(--space-1);
}
.text.highlight {
  color: var(--text-primary);
  font-weight: bold;
}

/* 效能分數卡片 (標靶) */
.performance-card {
  background-color: #212529; /* 深色背景更能凸顯發光 */
  border-radius: 1.5rem;
  padding: var(--space-4);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
  overflow: hidden;
}
.target-container {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-2);
}
.target-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px dashed rgba(255,255,255,0.2);
}
.ring-1 { width: 120px; height: 120px; }
.ring-2 { width: 80px; height: 80px; }
.ring-3 { width: 40px; height: 40px; }

.target-circle {
  position: absolute;
  border-radius: 50%;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}
.score-value {
  font-size: 2rem;
  font-weight: 700;
  margin: var(--space-1) 0;
  z-index: 2;
}
/* [Shadow] Hover inner glow — 純顯示卡片不位移，只有光暈提示 */
.project-card.skills-wrapper:hover {
  box-shadow: var(--shadow-lg), inset 0 0 20px rgba(181, 58, 38, 0.06);
}
.system-feed-card:hover {
  box-shadow: var(--shadow-lg), inset 0 0 20px rgba(181, 58, 38, 0.06);
}
.performance-card:hover {
  box-shadow: var(--shadow-lg), inset 0 0 20px rgba(255, 255, 255, 0.12);
}

.score-label {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  opacity: 0.9;
  z-index: 2;
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
    max-height: none;
  }
  .project-card.skills-wrapper {
    max-height: 400px; /* Allow scroll on tablet/mobile but not take infinite height */
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
  /* [Fix #8d] 修正縮排，屬性對齊選擇器層級 */
  .side-cards > div {
    flex: 1;
    overflow-y: auto;
  }
  .project-card.skills-wrapper {
    max-height: 350px;
  }
  .pagination {
    padding-bottom: var(--space-3);
  }
}
</style>
