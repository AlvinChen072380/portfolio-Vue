<script setup>
import { gsap } from 'gsap'
import NavBar from './components/NavBar.vue'

// [GSAP Step G] 頁面切換動畫
// :css="false" 關閉 Vue CSS transition，完全交由 GSAP 控制
// mode="out-in" 舊頁完全離場後新頁才進場，避免兩頁同時存在

// [Fix] 移除 y 軸移動：Works 頁面 min-height 600px 超出 viewport
// y 移動會造成可見的版面位移（彈跳感），改為純 opacity 淡入淡出
// 方向性進場感由各元件的 x 軸動畫（標題滑入）負責
const onEnter = (el, done) => {
  gsap.from(el, {
    opacity: 0,
    duration: 0.35,
    ease: 'power2.out',
    onComplete: done
  })
}

const onLeave = (el, done) => {
  gsap.to(el, {
    opacity: 0,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: done
  })
}
</script>

<template>
  <div class="app-container">
    <NavBar />
    <main class="main-content">
      <!-- [GSAP Step G] :key="route.path" 讓 Vue 每次切換路由都視為新元件，確保動畫觸發 -->
      <router-view v-slot="{ Component, route }">
        <Transition :css="false" mode="out-in" @enter="onEnter" @leave="onLeave">
          <component :is="Component" :key="route.path" />
        </Transition>
      </router-view>
    </main>
  </div>
</template>

<style>
/* 全域 CSS 變數定義 */
:root {
  --bg-primary: #EBE4DB;
  --text-primary: #333333;
  --text-muted: #666666;
  --accent-color: #B53A26;
  --accent-hover: #9A301E;
  --card-bg: #FFFFFF;

  /* 8px Spacing System (1rem = 16px) */
  --space-0-5: 0.25rem;  /* 4px */
  --space-1: 0.5rem;     /* 8px */
  --space-2: 1rem;       /* 16px */
  --space-3: 1.5rem;     /* 24px */
  --space-4: 2rem;       /* 32px */
  --space-5: 2.5rem;     /* 40px */
  --space-6: 3rem;       /* 48px */
  --space-8: 4rem;       /* 64px */
  --space-10: 5rem;      /* 80px */
  --space-12: 6rem;      /* 96px */
  --space-16: 8rem;      /* 128px */
}

body {
  
  margin: 0;
  padding: 0;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.app-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-8);
  min-height: 100dvh;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-4);
  /* [Layout] 全站底部統一留白，消除內容貼底的壓迫感 */
  padding-bottom: var(--space-8);
}

@media (max-width: 768px) {
  .app-container {
    padding: 0 var(--space-3);
  }
  .main-content {
    gap: var(--space-8);
    margin-top: var(--space-4);
    padding-bottom: var(--space-6); /* 手機版留白稍小 */
  }
}
</style>
